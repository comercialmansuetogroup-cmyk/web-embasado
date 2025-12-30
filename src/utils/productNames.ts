// Los productos en la base de datos ya tienen nombres descriptivos completos
// Esta función simplemente devuelve el nombre tal cual viene de la BD
export const productNames: Record<string, string> = {};

export function getProductName(code: string): string {
  // Devuelve el nombre/código tal cual, sin transformación
  return code;
}
