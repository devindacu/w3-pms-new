import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { createWriteStream, createReadStream } from 'fs';
import { promisify } from 'util';
import { pipeline, Readable } from 'stream';
import { createGzip, createGunzip } from 'zlib';
import * as fs from 'fs/promises';
import * as path from 'path';

const pipelineAsync = promisify(pipeline);

export interface BackupOptions {
  includeAuditLogs?: boolean;
  includeSystemSettings?: boolean;
  compress?: boolean;
  location?: string;
}

export interface RestoreOptions {
  skipExisting?: boolean;
  validateData?: boolean;
}

export class BackupService {
  private backupDir: string;

  constructor(backupDir: string = '/tmp/backups') {
    this.backupDir = backupDir;
  }

  async createFullBackup(createdBy: string, options: BackupOptions = {}): Promise<string> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-full-${timestamp}.json${options.compress ? '.gz' : ''}`;
    const filePath = path.join(options.location || this.backupDir, fileName);

    try {
      // Ensure backup directory exists
      await fs.mkdir(options.location || this.backupDir, { recursive: true });

      // Log backup start
      const backupRecord = await db.insert(schema.systemBackups).values({
        backupType: 'full',
        fileName,
        status: 'in-progress',
        location: filePath,
        createdBy
      }).returning();

      const backupId = backupRecord[0].id;

      // Collect all data
      const data = await this.collectAllData(options);
      
      // Count records
      let recordCount = 0;
      const tablesIncluded: string[] = [];
      for (const [table, records] of Object.entries(data)) {
        if (Array.isArray(records)) {
          recordCount += records.length;
          tablesIncluded.push(table);
        }
      }

      // Write data to file
      const jsonData = JSON.stringify(data, null, 2);
      
      if (options.compress) {
        const gzip = createGzip();
        const readable = Readable.from(Buffer.from(jsonData));
        await pipelineAsync(
          readable,
          gzip,
          createWriteStream(filePath)
        );
      } else {
        await fs.writeFile(filePath, jsonData);
      }

      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      // Update backup record
      await db.update(schema.systemBackups)
        .set({
          status: 'completed',
          fileSize,
          recordCount,
          tablesIncluded: JSON.stringify(tablesIncluded),
          completedAt: new Date()
        })
        .where(eq(schema.systemBackups.id, backupId));

      return filePath;
    } catch (error) {
      console.error('Backup error:', error);
      throw error;
    }
  }

  async restoreFromBackup(filePath: string, options: RestoreOptions = {}): Promise<void> {
    try {
      let jsonData: string;

      // Read and decompress if needed
      if (filePath.endsWith('.gz')) {
        const chunks: Buffer[] = [];
        const gunzip = createGunzip();
        
        const stream = createReadStream(filePath);
        stream.pipe(gunzip);
        
        for await (const chunk of gunzip) {
          chunks.push(chunk);
        }
        
        jsonData = Buffer.concat(chunks).toString();
      } else {
        jsonData = await fs.readFile(filePath, 'utf-8');
      }

      const data = JSON.parse(jsonData);

      // Restore data in order (to respect foreign key constraints)
      const restoreOrder = [
        'guests',
        'rooms',
        'employees',
        'systemUsers',
        'suppliers',
        'accounts',
        'reservations',
        'folios',
        'inventoryItems',
        'housekeepingTasks',
        'menuItems',
        'orders',
        'extraServiceCategories',
        'extraServices',
        'shifts',
        'amenities',
        'maintenanceRequests',
        'systemSettings',
        'transactions',
        'recipes',
        'recipeIngredients',
        'rateCalendar',
        'channels',
        'channelBookings',
        'channelSyncLogs',
        'auditLogs'
      ];

      for (const tableName of restoreOrder) {
        if (data[tableName] && Array.isArray(data[tableName])) {
          await this.restoreTable(tableName, data[tableName], options);
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  }

  private async collectAllData(options: BackupOptions): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {};

    // Core tables
    data.guests = await db.select().from(schema.guests);
    data.rooms = await db.select().from(schema.rooms);
    data.reservations = await db.select().from(schema.reservations);
    data.folios = await db.select().from(schema.folios);
    data.inventoryItems = await db.select().from(schema.inventoryItems);
    data.housekeepingTasks = await db.select().from(schema.housekeepingTasks);
    data.menuItems = await db.select().from(schema.menuItems);
    data.orders = await db.select().from(schema.orders);
    data.suppliers = await db.select().from(schema.suppliers);
    data.employees = await db.select().from(schema.employees);
    data.accounts = await db.select().from(schema.accounts);
    data.systemUsers = await db.select().from(schema.systemUsers);
    data.extraServiceCategories = await db.select().from(schema.extraServiceCategories);
    data.extraServices = await db.select().from(schema.extraServices);
    data.shifts = await db.select().from(schema.shifts);
    data.amenities = await db.select().from(schema.amenities);
    data.maintenanceRequests = await db.select().from(schema.maintenanceRequests);
    data.transactions = await db.select().from(schema.transactions);
    data.recipes = await db.select().from(schema.recipes);
    data.recipeIngredients = await db.select().from(schema.recipeIngredients);
    data.rateCalendar = await db.select().from(schema.rateCalendar);
    data.channels = await db.select().from(schema.channels);
    data.channelBookings = await db.select().from(schema.channelBookings);
    data.channelSyncLogs = await db.select().from(schema.channelSyncLogs);

    if (options.includeSystemSettings) {
      data.systemSettings = await db.select().from(schema.systemSettings);
      data.systemVersions = await db.select().from(schema.systemVersions);
    }

    if (options.includeAuditLogs) {
      data.auditLogs = await db.select().from(schema.auditLogs);
    }

    return data;
  }

  private async restoreTable(tableName: string, records: any[], options: RestoreOptions): Promise<void> {
    if (!records || records.length === 0) return;

    const table = (schema as any)[tableName];
    if (!table) {
      console.warn(`Table ${tableName} not found in schema`);
      return;
    }

    try {
      for (const record of records) {
        try {
          if (options.skipExisting && record.id) {
            const existing = await db.select()
              .from(table)
              .where(eq(table.id, record.id))
              .limit(1);
            
            if (existing.length > 0) {
              continue; // Skip existing records
            }
          }

          await db.insert(table).values(record);
        } catch (error) {
          console.error(`Error restoring record in ${tableName}:`, error);
          // Continue with next record
        }
      }
    } catch (error) {
      console.error(`Error restoring table ${tableName}:`, error);
      throw error;
    }
  }

  async listBackups(): Promise<any[]> {
    return await db.select().from(schema.systemBackups);
  }

  async deleteBackup(backupId: number): Promise<void> {
    const backup = await db.query.systemBackups.findFirst({
      where: eq(schema.systemBackups.id, backupId)
    });

    if (backup && backup.location) {
      try {
        await fs.unlink(backup.location);
      } catch (error) {
        console.error('Error deleting backup file:', error);
      }
    }

    await db.delete(schema.systemBackups).where(eq(schema.systemBackups.id, backupId));
  }
}
