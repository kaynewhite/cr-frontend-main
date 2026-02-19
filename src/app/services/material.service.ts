import { Injectable } from '@angular/core';
import { Material } from '../models/material.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private readonly MATERIALS_KEY = 'materials';
  private materialsSubject: BehaviorSubject<Material[]>;
  public materials$: Observable<Material[]>;

  // Sample materials
  private sampleMaterials: Material[] = [
    {
      id: '1',
      name: 'Colored Paper A4',
      quantity: 500,
      costPerUnit: 0.15,
      unit: 'sheet',
      category: 'Paper',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: '2',
      name: 'Glue Stick',
      quantity: 20,
      costPerUnit: 2.50,
      unit: 'piece',
      category: 'Adhesive',
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05')
    },
    {
      id: '3',
      name: 'Ribbon Roll',
      quantity: 10,
      costPerUnit: 5.00,
      unit: 'roll',
      category: 'Decoration',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    },
    {
      id: '4',
      name: 'Cardstock Pack',
      quantity: 15,
      costPerUnit: 8.00,
      unit: 'pack',
      category: 'Paper',
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-12')
    },
    {
      id: '5',
      name: 'Acrylic Paint Set',
      quantity: 5,
      costPerUnit: 15.00,
      unit: 'piece',
      category: 'Paint',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15')
    }
  ];

  constructor(private authService: AuthService) {
    const userId = this.authService.currentUserValue?.id || 'guest';
    const key = `${this.MATERIALS_KEY}_${userId}`;
    
    let materials = this.loadMaterials(key);
    if (materials.length === 0) {
      materials = this.sampleMaterials;
      localStorage.setItem(key, JSON.stringify(materials));
    }
    
    this.materialsSubject = new BehaviorSubject<Material[]>(materials);
    this.materials$ = this.materialsSubject.asObservable();
  }

  private loadMaterials(key: string): Material[] {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveMaterials(materials: Material[]): void {
    const userId = this.authService.currentUserValue?.id || 'guest';
    const key = `${this.MATERIALS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(materials));
    this.materialsSubject.next(materials);
  }

  getMaterials(): Material[] {
    return this.materialsSubject.value;
  }

  getMaterialById(id: string): Material | undefined {
    return this.materialsSubject.value.find(m => m.id === id);
  }

  addMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const materials = [...this.materialsSubject.value, newMaterial];
    this.saveMaterials(materials);
    return newMaterial;
  }

  updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const materials = this.materialsSubject.value;
    const index = materials.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    materials[index] = {
      ...materials[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveMaterials(materials);
    return materials[index];
  }

  deleteMaterial(id: string): boolean {
    const materials = this.materialsSubject.value.filter(m => m.id !== id);
    this.saveMaterials(materials);
    return true;
  }

  searchMaterials(query: string): Material[] {
    const lowerQuery = query.toLowerCase();
    return this.materialsSubject.value.filter(m =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.category?.toLowerCase().includes(lowerQuery)
    );
  }
}
