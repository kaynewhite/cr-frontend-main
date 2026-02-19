import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CalculationService } from '../../services/calculation.service';
import { MaterialService } from '../../services/material.service';
import { Material, MaterialInput } from '../../models/material.model';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css'
})
export class CalculatorComponent implements OnInit {
  calculationName: string = '';
  category: string = '';
  profitMarginPercent: number = 50;
  materials: Material[] = [];
  selectedMaterials: MaterialInput[] = [];
  totalCost: number = 0;
  suggestedPrice: number = 0;
  profitAmount: number = 0;
  sidebarOpen: boolean = false;

  constructor(
    private calculationService: CalculationService,
    private materialService: MaterialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.materials = this.materialService.getMaterials();
  }

  addMaterial(material: Material): void {
    const existing = this.selectedMaterials.find(m => m.materialId === material.id);
    if (!existing) {
      this.selectedMaterials.push({
        materialId: material.id,
        materialName: material.name,
        quantity: 1,
        costPerUnit: material.costPerUnit,
        subtotal: material.costPerUnit
      });
      this.calculate();
    }
  }

  removeMaterial(index: number): void {
    this.selectedMaterials.splice(index, 1);
    this.calculate();
  }

  updateQuantity(index: number, quantity: number): void {
    if (quantity > 0) {
      this.selectedMaterials[index].quantity = quantity;
      this.selectedMaterials[index].subtotal = quantity * this.selectedMaterials[index].costPerUnit;
      this.calculate();
    }
  }

  calculate(): void {
    this.totalCost = this.selectedMaterials.reduce((sum, m) => sum + m.subtotal, 0);
    this.suggestedPrice = this.totalCost * (1 + this.profitMarginPercent / 100);
    this.profitAmount = this.suggestedPrice - this.totalCost;
  }

  saveCalculation(): void {
    if (!this.calculationName || !this.category || this.selectedMaterials.length === 0) {
      alert('Please fill in all required fields and add at least one material');
      return;
    }

    this.calculationService.addCalculation({
      name: this.calculationName,
      category: this.category,
      materials: this.selectedMaterials,
      totalCost: this.totalCost,
      suggestedPrice: this.suggestedPrice,
      profitMargin: this.profitMarginPercent,
      profitAmount: this.profitAmount,
      userId: ''
    });

    alert('Calculation saved successfully!');
    this.router.navigate(['/history']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
