/*
  # Create Aggregated Production System

  1. New Tables
    - `aggregated_production_data`
      - `id` (uuid, primary key)
      - `fecha` (date, unique index)
      - `productos` (jsonb array) - Productos agrupados por nombre+gramaje
        Estructura: [{"nombre": "Burrata 100g", "cantidad": 150}, ...]
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `aggregated_production_history`
      - `id` (uuid, primary key)
      - `date` (date)
      - `product_name` (text) - Ej: "Burrata 100g"
      - `quantity` (integer)
      - `hour` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (production dashboard is public)

  3. Notes
    - This is a separate system for aggregated product view
    - Groups products by type + weight (e.g., all Burrata 100g together)
    - Multiplies by packaging factor (3x, 8x, etc.) automatically
*/

-- Create aggregated production data table
CREATE TABLE IF NOT EXISTS aggregated_production_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date UNIQUE NOT NULL,
  productos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create aggregated production history table
CREATE TABLE IF NOT EXISTS aggregated_production_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  hour integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_aggregated_production_data_fecha 
  ON aggregated_production_data(fecha DESC);

CREATE INDEX IF NOT EXISTS idx_aggregated_production_history_date 
  ON aggregated_production_history(date DESC);

CREATE INDEX IF NOT EXISTS idx_aggregated_production_history_product 
  ON aggregated_production_history(product_name, date);

-- Enable RLS
ALTER TABLE aggregated_production_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_production_history ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to aggregated production data"
  ON aggregated_production_data
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to aggregated production history"
  ON aggregated_production_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role full access for edge function
CREATE POLICY "Service role full access to aggregated production data"
  ON aggregated_production_data
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to aggregated production history"
  ON aggregated_production_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
