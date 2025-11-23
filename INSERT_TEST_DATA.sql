-- SCRIPT DE PRUEBA - NO EJECUTAR EN PRODUCCIÓN
-- Este script inserta datos de prueba para testing del sistema de producción
-- Los datos se generan para los últimos 30 días con variaciones realistas
-- Islas: Gran Canaria (local), Tenerife, Lanzarote, La Palma
-- Productos reales de quesos y derivados lácteos
-- NOTA: La producción se fabrica en conjunto para todas las islas

-- NOTA IMPORTANTE: Este script debe ejecutarse MANUALMENTE solo para pruebas
-- NO incluir en el sistema de migraciones automáticas

DO $$
DECLARE
  test_date DATE;
  day_offset INT;
  hour_val INT;
  isla_name TEXT;
  product_code TEXT;
  quantity_val INT;
  products_array TEXT[];
  product_idx INT;
BEGIN
  -- Generar datos para los últimos 30 días
  FOR day_offset IN 0..30 LOOP
    test_date := CURRENT_DATE - day_offset;

    -- GRAN CANARIA (local) - Burrata y Mozzarella (prioridad)
    products_array := ARRAY['BUR1', 'BUR2', 'BUR3', 'MOZ24', 'MOZ25', 'MOZ26', 'MOZ27'];
    FOREACH product_code IN ARRAY products_array LOOP
      quantity_val := 150 + (RANDOM() * 200)::INT;
      FOR hour_val IN 8..18 LOOP
        INSERT INTO production_history (date, zone_name, product_code, quantity, hour)
        VALUES (
          test_date,
          'Gran Canaria',
          product_code,
          (quantity_val / 10) + (RANDOM() * 30)::INT,
          hour_val
        );
      END LOOP;
    END LOOP;

    -- TENERIFE - Cacciotta y Ricotta
    products_array := ARRAY['CAC1', 'CAC2', 'CAC3', 'CAC6', 'RIC1', 'RIC2'];
    FOREACH product_code IN ARRAY products_array LOOP
      quantity_val := 130 + (RANDOM() * 180)::INT;
      FOR hour_val IN 8..18 LOOP
        INSERT INTO production_history (date, zone_name, product_code, quantity, hour)
        VALUES (
          test_date,
          'Tenerife',
          product_code,
          (quantity_val / 10) + (RANDOM() * 25)::INT,
          hour_val
        );
      END LOOP;
    END LOOP;

    -- LANZAROTE - Mantequilla y Marscarpone
    products_array := ARRAY['MAN1', 'MAN3', 'MAN5', 'MAR1', 'MAR3'];
    FOREACH product_code IN ARRAY products_array LOOP
      quantity_val := 110 + (RANDOM() * 160)::INT;
      FOR hour_val IN 8..18 LOOP
        INSERT INTO production_history (date, zone_name, product_code, quantity, hour)
        VALUES (
          test_date,
          'Lanzarote',
          product_code,
          (quantity_val / 10) + (RANDOM() * 22)::INT,
          hour_val
        );
      END LOOP;
    END LOOP;

    -- LA PALMA - Productos especiales y Mozzarella adicional
    products_array := ARRAY['MOZ28', 'MOZ29', 'MOZ30', 'BUR10', 'BUR11'];
    FOREACH product_code IN ARRAY products_array LOOP
      quantity_val := 120 + (RANDOM() * 150)::INT;
      FOR hour_val IN 8..18 LOOP
        INSERT INTO production_history (date, zone_name, product_code, quantity, hour)
        VALUES (
          test_date,
          'La Palma',
          product_code,
          (quantity_val / 10) + (RANDOM() * 20)::INT,
          hour_val
        );
      END LOOP;
    END LOOP;

    -- Crear registro aggregado en production_data para cada día
    INSERT INTO production_data (fecha, zonas, updated_at)
    VALUES (
      test_date,
      jsonb_build_array(
        jsonb_build_object(
          'nombre', 'Gran Canaria',
          'productos', jsonb_build_array(
            jsonb_build_object('codigo', 'BUR1', 'cantidad', 220 + (day_offset * 5) % 150),
            jsonb_build_object('codigo', 'BUR2', 'cantidad', 180 + (day_offset * 7) % 130),
            jsonb_build_object('codigo', 'BUR3', 'cantidad', 195 + (day_offset * 4) % 140),
            jsonb_build_object('codigo', 'MOZ24', 'cantidad', 250 + (day_offset * 8) % 180),
            jsonb_build_object('codigo', 'MOZ25', 'cantidad', 230 + (day_offset * 6) % 160),
            jsonb_build_object('codigo', 'MOZ26', 'cantidad', 210 + (day_offset * 9) % 170),
            jsonb_build_object('codigo', 'MOZ27', 'cantidad', 240 + (day_offset * 5) % 175)
          )
        ),
        jsonb_build_object(
          'nombre', 'Tenerife',
          'productos', jsonb_build_array(
            jsonb_build_object('codigo', 'CAC1', 'cantidad', 190 + (day_offset * 6) % 145),
            jsonb_build_object('codigo', 'CAC2', 'cantidad', 175 + (day_offset * 7) % 135),
            jsonb_build_object('codigo', 'CAC3', 'cantidad', 200 + (day_offset * 5) % 150),
            jsonb_build_object('codigo', 'CAC6', 'cantidad', 185 + (day_offset * 8) % 140),
            jsonb_build_object('codigo', 'RIC1', 'cantidad', 165 + (day_offset * 9) % 125),
            jsonb_build_object('codigo', 'RIC2', 'cantidad', 170 + (day_offset * 4) % 130)
          )
        ),
        jsonb_build_object(
          'nombre', 'Lanzarote',
          'productos', jsonb_build_array(
            jsonb_build_object('codigo', 'MAN1', 'cantidad', 155 + (day_offset * 7) % 120),
            jsonb_build_object('codigo', 'MAN3', 'cantidad', 145 + (day_offset * 6) % 115),
            jsonb_build_object('codigo', 'MAN5', 'cantidad', 160 + (day_offset * 8) % 125),
            jsonb_build_object('codigo', 'MAR1', 'cantidad', 140 + (day_offset * 5) % 110),
            jsonb_build_object('codigo', 'MAR3', 'cantidad', 150 + (day_offset * 9) % 120)
          )
        ),
        jsonb_build_object(
          'nombre', 'La Palma',
          'productos', jsonb_build_array(
            jsonb_build_object('codigo', 'MOZ28', 'cantidad', 180 + (day_offset * 6) % 135),
            jsonb_build_object('codigo', 'MOZ29', 'cantidad', 170 + (day_offset * 7) % 130),
            jsonb_build_object('codigo', 'MOZ30', 'cantidad', 190 + (day_offset * 5) % 140),
            jsonb_build_object('codigo', 'BUR10', 'cantidad', 165 + (day_offset * 8) % 125),
            jsonb_build_object('codigo', 'BUR11', 'cantidad', 175 + (day_offset * 4) % 135)
          )
        )
      ),
      test_date::TIMESTAMP + INTERVAL '17 hours'
    );
  END LOOP;

  -- Insertar thresholds para las islas
  INSERT INTO alert_thresholds (zone_name, min_threshold, max_threshold, alert_enabled)
  VALUES
    ('Gran Canaria', 800, 2000, true),
    ('Tenerife', 700, 1800, true),
    ('Lanzarote', 600, 1600, true),
    ('La Palma', 650, 1700, true)
  ON CONFLICT (zone_name) DO UPDATE SET
    min_threshold = EXCLUDED.min_threshold,
    max_threshold = EXCLUDED.max_threshold,
    alert_enabled = EXCLUDED.alert_enabled;

  RAISE NOTICE 'Datos de prueba insertados exitosamente para los últimos 30 días';
  RAISE NOTICE 'Islas: Gran Canaria (local), Tenerife, Lanzarote, La Palma';
  RAISE NOTICE 'Productos reales de quesos y derivados lácteos';
  RAISE NOTICE 'NOTA: La producción se fabrica en conjunto para todas las islas';
END $$;
