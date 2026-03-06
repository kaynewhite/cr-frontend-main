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
  private readonly MAYA_QR_KEY = 'mayaQrUrl';
  private readonly GCASH_QR_KEY = 'gcashQrUrl';

  private subscriptionSubject: BehaviorSubject<UserSubscription | null>;
  public subscription$: Observable<UserSubscription | null>;

  // qr management observable, holds both urls
  private qrSubject: BehaviorSubject<{ maya: string | null; gcash: string | null }>;
  public qr$: Observable<{ maya: string | null; gcash: string | null }>;

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

    // initialize qr observable with both stored values
    const existingMaya = localStorage.getItem(this.MAYA_QR_KEY);
    const existingGcash = localStorage.getItem(this.GCASH_QR_KEY);
    this.qrSubject = new BehaviorSubject<{ maya: string | null; gcash: string | null }>({
      maya: existingMaya,
      gcash: existingGcash
    });
    this.qr$ = this.qrSubject.asObservable();
  }

  private loadSubscription(userId: string): UserSubscription | null {
    const key = `${this.SUBSCRIPTION_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure expiryDate is set for consistency
      if (!parsed.expiryDate) {
        parsed.expiryDate = this.calculateExpiryDate(new Date(parsed.startDate), 30);
      }
      return parsed;
    }
    
    // Create default free subscription
    const now = new Date();
    const defaultSubscription: UserSubscription = {
      userId,
      currentPlan: 'free',
      startDate: now,
      expiryDate: this.calculateExpiryDate(now, 30),
      isActive: true
    };
    localStorage.setItem(key, JSON.stringify(defaultSubscription));
    return defaultSubscription;
  }

  private calculateExpiryDate(startDate: Date, durationDays: number): Date {
    const expiry = new Date(startDate);
    expiry.setDate(expiry.getDate() + durationDays);
    return expiry;
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

  /* QR code for payments – stored globally, editable by admins */
  // --- QR helpers ---
  getMayaQr(): string | null {
    return localStorage.getItem(this.MAYA_QR_KEY);
  }

  getGcashQr(): string | null {
    return localStorage.getItem(this.GCASH_QR_KEY);
  }

  setMayaQr(url: string | null): void {
    if (url === null) {
      localStorage.removeItem(this.MAYA_QR_KEY);
    } else {
      localStorage.setItem(this.MAYA_QR_KEY, url);
    }
    this.qrSubject.next({
      ...this.qrSubject.value,
      maya: url
    });
  }

  setGcashQr(url: string | null): void {
    if (url === null) {
      localStorage.removeItem(this.GCASH_QR_KEY);
    } else {
      localStorage.setItem(this.GCASH_QR_KEY, url);
    }
    this.qrSubject.next({
      ...this.qrSubject.value,
      gcash: url
    });
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

      const now = new Date();
      const updatedSubscription: UserSubscription = {
        ...currentSubscription,
        currentPlan: newPlan,
        startDate: now,
        expiryDate: this.calculateExpiryDate(now, 30),
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

  /**
   * Admin helper: upgrade arbitrary user's subscription
   */
  upgradePlanForUser(userId: string, newPlan: 'free' | 'basic' | 'pro'): Observable<UserSubscription> {
    return new Observable(observer => {
      // load existing or default
      const key = `${this.SUBSCRIPTION_KEY}_${userId}`;
      let stored = localStorage.getItem(key);
      let subscription: UserSubscription;
      if (stored) {
        subscription = JSON.parse(stored);
      } else {
        subscription = {
          userId,
          currentPlan: 'free',
          startDate: new Date(),
          expiryDate: this.calculateExpiryDate(new Date(), 30),
          isActive: true
        };
      }

      const now = new Date();
      const updated: UserSubscription = {
        ...subscription,
        currentPlan: newPlan,
        startDate: now,
        expiryDate: this.calculateExpiryDate(now, 30),
        isActive: true
      };

      localStorage.setItem(key, JSON.stringify(updated));

      // if this is the currently logged-in user, update subject too
      if (this.authService.currentUserValue?.id === userId) {
        this.saveSubscription(updated);
      }

      // also update user's subscriptionPlan field if they exist
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex((u: any) => u.id === userId);
      if (idx !== -1) {
        users[idx].subscriptionPlan = newPlan;
        localStorage.setItem('users', JSON.stringify(users));
        if (this.authService.currentUserValue?.id === userId) {
          localStorage.setItem('currentUser', JSON.stringify(users[idx]));
        }
      }

      observer.next(updated);
      observer.complete();
    });
  }
}
