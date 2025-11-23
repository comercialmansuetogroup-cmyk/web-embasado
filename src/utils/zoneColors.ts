export const zoneColors = {
  'Gran Canaria': {
    primary: '#bd2025',
    gradient: 'from-[#bd2025] to-[#8c1619]',
    light: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-[#bd2025]',
    ring: 'ring-[#bd2025]'
  },
  'Tenerife': {
    primary: '#bd2025',
    gradient: 'from-[#bd2025] to-[#8c1619]',
    light: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-[#bd2025]',
    ring: 'ring-[#bd2025]'
  },
  'Lanzarote': {
    primary: '#bd2025',
    gradient: 'from-[#bd2025] to-[#8c1619]',
    light: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-[#bd2025]',
    ring: 'ring-[#bd2025]'
  },
  'La Palma': {
    primary: '#bd2025',
    gradient: 'from-[#bd2025] to-[#8c1619]',
    light: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-[#bd2025]',
    ring: 'ring-[#bd2025]'
  },
};

export const getZoneColor = (zoneName: string) => {
  return zoneColors[zoneName as keyof typeof zoneColors] || {
    primary: '#bd2025',
    gradient: 'from-[#bd2025] to-[#8c1619]',
    light: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-[#bd2025]',
    ring: 'ring-[#bd2025]'
  };
};
