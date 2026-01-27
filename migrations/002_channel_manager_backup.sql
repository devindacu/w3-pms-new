-- Add new tables for channel manager and backup functionality

-- Channel bookings table
CREATE TABLE IF NOT EXISTS channel_bookings (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER REFERENCES channels(id),
  reservation_id INTEGER REFERENCES reservations(id),
  external_booking_id VARCHAR(100),
  channel_name VARCHAR(50) NOT NULL,
  guest_name VARCHAR(200),
  guest_email VARCHAR(255),
  room_type VARCHAR(100),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_amount DECIMAL(12, 2),
  commission DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'confirmed',
  sync_status VARCHAR(50) DEFAULT 'synced',
  raw_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Channel sync logs table
CREATE TABLE IF NOT EXISTS channel_sync_logs (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER REFERENCES channels(id),
  channel_name VARCHAR(50) NOT NULL,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration INTEGER
);

-- System backups table
CREATE TABLE IF NOT EXISTS system_backups (
  id SERIAL PRIMARY KEY,
  backup_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  status VARCHAR(20) NOT NULL,
  tables_included TEXT,
  record_count INTEGER,
  location TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Data sync queue table
CREATE TABLE IF NOT EXISTS data_sync_queue (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  operation VARCHAR(20) NOT NULL,
  data TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_bookings_channel_id ON channel_bookings(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_bookings_reservation_id ON channel_bookings(reservation_id);
CREATE INDEX IF NOT EXISTS idx_channel_bookings_external_id ON channel_bookings(external_booking_id);
CREATE INDEX IF NOT EXISTS idx_channel_bookings_channel_name ON channel_bookings(channel_name);
CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_channel_id ON channel_sync_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_status ON channel_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_backups_status ON system_backups(status);
CREATE INDEX IF NOT EXISTS idx_data_sync_queue_status ON data_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_data_sync_queue_entity ON data_sync_queue(entity_type, entity_id);
