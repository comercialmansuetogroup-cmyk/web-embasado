/*
  # Enhanced Production Tracking System

  ## Overview
  This migration adds comprehensive features for production tracking including:
  - Historical data with better indexing
  - Daily goals and targets per zone
  - Production statistics and comparisons
  - Alert thresholds and notifications

  ## New Tables

  ### `production_goals`
  Stores daily production targets for each zone
  - `id` (uuid, primary key)
  - `zone_name` (text) - Name of the production zone
  - `date` (date) - Target date
  - `target_quantity` (integer) - Daily production goal
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `production_history`
  Stores detailed historical production data
  - `id` (uuid, primary key)
  - `date` (date) - Production date
  - `zone_name` (text) - Zone identifier
  - `product_code` (text) - Product code
  - `quantity` (integer) - Quantity produced
  - `hour` (integer) - Hour of day (0-23) for hourly tracking
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `alert_thresholds`
  Configurable alert thresholds for production monitoring
  - `id` (uuid, primary key)
  - `zone_name` (text) - Zone identifier
  - `min_threshold` (integer) - Minimum production threshold
  - `max_threshold` (integer) - Maximum production threshold
  - `alert_enabled` (boolean) - Whether alerts are active
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Changes to Existing Tables

  ### `production_data`
  - Added index on `fecha` for faster historical queries
  - Added index on `created_at` for time-based sorting

  ## Security
  - Enable RLS on all new tables
  - Add policies for authenticated access to read data
  - Add policies for service role to write data

  ## Indexes
  - Composite indexes for common query patterns
  - Date-based indexes for historical analysis
*/

-- Add indexes to existing production_data table
CREATE INDEX IF NOT EXISTS idx_production_data_fecha 
  ON production_data(fecha DESC);

CREATE INDEX IF NOT EXISTS idx_production_data_created_at 
  ON production_data(created_at DESC);

-- Create production_goals table
CREATE TABLE IF NOT EXISTS production_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL,
  date date NOT NULL,
  target_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(zone_name, date)
);

ALTER TABLE production_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to goals"
  ON production_goals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to manage goals"
  ON production_goals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_production_goals_date 
  ON production_goals(date DESC);

CREATE INDEX IF NOT EXISTS idx_production_goals_zone_date 
  ON production_goals(zone_name, date DESC);

-- Create production_history table
CREATE TABLE IF NOT EXISTS production_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  zone_name text NOT NULL,
  product_code text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  hour integer CHECK (hour >= 0 AND hour <= 23),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE production_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to history"
  ON production_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to manage history"
  ON production_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_production_history_date 
  ON production_history(date DESC);

CREATE INDEX IF NOT EXISTS idx_production_history_zone_date 
  ON production_history(zone_name, date DESC);

CREATE INDEX IF NOT EXISTS idx_production_history_zone_date_hour 
  ON production_history(zone_name, date DESC, hour DESC);

-- Create alert_thresholds table
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text UNIQUE NOT NULL,
  min_threshold integer NOT NULL DEFAULT 0,
  max_threshold integer NOT NULL DEFAULT 99999,
  alert_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to thresholds"
  ON alert_thresholds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to manage thresholds"
  ON alert_thresholds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_production_goals_updated_at'
  ) THEN
    CREATE TRIGGER update_production_goals_updated_at
      BEFORE UPDATE ON production_goals
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_production_history_updated_at'
  ) THEN
    CREATE TRIGGER update_production_history_updated_at
      BEFORE UPDATE ON production_history
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_alert_thresholds_updated_at'
  ) THEN
    CREATE TRIGGER update_alert_thresholds_updated_at
      BEFORE UPDATE ON alert_thresholds
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;