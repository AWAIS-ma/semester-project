// Database for web platform - uses AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
const STORAGE_KEY = '@trivia_users';

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  xp: number;
}

// Initialize database - creates storage if it doesn't exist
export function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (!data) {
          // Initialize with empty array
          return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
      })
      .then(() => {
        console.log('Database initialized successfully (web)');
        resolve();
      })
      .catch(reject);
  });
}

// Get all users from AsyncStorage
async function getWebUsers(): Promise<User[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save users to AsyncStorage
async function saveWebUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Helper function to run SQL queries (SELECT)
export function executeQuery<T>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await getWebUsers();
      
      // Simple query parsing for web
      if (query.includes('SELECT') && query.includes('FROM users')) {
        let results = users as any[];
        
        // Handle WHERE clause
        if (query.includes('WHERE username = ?')) {
          results = users.filter((u) => u.username === params[0]);
        } else if (query.includes('WHERE id = ?')) {
          results = users.filter((u) => u.id === params[0]);
        } else if (query.includes('ORDER BY xp DESC LIMIT')) {
          // Leaderboard query
          results = users
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 100)
            .map((u) => ({ username: u.username, xp: u.xp }));
        } else if (query.includes('SELECT xp FROM users WHERE id = ?')) {
          results = users
            .filter((u) => u.id === params[0])
            .map((u) => ({ xp: u.xp }));
        } else if (query.includes('SELECT id, username, xp, email FROM users WHERE username = ?')) {
          results = users
            .filter((u) => u.username === params[0])
            .map((u) => ({ id: u.id, username: u.username, xp: u.xp, email: u.email }));
        } else if (query.includes('SELECT username, password FROM users WHERE username = ?')) {
          results = users
            .filter((u) => u.username === params[0])
            .map((u) => ({ username: u.username, password: u.password }));
        }
        
        resolve(results as T[]);
      } else {
        resolve([]);
      }
    } catch (error) {
      console.error('Query error:', error);
      reject(error);
    }
  });
}

// Helper function to run SQL commands (INSERT, UPDATE, DELETE)
export function executeCommand(
  query: string,
  params: any[] = []
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await getWebUsers();
      
      if (query.includes('INSERT INTO users')) {
        // Insert new user - check for UNIQUE constraints
        const username = params[0];
        const email = params[1];
        
        // Check if username already exists
        if (users.some((u) => u.username === username)) {
          const error: any = new Error('UNIQUE constraint failed: username');
          error.message = 'UNIQUE constraint failed: username';
          throw error;
        }
        
        // Check if email already exists
        if (users.some((u) => u.email === email)) {
          const error: any = new Error('UNIQUE constraint failed: email');
          error.message = 'UNIQUE constraint failed: email';
          throw error;
        }
        
        const newUser: User = {
          id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
          username: username,
          email: email,
          password: params[2],
          xp: 0,
        };
        users.push(newUser);
        await saveWebUsers(users);
      } else if (query.includes('UPDATE users SET xp = ? WHERE id = ?')) {
        // Update XP
        const userId = params[1];
        const newXp = params[0];
        const userIndex = users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].xp = newXp;
          await saveWebUsers(users);
        }
      }
      resolve();
    } catch (error) {
      console.error('Command error:', error);
      reject(error);
    }
  });
}

