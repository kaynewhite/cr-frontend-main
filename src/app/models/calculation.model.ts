import { MaterialInput } from './material.model';

export interface Calculation {
  id: string;
  userId: string;
  name: string;
  category: string;
  materials: MaterialInput[];
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
  profitAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface CalculationSummary {
  totalCalculations: number;
  averageProfit: number;
  totalMaterialsUsed: number;
  recentCalculations: Calculation[];
}
