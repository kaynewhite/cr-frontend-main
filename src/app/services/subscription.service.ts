import { Injectable, Injector } from '@angular/core';
import { CalculationService } from './calculation.service';
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
        'Up to 3 calculations per month',
        'Basic material tracking',
        'Saved calculations cap of 3 (expires after 30 days)',
        'Simple profit calculator',
        'Email support'
      ],
      limitations: [
        'Limited to 10 materials in inventory',
        'Cannot create custom categories',
        'No advanced reports',
        'Basic features only'
      ]
    },
    {
      id: 'basic',
      name: 'basic',
      displayName: 'Basic Plan',
      price: 100,
      features: [
        'Unlimited calculations',
        'Advanced material management',
        'Saved calculations cap of 10 (expires after 60 days)',
        'Full saved calculations',
        'Priority email support',
        'Up to 50 materials in inventory'
      ],
      limitations: [
        'Cannot create custom categories',
        'No advanced analytics'
      ]
    },
    {
      id: 'pro',
      name: 'pro',
      displayName: 'Pro Plan',
      price: 250,
      features: [
        'Everything in Basic',
        'Unlimited materials in inventory',
        'Advanced analytics and reports',
        'Custom categories',
        'Priority support (24/7)'
      ]
    }
  ];

  constructor(private authService: AuthService, private injector: Injector) {
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

  /**
   * Inventory slot limit by plan. Infinity for unlimited.
   */
  getInventoryLimit(planName: 'free' | 'basic' | 'pro'): number {
    switch (planName) {
      case 'free':
        return 10;
      case 'basic':
        return 50;
      case 'pro':
        return Infinity;
    }
  }

  /**
   * Calculation limit per month. Infinity for unlimited.
   */
  getCalculationLimit(planName: 'free' | 'basic' | 'pro'): number {
    switch (planName) {
      case 'free':
        return 3;
      case 'basic':
      case 'pro':
        return Infinity;
    }
  }

  /**
   * Whether custom categories may be created under this plan.
   */
  allowsCustomCategory(planName: 'free' | 'basic' | 'pro'): boolean {
    return planName === 'pro';
  }

  /**
   * Categories that are allowed by default for materials/inventory. Custom categories require PRO.
   */
  getBuiltInCategories(): string[] {
    return ['Paper', 'Adhesive', 'Decoration', 'Paint', 'Cards', 'Packaging', 'Stationery'];
  }

  /**
   * Special set of categories used by the pricing calculator.
   * These do not affect material inventory categories.
   */
  getCalculatorCategories(): string[] {
    return [
      'General Printing',
      'Business Cards',
      'Flyers & Brochures',
      'Flyers & Banners',
      'Labels & Stickers'
    ];
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
    // after upgrade/downgrade, prune calculations according to new plan
    const calcSvc = this.injector.get(CalculationService);
    calcSvc.enforceLimits();
  }

  canAccessFeature(feature: string): boolean {
    const subscription = this.getCurrentSubscription();
    if (!subscription) return false;

    const plan = this.getPlanDetails(subscription.currentPlan);
    return plan ? plan.features.includes(feature) : false;
  }
}
