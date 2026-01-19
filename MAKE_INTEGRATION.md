# Integración con Make.com

## URL del Webhook

```
https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production
```

## Configuración en Make.com

### Módulo HTTP - Make a Request

**Método:** POST

**URL:** `https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taHdqcm5xb2xibmR3cXRqZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzY2MzYsImV4cCI6MjA3NzkxMjYzNn0.vbv15vuMhzxV83bmVMEgLH1vtEQAyKoHDz5GcTDkkz8
```

**Body Type:** Raw

**Content Type:** JSON (application/json)

**Request Content (Body):**
```json
{
  "zonas": [
    {
      "nombre": "ISLA 1",
      "productos": [
        {
          "codigo": "A001",
          "cantidad": 150
        },
        {
          "codigo": "A002",
          "cantidad": 200
        }
      ]
    },
    {
      "nombre": "ISLA 2",
      "productos": [
        {
          "codigo": "B001",
          "cantidad": 180
        }
      ]
    }
  ]
}
```

## Notas Importantes

1. **NO necesitas enviar la fecha** - El sistema automáticamente asigna la fecha de HOY a todos los datos recibidos
2. **Formato de datos:** El campo `zonas` es obligatorio y debe ser un array de zonas con sus productos
3. **Estructura de zona:**
   - `nombre`: Nombre de la isla (ej: "ISLA 1", "ISLA 2", etc.)
   - `productos`: Array de productos con `codigo` y `cantidad`
4. **Histórico automático:** Cada vez que se reciben datos, se guarda automáticamente en el histórico con la hora actual
5. **Actualizaciones en tiempo real:** El panel principal se actualiza automáticamente cuando se reciben nuevos datos

## Ejemplo de Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "id": "uuid-generado",
    "fecha": "2025-11-05",
    "zonas": [...],
    "created_at": "2025-11-05T10:30:00Z",
    "updated_at": "2025-11-05T10:30:00Z"
  }
}
```

## Ejemplo de Respuesta con Error

```json
{
  "error": "Invalid data format. Expected 'zonas' field with production data."
}
```
