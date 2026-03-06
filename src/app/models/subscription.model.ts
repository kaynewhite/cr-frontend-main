export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'basic' | 'pro';
  displayName: string;
  price: number;
  features: string[];
  limitations?: string[];
}

export interface UserSubscription {
  userId: string;
  currentPlan: 'free' | 'basic' | 'pro';
  startDate: Date | string;
  expiryDate: Date | string;
  isActive: boolean;
  durationMonths?: number;
}
