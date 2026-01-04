// Database for native platforms (iOS/Android) - uses SQLite
import * as SQLite from 'expo-sqlite';

// Database file name (same as main.py)
const DB_NAME = 'trivia.db';

// Native SQLite database
let db: SQLite.SQLiteDatabase | null = null;
let dbInitialized = false;
let initPromise: Promise<void> | null = null;

function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  if (!dbInitialized) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Initialize database - creates tables if they don't exist
// Same logic as main.py - handles migrations for existing databases
export function initDatabase(): Promise<void> {
  // Return existing promise if initialization is in progress
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = new Promise((resolve, reject) => {
    try {
      // Open database first
      if (!db) {
        db = SQLite.openDatabaseSync(DB_NAME);
      }
      const database = db;
      
      // Check if table exists (same as main.py)
      const tableCheck = database.getAllSync(
        "SELECT count(name) as count FROM sqlite_master WHERE type='table' AND name='users'"
      );
      
      const tableExists = tableCheck.length > 0 && (tableCheck[0] as any).count > 0;
      
      if (!tableExists) {
        // Create new table with all columns (only password, no password_hash)
        database.execSync(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            xp INTEGER DEFAULT 0
          );
        `);
        console.log('Users table created with password column');
      } else {
        // Table exists - check and fix columns (migration like main.py)
        try {
          // Check if email column exists
          database.getAllSync('SELECT email FROM users LIMIT 1');
        } catch (error: any) {
          // Email column doesn't exist, add it
          if (error.message?.includes('no such column: email')) {
            try {
              database.execSync("ALTER TABLE users ADD COLUMN email TEXT");
              console.log('Added email column to users table');
            } catch (alterError) {
              console.log('Email column may already exist or constraint issue');
            }
          }
        }
        
        // Check for password column and ensure it exists
        let hasPassword = false;
        let hasPasswordHash = false;
        let passwordHashNotNull = false;
        
        // Check if password column exists
        try {
          database.getAllSync('SELECT password FROM users LIMIT 1');
          hasPassword = true;
          console.log('Found password column');
        } catch (error: any) {
          // password doesn't exist, need to add it
          console.log('Password column not found, will add it');
        }
        
        // Check if password_hash column exists (for migration from old schema)
        try {
          database.getAllSync('SELECT password_hash FROM users LIMIT 1');
          hasPasswordHash = true;
          console.log('Found password_hash column (old schema)');
          
          // Try to insert a test value to check if NOT NULL constraint exists
          // We'll check the table schema instead
          const tableInfo = database.getAllSync("PRAGMA table_info(users)");
          const passwordHashColumn = tableInfo.find((col: any) => col.name === 'password_hash');
          if (passwordHashColumn && passwordHashColumn.notnull === 1) {
            passwordHashNotNull = true;
            console.log('password_hash has NOT NULL constraint');
          }
        } catch (error: any) {
          // password_hash doesn't exist (new schema)
        }
        
        // Migration logic: ensure password column exists
        if (!hasPassword) {
          try {
            database.execSync("ALTER TABLE users ADD COLUMN password TEXT DEFAULT ''");
            console.log('Added password column to users table');
            
            // If password_hash exists, copy data to password
            if (hasPasswordHash) {
              try {
                database.execSync("UPDATE users SET password = password_hash WHERE password IS NULL OR password = ''");
                console.log('Migrated data from password_hash to password column');
              } catch (migrateError: any) {
                console.log('Migration data copy issue:', migrateError.message);
              }
            }
          } catch (alterError: any) {
            // Column might already exist or other constraint issue
            console.log('Password column add issue:', alterError.message);
          }
        } else if (hasPassword && hasPasswordHash) {
          // Both exist, ensure password has data from password_hash where needed
          try {
            database.execSync("UPDATE users SET password = password_hash WHERE password IS NULL OR password = ''");
            console.log('Synced password from password_hash where needed');
          } catch (syncError: any) {
            console.log('Password sync issue:', syncError.message);
          }
        }
        
        // Log schema state for debugging
        if (passwordHashNotNull) {
          console.log('WARNING: password_hash has NOT NULL constraint - createUser will insert into both columns');
        }
        
        try {
          // Check if xp column exists
          database.getAllSync('SELECT xp FROM users LIMIT 1');
        } catch (error: any) {
          // XP column doesn't exist, add it
          if (error.message?.includes('no such column: xp')) {
            try {
              database.execSync('ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0');
              console.log('Added xp column to users table');
            } catch (alterError) {
              console.log('XP column may already exist');
            }
          }
        }
      }
      
      dbInitialized = true;
      console.log('Database initialized successfully (native)');
      resolve();
    } catch (error) {
      console.error('Database initialization error:', error);
      dbInitialized = false;
      initPromise = null;
      reject(error);
    }
  });
  
  return initPromise;
}

// Helper function to run SQL queries (SELECT)
export function executeQuery<T>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      if (!dbInitialized) {
        reject(new Error('Database not initialized'));
        return;
      }
      const database = getDatabase();
      const result = database.getAllSync(query, params);
      resolve(result as T[]);
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
  return new Promise((resolve, reject) => {
    try {
      if (!dbInitialized) {
        reject(new Error('Database not initialized'));
        return;
      }
      const database = getDatabase();
      database.runSync(query, params);
      resolve();
    } catch (error) {
      console.error('Command error:', error);
      reject(error);
    }
  });
}

