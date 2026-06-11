
export type Framework = 'QBCore' | 'ESX' | 'Standalone';

export type Category = 
  | 'QBCore Scripts' 
  | 'ESX Scripts' 
  | 'Casino Scripts' 
  | 'Job Scripts' 
  | 'Vehicle Scripts' 
  | 'UI / HUD' 
  | 'Maps / MLO' 
  | 'Custom Scripts';

export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  discordUsername?: string;
  telegramUsername?: string;
  phoneNumber?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  framework: Framework;
  category: Category;
  features: string[];
  requirements: string[];
  previewImageUrl: string;
  videoUrl?: string;
  downloadUrl?: string;
  isFeatured?: boolean;
  createdAt?: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'pending' | 'paid' | 'delivered';
  createdAt: number;
}
