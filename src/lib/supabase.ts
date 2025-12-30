import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProductData {
  codigo: string;
  nombre: string;
  cantidad: number;
}

export interface ZoneData {
  nombre: string;
  productos: ProductData[];
}

export interface ProductionData {
  fecha: string;
  zonas: ZoneData[];
}

export interface ProductionGoal {
  id: string;
  zone_name: string;
  date: string;
  target_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionHistory {
  id: string;
  date: string;
  zone_name: string;
  product_code: string;
  quantity: number;
  hour: number | null;
  created_at: string;
  updated_at: string;
}

export interface AlertThreshold {
  id: string;
  zone_name: string;
  min_threshold: number;
  max_threshold: number;
  alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AggregatedProductionData {
  id: number;
  description: string;
  total_quantity: number;
  last_updated: string;
}
