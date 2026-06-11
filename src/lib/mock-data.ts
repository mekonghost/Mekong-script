
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'QBCore Advanced Coin Shop',
    description: 'A premium, modern coin shop system for QBCore servers. Allows players to purchase vehicles and items using a special coin currency.',
    price: 25,
    framework: 'QBCore',
    category: 'QBCore Scripts',
    features: [
      'Modern NUI design with smooth animations',
      'Buy vehicles with custom coins',
      'Admin command to manage player balances',
      'Secure server-side validation',
      'Easy to configure and translate'
    ],
    requirements: ['QBCore Framework', 'oxmysql'],
    previewImageUrl: 'https://picsum.photos/seed/script1/800/600',
    isFeatured: true
  },
  {
    id: '2',
    name: 'Cyber HUD System',
    description: 'A futuristic, neon-styled HUD for ESX and QBCore. Highly customizable and performance optimized.',
    price: 15,
    framework: 'Standalone',
    category: 'UI / HUD',
    features: [
      'Glassmorphism design',
      'Minimap integration',
      'Status indicators (hunger, thirst, stress)',
      'Highly optimized code (0.0ms)',
      'Responsive for all resolutions'
    ],
    requirements: ['None (Standalone)'],
    previewImageUrl: 'https://picsum.photos/seed/script3/800/600',
    isFeatured: true
  },
  {
    id: '3',
    name: 'Luxury Casino System',
    description: 'Complete casino package including slots, blackjack, and a custom UI. Transform your server with a premium gambling experience.',
    price: 45,
    framework: 'ESX',
    category: 'Casino Scripts',
    features: [
      'Multiple game types included',
      'Custom chips system',
      'High-quality sounds and effects',
      'Detailed logs for admins',
      'Integration with ESX economy'
    ],
    requirements: ['ESX Legacy', 'ox_lib'],
    previewImageUrl: 'https://picsum.photos/seed/script2/800/600',
    isFeatured: false
  }
];
