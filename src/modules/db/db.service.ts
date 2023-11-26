import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DBService {
  private readonly logger = new Logger(DBService.name);
  constructor(private readonly dataSource: DataSource) {}
  async checkDBConnection(): Promise<void> {
    try {
      const testQuery = `
        SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA') AS "schema_name" FROM dual
      `;

      const schemaData = await this.dataSource.query(testQuery);
      this.logger.log('Schema data:', schemaData);
      console.log('Connect to DB success!!!');
    } catch (error) {
      this.logger.error('Error checking database connection:', error);
    }
  }
}
