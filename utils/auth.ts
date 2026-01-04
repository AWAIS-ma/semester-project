// Authentication utilities - similar to main.py
import * as Crypto from 'expo-crypto';
import { executeQuery, executeCommand, initDatabase } from '@/database/db';

// Simple password hashing (for demo - in production use bcrypt)
// Note: React Native doesn't have bcrypt, so we'll use a simple hash
// For production, you should use a proper hashing library or backend
export async function hashPassword(password: string): Promise<string> {
  // Simple hash using expo-crypto (for demo purposes)
  // In production, use proper bcrypt or send to backend
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
}

// Verify password
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(plainPassword);
  return hash === hashedPassword;
}

// Check if user exists
async function userExists(username: string, email: string): Promise<{ usernameExists: boolean; emailExists: boolean }> {
  try {
    // Query all users and check in memory (works with any schema)
    const allUsers = await executeQuery<{ id: number; username: string; email: string }>(
      'SELECT id, username, email FROM users'
    );
    
    return {
      usernameExists: allUsers.some(u => u.username === username),
      emailExists: allUsers.some(u => u.email === email),
    };
  } catch (error: any) {
    // If query fails, assume user doesn't exist (safer for signup)
    console.log('userExists query error:', error.message);
    return { usernameExists: false, emailExists: false };
  }
}

// Create user
export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<void> {
  // Ensure database is initialized
  try {
    await initDatabase();
  } catch (error) {
    console.error('Database not ready in createUser:', error);
    throw new Error('Database not ready. Please try again.');
  }

  // Basic email validation
  const emailRegex = /[^@]+@[^@]+\.[^@]+/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address');
  }

  // Check if user already exists before attempting insert
  const exists = await userExists(username, email);
  if (exists.usernameExists) {
    throw new Error('Username already exists');
  }
  if (exists.emailExists) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await hashPassword(password);
  console.log('Creating user:', username, email);

  try {
    // Strategy: Try password column first (standard schema)
    // Only try password_hash if password doesn't exist
    let insertSuccess = false;
    
    // 1. First try password column only (standard schema)
    try {
      await executeCommand(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      insertSuccess = true;
      console.log('User created successfully with password column');
    } catch (passwordError: any) {
      const passwordErrorMsg = passwordError.message || String(passwordError);
      console.log('Password column insert failed:', passwordErrorMsg);
      
      // If password column doesn't exist, try password_hash only
      if (passwordErrorMsg.includes('no such column: password')) {
        try {
          await executeCommand(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
          );
          insertSuccess = true;
          console.log('User created successfully with password_hash column');
        } catch (hashOnlyError: any) {
          console.log('Password_hash only insert failed:', hashOnlyError.message);
          throw passwordError;
        }
      }
      // If password_hash has NOT NULL constraint, try both columns
      else if (passwordErrorMsg.includes('password_hash') && passwordErrorMsg.includes('NOT NULL')) {
        try {
          await executeCommand(
            'INSERT INTO users (username, email, password, password_hash) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, hashedPassword]
          );
          insertSuccess = true;
          console.log('User created successfully with both columns (NOT NULL constraint)');
        } catch (bothError: any) {
          console.log('Both columns insert failed:', bothError.message);
          throw passwordError;
        }
      } else {
        // Other error (like UNIQUE constraint), re-throw
        throw passwordError;
      }
    }
    
    if (!insertSuccess) {
      throw new Error('Failed to insert user into database');
    }
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    console.log('createUser final error:', errorMessage);
    
    // Only throw "user already exists" for UNIQUE constraint errors
    if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('UNIQUE')) {
      if (errorMessage.includes('username')) {
        throw new Error('Username already exists');
      } else if (errorMessage.includes('email')) {
        throw new Error('Email already exists');
      }
      throw new Error('User already exists');
    }
    
    // For other errors, throw the original error message so we can debug
    console.error('Unexpected error in createUser:', error);
    throw new Error(errorMessage || 'Failed to create user');
  }
}

// Login user
export async function loginUser(
  username: string,
  password: string
): Promise<{ id: number; username: string; email: string; xp: number }> {
  // Ensure database is initialized
  try {
    await initDatabase();
  } catch (error) {
    console.error('Database not ready in loginUser:', error);
    throw new Error('Database not ready. Please try again.');
  }

  // Try to get user - check both password and password_hash columns
  let users: Array<{
    id: number;
    username: string;
    email: string;
    password: string;
    xp: number;
  }> = [];
  
  try {
    // ALWAYS try password column first (standard schema)
    // Never query password_hash unless password column doesn't exist
    users = await executeQuery<{
      id: number;
      username: string;
      email: string;
      password: string;
      xp: number;
    }>('SELECT id, username, email, password, COALESCE(xp, 0) as xp FROM users WHERE username = ?', [
      username,
    ]);
    console.log('Login: Found user with password column, count:', users.length);
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.log('Login: password column query failed:', errorMsg);
    
    // ONLY if password column doesn't exist, try password_hash (for very old databases)
    if (errorMsg.includes('no such column: password')) {
      try {
        const hashUsers = await executeQuery<{
          id: number;
          username: string;
          email: string;
          password_hash: string;
          xp: number;
        }>('SELECT id, username, email, password_hash as password, COALESCE(xp, 0) as xp FROM users WHERE username = ?', [
          username,
        ]);
        users = hashUsers.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          password: u.password_hash,
          xp: u.xp || 0,
        }));
        console.log('Login: Found user with password_hash column, count:', users.length);
      } catch (hashError: any) {
        console.log('Login: password_hash query also failed:', hashError.message);
        throw new Error('Incorrect username or password');
      }
    } else {
      // Other error - user not found or other issue
      console.log('Login: User not found or other error');
      throw new Error('Incorrect username or password');
    }
  }

  if (users.length === 0) {
    console.log('No user found with username:', username);
    throw new Error('Incorrect username or password');
  }

  const user = users[0];
  console.log('User found, verifying password...');
  
  if (!user.password) {
    console.log('User has no password stored');
    throw new Error('Incorrect username or password');
  }
  
  const isValid = await verifyPassword(password, user.password);
  console.log('Password verification result:', isValid);

  if (!isValid) {
    throw new Error('Incorrect username or password');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    xp: user.xp || 0,
  };
}

// Get user by ID
export async function getUserById(
  id: number
): Promise<{ id: number; username: string; email: string; xp: number } | null> {
  const users = await executeQuery<{
    id: number;
    username: string;
    email: string;
    xp: number;
  }>('SELECT id, username, email, xp FROM users WHERE id = ?', [id]);

  if (users.length === 0) {
    return null;
  }

  return users[0];
}

