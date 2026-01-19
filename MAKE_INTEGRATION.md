# Configuración de Make.com - Dashboard de Producción

## URL del Endpoint

```
https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production
```

## Configuración en Make.com

### Módulo HTTP - Make a Request

**Método:** POST

**URL:** `https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production`

**Headers (Agregar 2 headers):**

1. **Content-Type:** `application/json`
2. **Authorization:** `Bearer DASHBOARD_V3_KEY_2025`

**Body Type:** Raw

**Content Type:** JSON (application/json)

**Request Content (Body):**
```json
{
  "zonas": [
    {
      "nombre": "{{8.nombre_comercial}}",
      "codigo_agente": "{{8.codigo_agente}}",
      "nombre_agente": "{{8.nombre_comercial}}",
      "productos": [
        {
          "codigo": "{{8.codigo_producto}}",
          "nombre_producto": "{{8.nombre_producto}}",
          "cantidad": {{8.cantidad_producto}},
          "stock_fisico": {{8.stock_fisico}}
        }
      ]
    }
  ]
}
```

### Mapeo de Códigos de Agente a Zonas

El sistema convierte automáticamente los códigos de agente:

| Código Agente | Zona en Dashboard |
|---------------|-------------------|
| 5             | GRAN CANARIA      |
| 10            | GRAN CANARIA      |
| 14            | GRAN CANARIA      |
| 15            | TENERIFE NORTE    |
| 23            | INSÓLITO          |
| 24            | FILIPPO           |
| 26            | PINGÜINO          |
| Otros         | AGENTE_{codigo}   |

## Campos del JSON

### Por cada zona:
- `nombre` (string, opcional): Se sobrescribe con el mapeo de codigo_agente
- `codigo_agente` (string, requerido): Código del agente para mapear a zona
- `nombre_agente` (string, opcional): Nombre del agente
- `productos` (array, requerido): Lista de productos

### Por cada producto:
- `codigo` (string, requerido): Código del producto
- `nombre_producto` (string, opcional): Nombre del producto
- `cantidad` (number, requerido): Cantidad del producto
- `stock_fisico` (number, opcional): Stock físico (informativo)

## Ejemplo de Prueba con cURL

```bash
curl -X POST https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DASHBOARD_V3_KEY_2025" \
  -d '{
    "zonas": [
      {
        "nombre": "Gran Canaria",
        "codigo_agente": "5",
        "nombre_agente": "Gran Canaria",
        "productos": [
          {
            "codigo": "MOZ25",
            "nombre_producto": "MOZZARELLA 3KG",
            "cantidad": 10,
            "stock_fisico": 50
          }
        ]
      }
    ]
  }'
```

## Respuestas del Sistema

### Éxito (200):
```json
{
  "success": true,
  "data": {...},
  "message": "Production data created successfully"
}
```

### Error 401 - Sin autorización:
```json
{
  "error": "Invalid API key"
}
```

### Error 400 - Formato inválido:
```json
{
  "error": "Invalid data format. Expected 'zonas' array with production data."
}
```

## Notas Importantes

1. **Token obligatorio:** El header Authorization debe ser exactamente `Bearer DASHBOARD_V3_KEY_2025`
2. **Código de producto:** Si el campo `codigo` está vacío, se genera uno automático (no recomendado)
3. **Mapeo automático:** Los códigos de agente se convierten a zonas según la tabla de mapeo
4. **Fecha automática:** El sistema asigna la fecha actual a todos los datos
5. **Actualización en tiempo real:** El dashboard se actualiza automáticamente sin recargar
6. **Merge de datos:** Si ya existen datos del día, los productos se combinan (reemplaza cantidades existentes)
