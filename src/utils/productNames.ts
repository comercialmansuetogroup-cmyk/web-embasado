// Mapeo de códigos de productos a nombres completos
export const productNames: Record<string, string> = {
  // Burrata
  BUR1: 'Burrata Premium 125g',
  BUR2: 'Burrata Tradicional 150g',
  BUR3: 'Burrata Especial 200g',
  BUR10: 'Burrata Artesanal 100g',
  BUR11: 'Burrata Gourmet 180g',

  // Mozzarella
  MOZ24: 'Mozzarella Fresca 250g',
  MOZ25: 'Mozzarella Buffala 200g',
  MOZ26: 'Mozzarella Bola 300g',
  MOZ27: 'Mozzarella Perlas 150g',
  MOZ28: 'Mozzarella Premium 350g',
  MOZ29: 'Mozzarella Light 200g',
  MOZ30: 'Mozzarella Extra 400g',

  // Cacciotta
  CAC1: 'Cacciotta Natural 200g',
  CAC2: 'Cacciotta Hierbas 250g',
  CAC3: 'Cacciotta Trufada 300g',
  CAC6: 'Cacciotta Madurada 350g',

  // Ricotta
  RIC1: 'Ricotta Fresca 250g',
  RIC2: 'Ricotta Cremosa 300g',

  // Mantequilla
  MAN1: 'Mantequilla Dulce 250g',
  MAN3: 'Mantequilla con Sal 200g',
  MAN5: 'Mantequilla Premium 500g',

  // Mascarpone
  MAR1: 'Mascarpone Tradicional 250g',
  MAR3: 'Mascarpone Cremoso 500g',
};

export function getProductName(code: string): string {
  return productNames[code] || code;
}
