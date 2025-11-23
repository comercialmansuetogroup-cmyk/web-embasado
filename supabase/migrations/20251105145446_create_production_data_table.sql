/*
  # Production Data Table

  1. New Tables
    - `production_data`
      - `id` (uuid, primary key) - Unique identifier
      - `fecha` (date, not null) - Production date
      - `zonas` (jsonb, not null) - JSON array with zones and products data
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated
  
  2. Security
    - Enable RLS on `production_data` table
    - Add policy for public read access (for kiosk mode TV)
    - Add policy for public insert/update (to receive data from Make.com)
  
  3. Notes
    - We keep only the latest production data
    - The app will always fetch the most recent record
    - Make.com will insert new records via the public API
*/

CREATE TABLE IF NOT EXISTS production_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  zonas jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE production_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the TV display
CREATE POLICY "Allow public read access"
  ON production_data
  FOR SELECT
  TO anon
  USING (true);

-- Allow public insert for Make.com integration
CREATE POLICY "Allow public insert"
  ON production_data
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index on fecha for faster queries
CREATE INDEX IF NOT EXISTS idx_production_data_fecha ON production_data(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_production_data_created_at ON production_data(created_at DESC);