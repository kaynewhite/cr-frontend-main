export interface Material {
  id: string;
  name: string;
  quantity: number;
  costPerUnit: number;
  unit: 'piece' | 'pack' | 'roll' | 'sheet' | 'ream' | 'meter';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialInput {
  materialId: string;
  materialName: string;
  quantity: number;
  costPerUnit: number;
  subtotal: number;
}
