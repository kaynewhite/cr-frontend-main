import { Injectable } from '@angular/core';
import { SubscriptionPlan, UserSubscription } from '../models/subscription.model';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly SUBSCRIPTION_KEY = 'userSubscription';
  private subscriptionSubject: BehaviorSubject<UserSubscription | null>;
  public subscription$: Observable<UserSubscription | null>;

  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'free',
      displayName: 'Free Plan',
      price: 0,
      features: [
        'Up to 10 calculations per month',
        'Basic material tracking',
        'View calculation history (last 30 days)',
        'Simple profit calculator',
        'Email support'
      ],
      limitations: [
        'Limited to 10 materials in inventory',
        'No advanced reports',
        'Basic features only'
      ]
    },
    {
      id: 'basic',
      name: 'basic',
      displayName: 'Basic Plan',
      price: 9.99,
      features: [
        'Unlimited calculations',
        'Advanced material management',
        'Full calculation history',
        'Profit trend charts',
        'Export to PDF',
        'Priority email support',
        'Up to 100 materials in inventory'
      ]
    },
    {
      id: 'pro',
      name: 'pro',
      displayName: 'Pro Plan',
      price: 19.99,
      features: [
        'Everything in Basic',
        'Unlimited materials in inventory',
        'Advanced analytics and reports',
        'Custom categories',
        'Bulk import/export',
        'API access',
        'Priority support (24/7)',
        'Multiple user accounts',
        'White-label reports'
      ]
    }
  ];

  constructor(private authService: AuthService) {
    const userId = this.authService.currentUserValue?.id;
    const subscription = userId ? this.loadSubscription(userId) : null;
    this.subscriptionSubject = new BehaviorSubject<UserSubscription | null>(subscription);
    this.subscription$ = this.subscriptionSubject.asObservable();
  }

  private loadSubscription(userId: string): UserSubscription | null {
    const key = `${this.SUBSCRIPTION_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Create default free subscription
    const defaultSubscription: UserSubscription = {
      userId,
      currentPlan: 'free',
      startDate: new Date(),
      isActive: true
    };
    localStorage.setItem(key, JSON.stringify(defaultSubscription));
    return defaultSubscription;
  }

  private saveSubscription(subscription: UserSubscription): void {
    const key = `${this.SUBSCRIPTION_KEY}_${subscription.userId}`;
    localStorage.setItem(key, JSON.stringify(subscription));
    this.subscriptionSubject.next(subscription);
  }

  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  getPlanDetails(planName: 'free' | 'basic' | 'pro'): SubscriptionPlan | undefined {
    return this.plans.find(p => p.name === planName);
  }

  getCurrentSubscription(): UserSubscription | null {
    return this.subscriptionSubject.value;
  }

  upgradePlan(newPlan: 'free' | 'basic' | 'pro'): Observable<UserSubscription> {
    return new Observable(observer => {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        observer.error({ message: 'No user logged in' });
        return;
      }

      const currentSubscription = this.getCurrentSubscription();
      if (!currentSubscription) {
        observer.error({ message: 'No subscription found' });
        return;
      }

      const updatedSubscription: UserSubscription = {
        ...currentSubscription,
        currentPlan: newPlan,
        startDate: new Date(),
        isActive: true
      };

      this.saveSubscription(updatedSubscription);
      
      // Also update user's subscription plan in auth service
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].subscriptionPlan = newPlan;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }

      observer.next(updatedSubscription);
      observer.complete();
    });
  }

  canAccessFeature(feature: string): boolean {
    const subscription = this.getCurrentSubscription();
    if (!subscription) return false;

    const plan = this.getPlanDetails(subscription.currentPlan);
    return plan ? plan.features.includes(feature) : false;
  }
}
