-- Migration: 001_initial
-- Date: 2026-01-19
-- Description: Initial database schema with settings and version tracking

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  category VARCHAR(100),
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  description TEXT,
  migration_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  menu_item_id TEXT,
  name VARCHAR(200) NOT NULL,
  instructions TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id),
  inventory_item_id TEXT,
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_calendar (
  id SERIAL PRIMARY KEY,
  room_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  availability INTEGER DEFAULT 0,
  min_stay INTEGER DEFAULT 1,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  connection_details TEXT,
  commission DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id TEXT,
  action VARCHAR(20) NOT NULL,
  old_values TEXT,
  new_values TEXT,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  account_id TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  transaction_date DATE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO system_versions (version, description, migration_type)
SELECT '1.0.0', 'Initial database schema with settings and version tracking', 'initial'
WHERE NOT EXISTS (SELECT 1 FROM system_versions WHERE version = '1.0.0');
