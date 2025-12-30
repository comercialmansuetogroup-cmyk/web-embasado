/*
  # Habilitar Realtime para production_data
  
  1. Configuración
    - Habilitar realtime en la tabla production_data para actualizaciones en tiempo real
    - Permitir que el dashboard reciba notificaciones cuando Make envíe nuevos datos
  
  2. Notas
    - Esto permite que los cambios se reflejen instantáneamente en el dashboard
    - Funciona para INSERT, UPDATE y DELETE
*/

-- Habilitar realtime en la tabla production_data
ALTER PUBLICATION supabase_realtime ADD TABLE production_data;
