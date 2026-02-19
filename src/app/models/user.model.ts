export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  subscriptionPlan: 'free' | 'basic' | 'pro';
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
