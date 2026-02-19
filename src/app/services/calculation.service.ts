import { Injectable } from '@angular/core';
import { Calculation, CalculationSummary } from '../models/calculation.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
      name: 'Birthday Card Set',
      category: 'Cards',
      materials: [
        { materialId: '1', materialName: 'Colored Paper A4', quantity: 10, costPerUnit: 0.15, subtotal: 1.50 },
        { materialId: '2', materialName: 'Glue Stick', quantity: 1, costPerUnit: 2.50, subtotal: 2.50 }
      ],
      totalCost: 4.00,
      suggestedPrice: 12.00,
      profitMargin: 66.67,
      profitAmount: 8.00,
      notes: 'Set of 5 handmade birthday cards',
      createdAt: new Date('2026-01-20')
    },
    {
      id: '2',
      userId: '1',
      name: 'Gift Box Package',
      category: 'Packaging',
      materials: [
        { materialId: '4', materialName: 'Cardstock Pack', quantity: 1, costPerUnit: 8.00, subtotal: 8.00 },
        { materialId: '3', materialName: 'Ribbon Roll', quantity: 0.5, costPerUnit: 5.00, subtotal: 2.50 }
      ],
      totalCost: 10.50,
      suggestedPrice: 25.00,
      profitMargin: 58.00,
      profitAmount: 14.50,
      notes: 'Decorative gift box with ribbon',
      createdAt: new Date('2026-01-22')
    },
    {
      id: '3',
      userId: '1',
      name: 'Custom Notebook',
      category: 'Stationery',
      materials: [
        { materialId: '1', materialName: 'Colored Paper A4', quantity: 50, costPerUnit: 0.15, subtotal: 7.50 },
        { materialId: '5', materialName: 'Acrylic Paint Set', quantity: 0.2, costPerUnit: 15.00, subtotal: 3.00 }
      ],
      totalCost: 10.50,
      suggestedPrice: 30.00,
      profitMargin: 65.00,
      profitAmount: 19.50,
      notes: 'Hand-painted cover notebook',
      createdAt: new Date('2026-01-23')
    }
  ];

  constructor(private authService: AuthService) {
    const userId = this.authService.currentUserValue?.id || 'guest';
    const key = `${this.CALCULATIONS_KEY}_${userId}`;
    
    let calculations = this.loadCalculations(key);
    if (calculations.length === 0) {
      calculations = this.sampleCalculations;
      localStorage.setItem(key, JSON.stringify(calculations));
    }
    
    this.calculationsSubject = new BehaviorSubject<Calculation[]>(calculations);
    this.calculations$ = this.calculationsSubject.asObservable();
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
    return this.calculationsSubject.value;
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
    
    const calculations = [...this.calculationsSubject.value, newCalculation];
    this.saveCalculations(calculations);
    return newCalculation;
  }

  deleteCalculation(id: string): boolean {
    const calculations = this.calculationsSubject.value.filter(c => c.id !== id);
    this.saveCalculations(calculations);
    return true;
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
