import { Package, Destino, Hotel } from '@land-tour/shared';

export const MOCK_DESTINOS: Destino[] = [
  { 
    id: 1, 
    pais: 'México', 
    ciudad: 'Cancún', 
    tagline: 'Mar turquesa sin límites',
    description: 'Sumérgete en las aguas cristalinas del Caribe mexicano. Cancún combina playas paradisíacas, ruinas mayas milenarias y una vida nocturna vibrante.',
    image: 'https://images.unsplash.com/photo-1512813195386-6cf81d50e426?q=80&w=1200',
    highlights: ['Zona Hotelera de clase mundial', 'Ruinas de Chichén Itzá', 'Snorkel en arrecifes'],
    packageCount: 10,
    color: 'from-cyan-900/80'
  },
  { 
    id: 2, 
    pais: 'Francia', 
    ciudad: 'París', 
    tagline: 'La ciudad que siempre enamora',
    description: 'La capital de la luz te espera con su inigualable Torre Eiffel, museos de talla mundial como el Louvre y una gastronomía que es puro arte.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200',
    highlights: ['Torre Eiffel', 'Museo del Louvre', 'Crucero por el Sena'],
    packageCount: 5,
    color: 'from-indigo-900/80'
  },
  { 
    id: 3, 
    pais: 'Perú', 
    ciudad: 'Machu Picchu', 
    tagline: 'La ciudad perdida de los Incas',
    description: 'Una de las siete maravillas del mundo moderno te espera entre las nubes andinas. Machu Picchu es una experiencia espiritual única.',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200',
    highlights: ['Ciudadela Inca', 'Camino Inca', 'Valle Sagrado'],
    packageCount: 6,
    color: 'from-emerald-900/80'
  },
  { 
    id: 4, 
    pais: 'Grecia', 
    ciudad: 'Santorini', 
    tagline: 'El azul más profundo del mundo',
    description: 'Las icónicas cúpulas azules de Oia, los atardeceres que incendian el mar Egeo y los pueblos blancos colgados sobre los acantilados.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200',
    highlights: ['Atardeceres en Oia', 'Playas volcánicas', 'Cata de vinos'],
    packageCount: 4,
    color: 'from-blue-900/80'
  },
  { 
    id: 5, 
    pais: 'Japón', 
    ciudad: 'Tokio', 
    tagline: 'Tradición y futuro en armonía',
    description: 'Una metrópolis que nunca duerme y que sorprende a cada paso: templos ancestrales junto a rascacielos luminosos.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200',
    highlights: ['Monte Fuji', 'Barrio de Shibuya', 'Gastronomía auténtica'],
    packageCount: 3,
    color: 'from-rose-900/80'
  },
];

export const MOCK_HOTELES: Hotel[] = [
  { id: 1, destinoId: 1, nombre: 'Riu Plaza Panamá', estrellas: 5, image: '/images/hoteles/riu_panama.jpg' },
  { id: 2, destinoId: 2, nombre: 'Hotel Las Américas', estrellas: 5, image: '/images/hoteles/las_americas.jpg' },
  { id: 3, destinoId: 3, nombre: 'Hard Rock Hotel & Casino', estrellas: 5, image: '/images/hoteles/hard_rock.jpg' },
  { id: 4, destinoId: 4, nombre: 'Iberostar Selection', estrellas: 5, image: '/images/hoteles/iberostar.jpg' },
];

