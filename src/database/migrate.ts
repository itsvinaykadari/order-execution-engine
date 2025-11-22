import { readFileSync } from 'fs';
import { join } from 'path';
import { database } from './connection';
import { logger } from '../utils/logger';

export async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');
    
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    await database.query(schema);
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error({ error }, 'Migration failed');
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, 'Migration script failed');
      process.exit(1);
    });
}
