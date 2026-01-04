// Database module with platform-specific implementations
// Uses conditional requires to avoid bundling expo-sqlite on web
import { Platform } from 'react-native';

// Import platform-specific implementations
const dbWeb = require('./db.web');
const dbNative = require('./db.native');

// Select the correct implementation based on platform
const dbModule = Platform.OS === 'web' ? dbWeb : dbNative;

// Export the functions with proper typing
export function initDatabase(): Promise<void> {
  return dbModule.initDatabase();
}

export function executeQuery<T>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  return dbModule.executeQuery<T>(query, params);
}

export function executeCommand(
  query: string,
  params: any[] = []
): Promise<void> {
  return dbModule.executeCommand(query, params);
}
