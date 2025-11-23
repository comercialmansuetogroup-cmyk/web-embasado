# Prueba de la Edge Function update-production

La función ahora soporta múltiples peticiones POST independientes que se fusionan automáticamente sin sobrescribir datos anteriores.

## URL de la función

```
{SUPABASE_URL}/functions/v1/update-production
```

## Cómo funciona

1. **Primera petición del día**: Crea un nuevo registro en `production_data`
2. **Peticiones subsecuentes**: Hace merge con los datos existentes
   - Si la isla no existe, la agrega
   - Si la isla existe y el producto no existe, agrega el producto
   - Si la isla y el producto existen, actualiza la cantidad

## Formato del request

```json
{
  "zonas": [
    {
      "nombre": "Gran Canaria",
      "productos": [
        {
          "codigo": "BUR1",
          "cantidad": 150
        }
      ]
    }
  ]
}
```

## Ejemplo de prueba con cURL

### Request 1: Gran Canaria con BUR1
```bash
curl -X POST '{SUPABASE_URL}/functions/v1/update-production' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {ANON_KEY}' \
  -d '{
    "zonas": [
      {
        "nombre": "Gran Canaria",
        "productos": [
          {
            "codigo": "BUR1",
            "cantidad": 150
          }
        ]
      }
    ]
  }'
```

### Request 2: Gran Canaria con MOZ24 (se agrega al mismo día)
```bash
curl -X POST '{SUPABASE_URL}/functions/v1/update-production' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {ANON_KEY}' \
  -d '{
    "zonas": [
      {
        "nombre": "Gran Canaria",
        "productos": [
          {
            "codigo": "MOZ24",
            "cantidad": 200
          }
        ]
      }
    ]
  }'
```

### Request 3: Tenerife con CAC1 (nueva isla)
```bash
curl -X POST '{SUPABASE_URL}/functions/v1/update-production' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {ANON_KEY}' \
  -d '{
    "zonas": [
      {
        "nombre": "Tenerife",
        "productos": [
          {
            "codigo": "CAC1",
            "cantidad": 180
          }
        ]
      }
    ]
  }'
```

### Request 4: Actualizar BUR1 en Gran Canaria (sobrescribe cantidad)
```bash
curl -X POST '{SUPABASE_URL}/functions/v1/update-production' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {ANON_KEY}' \
  -d '{
    "zonas": [
      {
        "nombre": "Gran Canaria",
        "productos": [
          {
            "codigo": "BUR1",
            "cantidad": 175
          }
        ]
      }
    ]
  }'
```

## Resultado esperado después de los 4 requests

En la tabla `production_data` debería haber UN SOLO registro para el día de hoy con:

```json
{
  "fecha": "2025-11-05",
  "zonas": [
    {
      "nombre": "Gran Canaria",
      "productos": [
        { "codigo": "BUR1", "cantidad": 175 },
        { "codigo": "MOZ24", "cantidad": 200 }
      ]
    },
    {
      "nombre": "Tenerife",
      "productos": [
        { "codigo": "CAC1", "cantidad": 180 }
      ]
    }
  ]
}
```

## Verificación en la base de datos

```sql
-- Ver el registro fusionado de hoy
SELECT * FROM production_data WHERE fecha = CURRENT_DATE;

-- Ver todas las entradas en el historial (debería haber 4)
SELECT * FROM production_history WHERE date = CURRENT_DATE ORDER BY created_at;
```

## Integración con Make.com

Cada webhook desde Make puede enviar:
- Una isla con un producto
- Una isla con múltiples productos
- Múltiples islas con sus productos

La función automáticamente:
1. Busca si existe el día actual
2. Hace merge inteligente sin duplicar
3. Actualiza `updated_at` cada vez
4. Guarda cada entrada en el historial para auditoría

## Respuestas de la función

### Primera petición del día
```json
{
  "success": true,
  "data": { ... },
  "message": "Production data created successfully"
}
```

### Peticiones subsecuentes (merge)
```json
{
  "success": true,
  "data": { ... },
  "message": "Production data merged successfully"
}
```

### Error de formato
```json
{
  "error": "Invalid data format. Expected 'zonas' array with production data."
}
```
