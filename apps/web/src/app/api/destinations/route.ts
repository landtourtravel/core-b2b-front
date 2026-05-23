import { NextResponse } from 'next/server';
import { Destino } from '@land-tour/shared';

// TODO: reemplazar con query Prisma directa a la DB
const MOCK_DESTINATIONS: Destino[] = [
  {
    id: 1,
    pais: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    tagline: 'Donde el mundo se conecta',
    description: 'Una ciudad que fusiona rascacielos modernos con el encantador Casco Antiguo colonial. El Canal de Panamá y playas paradisíacas a solo horas de distancia.',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&q=85',
    highlights: ['Canal de Panamá', 'Casco Antiguo', 'Decameron Playa', 'Cinta Costera'],
    packageCount: 4,
    color: 'from-teal-900/85',
  },
  {
    id: 2,
    pais: 'México',
    ciudad: 'Cancún',
    tagline: 'El Caribe en su máxima expresión',
    description: 'Aguas turquesas, arena blanca y una zona hotelera de clase mundial. Cancún es sinónimo de vacaciones perfectas en el Caribe mexicano.',
    image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1200&q=85',
    highlights: ['Zona Hotelera', 'Isla Mujeres', 'Chichén Itzá', 'Cenotes'],
    packageCount: 6,
    color: 'from-blue-900/85',
  },
  {
    id: 3,
    pais: 'Perú',
    ciudad: 'Cusco',
    tagline: 'El ombligo del mundo Inca',
    description: 'La antigua capital del Imperio Inca, puerta de entrada a Machu Picchu y al Valle Sagrado. Historia, cultura y aventura en los Andes peruanos.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=85',
    highlights: ['Machu Picchu', 'Valle Sagrado', 'Plaza de Armas', 'Sacsayhuamán'],
    packageCount: 3,
    color: 'from-amber-900/85',
  },
  {
    id: 4,
    pais: 'Colombia',
    ciudad: 'Cartagena',
    tagline: 'La ciudad más romántica de América',
    description: 'Joya colonial del Caribe colombiano. Sus murallas centenarias, calles empedradas y playas caribeñas la convierten en un destino único e irrepetible.',
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=85',
    highlights: ['Ciudad Amurallada', 'Islas del Rosario', 'Bocagrande', 'Castillo San Felipe'],
    packageCount: 3,
    color: 'from-orange-900/80',
  },
  {
    id: 5,
    pais: 'Rep. Dominicana',
    ciudad: 'Punta Cana',
    tagline: 'El paraíso del Caribe',
    description: 'Con 50 km de playas vírgenes y resorts todo incluido de clase mundial, Punta Cana es el destino caribeño favorito de toda Latinoamérica.',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=85',
    highlights: ['Playa Bávaro', 'Isla Saona', 'Safari 4x4', 'Buceo y snorkeling'],
    packageCount: 5,
    color: 'from-cyan-900/85',
  },
  {
    id: 6,
    pais: 'Ecuador',
    ciudad: 'Galápagos',
    tagline: 'El laboratorio de la evolución',
    description: 'Archipiélago Patrimonio de la Humanidad donde conviven iguanas marinas, lobos de mar y tortugas gigantes. Una experiencia de vida única.',
    image: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200&q=85',
    highlights: ['Santa Cruz', 'Isla Isabela', 'Snorkeling con lobos', 'Tortugas gigantes'],
    packageCount: 2,
    color: 'from-emerald-900/85',
  },
];

export async function GET(): Promise<NextResponse<Destino[]>> {
  return NextResponse.json(MOCK_DESTINATIONS);
}
