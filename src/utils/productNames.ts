// Mapeo de códigos de productos a nombres completos
export const productNames: Record<string, string> = {
  // Burrata
  BUR1: 'Burrata Premium 125g',
  BUR2: 'Burrata Tradicional 150g',
  BUR3: 'Burrata Especial 200g',
  BUR4: 'Burrata Fresca 100g',
  BUR5: 'Burrata Natural 130g',
  BUR6: 'Burrata Artesana 140g',
  BUR7: 'Burrata Gourmet 160g',
  BUR8: 'Burrata Extra 170g',
  BUR10: 'Burrata Artesanal 100g',
  BUR11: 'Burrata Premium Plus 180g',
  BUR12: 'Burrata Especial Plus 190g',

  // Mozzarella
  MOZ1: 'Mozzarella Natural 100g',
  MOZ2: 'Mozzarella Fresca 120g',
  MOZ3: 'Mozzarella Light 130g',
  MOZ6: 'Mozzarella Ciliegine 150g',
  MOZ16: 'Mozzarella Bocconcini 180g',
  MOZ21: 'Mozzarella Premium 220g',
  MOZ23: 'Mozzarella Extra 240g',
  MOZ24: 'Mozzarella Fresca 250g',
  MOZ25: 'Mozzarella Buffala 200g',
  MOZ26: 'Mozzarella Bola 300g',
  MOZ27: 'Mozzarella Perlas 150g',
  MOZ28: 'Mozzarella Premium 350g',
  MOZ29: 'Mozzarella Light Plus 200g',
  MOZ30: 'Mozzarella Extra Plus 400g',
  MOZ31: 'Mozzarella Especial 320g',
  MOZ32: 'Mozzarella Gourmet 330g',
  MOZ34: 'Mozzarella Artesanal 360g',

  // Cacciotta
  CAC1: 'Cacciotta Natural 200g',
  CAC2: 'Cacciotta Hierbas 250g',
  CAC3: 'Cacciotta Trufada 300g',
  CAC6: 'Cacciotta Madurada 350g',

  // Ricotta
  RIC1: 'Ricotta Fresca 250g',
  RIC2: 'Ricotta Cremosa 300g',
  RIC3: 'Ricotta Natural 200g',
  RIC4: 'Ricotta Light 220g',
  RIC6: 'Ricotta Premium 280g',
  RIC8: 'Ricotta Especial 320g',

  // Mantequilla
  MAN1: 'Mantequilla Dulce 250g',
  MAN3: 'Mantequilla con Sal 200g',
  MAN5: 'Mantequilla Premium 500g',
  MAN7: 'Mantequilla Artesanal 300g',

  // Mascarpone
  MAR1: 'Mascarpone Tradicional 250g',
  MAR3: 'Mascarpone Cremoso 500g',

  // Mohoso (Quesos con Moho)
  MOH9: 'Queso Mohoso Azul 180g',
  MOH12: 'Queso Mohoso Especial 240g',

  // Scamorza
  SCAM1: 'Scamorza Natural 200g',
  SCAM2: 'Scamorza Ahumada 220g',

  // Stracchino
  STR1: 'Stracchino Fresco 150g',
  STR2: 'Stracchino Cremoso 180g',

  // Pizza
  PIZI: 'Queso para Pizza 250g',
};

export function getProductName(code: string): string {
  return productNames[code] || code;
}