export const MOCK_PACKAGES: Package[] = [
  {
    id: 1,
    title: 'Punta Cana Todo Incluido',
    description: 'Disfruta de las mejores playas del Caribe con todo incluido en un resort de lujo. Sol, arena blanca y diversión garantizada.',
    price: 850,
    image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1200',
    category: 'Playa',
    duration: '5 Días / 4 Noches',
    nochesBase: 4,
    diasEstancia: 5,
    location: { country: 'República Dominicana', city: 'Punta Cana' },
    flightIncluded: true,
    transport: 'Traslados Compartidos',
    includes: ['Boleto Aéreo', 'Traslados', 'Hotel Todo Incluido', 'Seguro de Viaje'],
    notIncludes: ['Gastos Personales', 'Propinas', 'Tours Opcionales'],
    prices: { sgl: 1200, dbl: 850, tpl: 790, quad: 750, chd: 450 },
    hoteles: [MOCK_HOTELES[2]],
    actividades: ['Snorkeling', 'Fiesta en Catamarán', 'Cena en la Playa'],
    traslados: ['Aeropuerto - Hotel - Aeropuerto']
  },
  {
    id: 2,
    title: 'Cartagena Mágica',
    description: 'Explora la ciudad amurallada, su historia y sus playas cristalinas en las Islas del Rosario. Un viaje inolvidable.',
    price: 620,
    image: 'https://images.unsplash.com/photo-1583996253457-3f32420f1882?q=80&w=1200',
    category: 'Cultura',
    duration: '4 Días / 3 Noches',
    nochesBase: 3,
    diasEstancia: 4,
    location: { country: 'Colombia', city: 'Cartagena' },
    flightIncluded: false,
    transport: 'Traslados Privados',
    includes: ['Traslados', 'Desayunos', 'City Tour Histórico', 'Tour a Islas del Rosario'],
    notIncludes: ['Boleto Aéreo', 'Cenas', 'Impuestos de Muelle'],
    prices: { sgl: 950, dbl: 620, tpl: 580, quad: 550, chd: 380 },
    hoteles: [MOCK_HOTELES[1]],
    actividades: ['Tour Gastronómico', 'Paseo en Coche Victoria', 'Día de Playa en Barú'],
    traslados: ['Hotel - Aeropuerto']
  },
  {
    id: 3,
    title: 'Panamá Shopping & Canal',
    description: 'Lo mejor de Panamá: compras en los malls más grandes y una visita impresionante al Canal de Panamá.',
    price: 490,
    image: 'https://images.unsplash.com/photo-1540321523450-428674d44007?q=80&w=1200',
    category: 'Shopping',
    duration: '3 Días / 2 Noches',
    nochesBase: 2,
    diasEstancia: 3,
    location: { country: 'Panamá', city: 'Panamá City' },
    flightIncluded: false,
    transport: 'Traslados Compartidos',
    includes: ['Traslados', 'Hotel con Desayuno', 'Tour al Canal de Panamá', 'Shopping Tour'],
    notIncludes: ['Boleto Aéreo', 'Almuerzos y Cenas'],
    prices: { sgl: 750, dbl: 490, tpl: 450, quad: 420, chd: 290 },
    hoteles: [MOCK_HOTELES[0]],
    actividades: ['Visita a Casco Antiguo', 'Espectáculo Folclórico', 'Tour de Compras'],
    traslados: ['Pickup VIP']
  },
  {
    id: 4,
    title: 'Cancún Aventura Maya',
    description: 'Combina el relax de Cancún con la aventura en los parques Xcaret y las ruinas de Chichén Itzá.',
    price: 990,
    image: 'https://images.unsplash.com/photo-1512813195386-6cf81d50e426?q=80&w=1200',
    category: 'Aventura',
    duration: '6 Días / 5 Noches',
    nochesBase: 5,
    diasEstancia: 6,
    location: { country: 'México', city: 'Cancún' },
    flightIncluded: true,
    transport: 'Traslados en Van Privada',
    includes: ['Boleto Aéreo', 'Hotel Todo Incluido', 'Tour Chichén Itzá', 'Entrada a Xcaret'],
    notIncludes: ['Fotos', 'Souvenirs', 'Actividades Adicionales en el Parque'],
    prices: { sgl: 1400, dbl: 990, tpl: 920, quad: 880, chd: 590 },
    hoteles: [MOCK_HOTELES[3]],
    actividades: ['Cenote Swim', 'Noche de Coco Bongo', 'Catamarán a Isla Mujeres'],
    traslados: ['Van Privada']
  }
];
