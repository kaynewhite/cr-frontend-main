export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  subscriptionPlan: 'free' | 'basic' | 'pro';
  createdAt: Date;

  // optional account state for admins to reject users
  status?: 'active' | 'rejected';
  rejectionFeedback?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
