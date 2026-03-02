import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CalculationService } from '../../services/calculation.service';
import { MaterialService } from '../../services/material.service';
import { CalculationSummary, Calculation } from '../../models/calculation.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  summary: CalculationSummary | null = null;
  isLoading: boolean = true;
  sidebarOpen: boolean = false;
  recentSaved: Calculation[] = [];
  savedLimit: number = Infinity;
  Infinity = Infinity;

  constructor(
    public calculationService: CalculationService,
    private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    setTimeout(() => {
      this.summary = this.calculationService.getCalculationSummary();
      // Show number of material types from inventory (each material type counts as 1)
      const materials = this.materialService.getMaterials();
      if (this.summary) {
        this.summary.totalMaterialsUsed = materials.length;
      }
      // Load recent saved calculations (max 3 on dashboard for preview)
      const allSaved = this.calculationService.getCalculations()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.savedLimit = this.calculationService.getSavedLimit();
      this.recentSaved = allSaved.slice(0, 3);
      this.isLoading = false;
    }, 500);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
