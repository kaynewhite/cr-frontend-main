import { Injectable } from '@angular/core';
import { Calculation, CalculationSummary } from '../models/calculation.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SubscriptionService } from './subscription.service';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  private readonly CALCULATIONS_KEY = 'calculations';
  private calculationsSubject: BehaviorSubject<Calculation[]>;
  public calculations$: Observable<Calculation[]>;

  // Sample calculations
  private sampleCalculations: Calculation[] = [
    {
      id: '1',
      userId: '1',
      name: 'Corporate Business Cards',
      category: 'Business Cards',
      materials: [
        { materialId: '1', materialName: 'Premium Cardstock', quantity: 100, costPerUnit: 0.10, subtotal: 10.00 },
        { materialId: '2', materialName: 'Ink Cartridge', quantity: 0.2, costPerUnit: 50.00, subtotal: 10.00 }
      ],
      totalCost: 20.00,
      suggestedPrice: 60.00,
      profitMargin: 66.67,
      profitAmount: 40.00,
      notes: 'Set of 100 double-sided business cards',
      createdAt: new Date('2026-01-20')
    },
    {
      id: '2',
      userId: '1',
      name: 'Event Flyer Design',
      category: 'Flyers & Brochures',
      materials: [
        { materialId: '4', materialName: 'Glossy Paper', quantity: 200, costPerUnit: 0.05, subtotal: 10.00 },
        { materialId: '3', materialName: 'Color Ink', quantity: 0.3, costPerUnit: 40.00, subtotal: 12.00 }
      ],
      totalCost: 22.00,
      suggestedPrice: 55.00,
      profitMargin: 60.00,
      profitAmount: 33.00,
      notes: 'Printed flyers for promotional event',
      createdAt: new Date('2026-01-22')
    },
    {
      id: '3',
      userId: '1',
      name: 'Custom Vinyl Banner',
      category: 'Flyers & Banners',
      materials: [
        { materialId: '6', materialName: 'Vinyl Roll', quantity: 1, costPerUnit: 25.00, subtotal: 25.00 },
        { materialId: '7', materialName: 'Banner Stand', quantity: 1, costPerUnit: 15.00, subtotal: 15.00 }
      ],
      totalCost: 40.00,
      suggestedPrice: 100.00,
      profitMargin: 60.00,
      profitAmount: 60.00,
      notes: 'Outdoor promotional banner',
      createdAt: new Date('2026-01-23')
    }
  ];

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService
  ) {
    const userId = this.authService.currentUserValue?.id || 'guest';
    const key = `${this.CALCULATIONS_KEY}_${userId}`;
    
    let calculations = this.loadCalculations(key);
    if (calculations.length === 0) {
      calculations = this.sampleCalculations;
      localStorage.setItem(key, JSON.stringify(calculations));
    }
    
    // enforce plan limits on initialization
    calculations = this.applyPlanLimits(calculations);
    this.calculationsSubject = new BehaviorSubject<Calculation[]>(calculations);
    this.calculations$ = this.calculationsSubject.asObservable();

    // when subscription plan changes, automatically prune stored calculations
    this.subscriptionService.subscription$.subscribe(() => {
      this.enforceLimits();
    });
  }

  private loadCalculations(key: string): Calculation[] {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCalculations(calculations: Calculation[]): void {
    const userId = this.authService.currentUserValue?.id || 'guest';
    const key = `${this.CALCULATIONS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(calculations));
    this.calculationsSubject.next(calculations);
  }

  getCalculations(): Calculation[] {
    // prune expired/over-limit entries each time someone asks for the list
    const pruned = this.applyPlanLimits(this.calculationsSubject.value);
    // if pruning removed anything, persist the trimmed set
    if (pruned.length !== this.calculationsSubject.value.length) {
      this.saveCalculations(pruned);
    }
    return pruned;
  }

  getCalculationById(id: string): Calculation | undefined {
    return this.calculationsSubject.value.find(c => c.id === id);
  }

  addCalculation(calculation: Omit<Calculation, 'id' | 'createdAt'>): Calculation {
    const userId = this.authService.currentUserValue?.id || 'guest';
    const newCalculation: Calculation = {
      ...calculation,
      id: Date.now().toString(),
      userId,
      createdAt: new Date()
    };
    
    let calculations = [...this.calculationsSubject.value, newCalculation];
    // enforce retention/limit after adding
    calculations = this.applyPlanLimits(calculations);
    this.saveCalculations(calculations);
    return newCalculation;
  }

  deleteCalculation(id: string): boolean {
    const calculations = this.calculationsSubject.value.filter(c => c.id !== id);
    this.saveCalculations(calculations);
    return true;
  }

  // remove old or excess calculations according to subscription plan
  private applyPlanLimits(calculations: Calculation[]): Calculation[] {
    const subscription = this.subscriptionService.getCurrentSubscription();
    if (!subscription) {
      return calculations;
    }

    let maxCount = Infinity;
    let expiryDays = Infinity;

    if (subscription.currentPlan === 'free') {
      maxCount = 3;
      expiryDays = 30;
    } else if (subscription.currentPlan === 'basic') {
      maxCount = 10;
      expiryDays = 60;
    } else if (subscription.currentPlan === 'pro') {
      maxCount = Infinity;
      expiryDays = Infinity;
    }

    const now = new Date().getTime();
    // filter by expiry
    let filtered = calculations.filter(c => {
      const age = (now - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return age <= expiryDays;
    });

    // if still over max count, remove oldest
    if (filtered.length > maxCount) {
      filtered = filtered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxCount);
    }

    return filtered;
  }

  /**
   * How many calculations the current user may save based on plan.
   */
  getSavedLimit(): number {
    const subscription = this.subscriptionService.getCurrentSubscription();
    if (!subscription) { return 0; }
    switch (subscription.currentPlan) {
      case 'free': return 3;
      case 'basic': return 10;
      case 'pro': return Infinity;
    }
  }

  /**
   * How many days a saved calculation should be kept before expiring.
   */
  getExpiryDays(): number {
    const subscription = this.subscriptionService.getCurrentSubscription();
    if (!subscription) { return 0; }
    switch (subscription.currentPlan) {
      case 'free': return 30;
      case 'basic': return 60;
      case 'pro': return Infinity;
    }
  }

  /**
   * Remaining slots the user can save at the moment (after pruning).
   */
  getRemainingSlots(): number {
    const limit = this.getSavedLimit();
    if (limit === Infinity) { return Infinity; }
    const current = this.getCalculations().length;
    return Math.max(limit - current, 0);
  }

  /**
   * Run plan limit/expiry enforcement immediately and persist.
   * Useful to call when subscription changes.
   */
  enforceLimits(): void {
    const pruned = this.applyPlanLimits(this.calculationsSubject.value);
    if (pruned.length !== this.calculationsSubject.value.length) {
      this.saveCalculations(pruned);
    }
  }

  getCalculationSummary(): CalculationSummary {
    const calculations = this.calculationsSubject.value;
    const totalCalculations = calculations.length;
    const averageProfit = calculations.length > 0
      ? calculations.reduce((sum, c) => sum + c.profitAmount, 0) / calculations.length
      : 0;
    const totalMaterialsUsed = calculations.reduce((sum, c) => 
      sum + c.materials.reduce((mSum, m) => mSum + m.quantity, 0), 0
    );
    const recentCalculations = calculations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalCalculations,
      averageProfit,
      totalMaterialsUsed,
      recentCalculations
    };
  }

  searchCalculations(query: string): Calculation[] {
    const lowerQuery = query.toLowerCase();
    return this.calculationsSubject.value.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery) ||
      c.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  filterByCategory(category: string): Calculation[] {
    return this.calculationsSubject.value.filter(c => c.category === category);
  }

  sortCalculations(sortBy: 'date' | 'profit' | 'name', order: 'asc' | 'desc' = 'desc'): Calculation[] {
    const calculations = [...this.calculationsSubject.value];
    
    calculations.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'date':
          compareValue = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'profit':
          compareValue = b.profitAmount - a.profitAmount;
          break;
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
      }
      
      return order === 'asc' ? -compareValue : compareValue;
    });
    
    return calculations;
  }
}
