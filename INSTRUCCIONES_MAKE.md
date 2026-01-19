# Instrucciones de Integración con Make.com

## URL del Endpoint

```
https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production
```

## Método HTTP

```
POST
```

## Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taHdqcm5xb2xibmR3cXRqZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzY2MzYsImV4cCI6MjA3NzkxMjYzNn0.vbv15vuMhzxV83bmVMEgLH1vtEQAyKoHDz5GcTDkkz8
```

## Formato de Datos (JSON)

### Estructura del JSON que Make debe enviar:

```json
{
  "zonas": [
    {
      "nombre": "Nombre opcional (no se usa)",
      "codigo_agente": "5",
      "nombre_agente": "Nombre del agente (opcional)",
      "productos": [
        {
          "codigo": "MOZ25",
          "nombre_producto": "MOZZARELLA FIORDILATTE RALLADA BANDEJA 3 KG",
          "cantidad": 10
        },
        {
          "codigo": "BUR1",
          "nombre_producto": "BURRATA 100G AZUL",
          "cantidad": 5
        }
      ]
    },
    {
      "codigo_agente": "23",
      "nombre_agente": "Insólito",
      "productos": [
        {
          "codigo": "MOZ1",
          "nombre_producto": "MOZZARELLA FIORDILATTE BLOQUE 1 KG",
          "cantidad": 20
        }
      ]
    }
  ]
}
```

## Mapeo de Códigos de Agente a Zonas

El sistema automáticamente convierte los códigos de agente a zonas:

| Código Agente | Zona Asignada |
|---------------|---------------|
| 5 | GRAN CANARIA |
| 10 | GRAN CANARIA |
| 14 | GRAN CANARIA |
| 15 | TENERIFE NORTE |
| 23 | INSÓLITO |
| 24 | FILIPPO |
| 26 | PINGÜINO |
| Otros | AGENTE_{codigo} |

## Campos Requeridos

### Por cada zona:
- `codigo_agente` (string): Código del agente
- `productos` (array): Lista de productos

### Por cada producto:
- `codigo` (string): Código del producto (ej: "MOZ25", "BUR1")
- `nombre_producto` (string): Nombre completo del producto
- `cantidad` (number): Cantidad del producto

## Comportamiento del Sistema

1. **Primera actualización del día**: Crea un nuevo registro con los datos enviados
2. **Actualizaciones posteriores del mismo día**: Combina los productos:
   - Si el producto ya existe en la zona: REEMPLAZA la cantidad (no suma)
   - Si el producto es nuevo en la zona: Lo agrega
   - Si la zona es nueva: La agrega

3. **Actualización en Tiempo Real**: El dashboard se actualiza automáticamente al recibir los datos (no necesita refrescar la página)

## Ejemplo de Prueba con cURL

```bash
curl -X POST https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taHdqcm5xb2xibmR3cXRqZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzY2MzYsImV4cCI6MjA3NzkxMjYzNn0.vbv15vuMhzxV83bmVMEgLH1vtEQAyKoHDz5GcTDkkz8" \
  -d '{
    "zonas": [
      {
        "codigo_agente": "5",
        "nombre_agente": "Gran Canaria",
        "productos": [
          {
            "codigo": "MOZ25",
            "nombre_producto": "MOZZARELLA FIORDILATTE RALLADA BANDEJA 3 KG",
            "cantidad": 10
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
  "data": { ... },
  "message": "Production data created successfully"
}
```

O si ya existía data del día:
```json
{
  "success": true,
  "data": { ... },
  "message": "Production data merged successfully"
}
```

### Error (400):
```json
{
  "error": "Invalid data format. Expected 'zonas' array with production data."
}
```

### Error (500):
```json
{
  "error": "Internal server error",
  "details": "Mensaje de error específico"
}
```

## Configuración en Make.com

1. **Módulo HTTP**: Usar "Make an HTTP Request"
2. **URL**: `https://mmhwjrnqolbndwqtjfex.supabase.co/functions/v1/update-production`
3. **Method**: POST
4. **Headers**:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taHdqcm5xb2xibmR3cXRqZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzY2MzYsImV4cCI6MjA3NzkxMjYzNn0.vbv15vuMhzxV83bmVMEgLH1vtEQAyKoHDz5GcTDkkz8`
5. **Body Type**: Raw
6. **Content Type**: JSON (application/json)
7. **Request Content**: El JSON con la estructura mostrada arriba

## Notas Importantes

- El sistema agrupa automáticamente productos del mismo código en la misma zona
- Los datos se guardan por fecha (un registro por día)
- El historial se guarda automáticamente por hora
- El dashboard muestra los datos del día actual
- La actualización es en tiempo real (no requiere refresco manual)
