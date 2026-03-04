import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SubscriptionExpiryBannerComponent } from '../subscription-expiry-banner/subscription-expiry-banner.component';
import { CalculationService } from '../../services/calculation.service';
import { MaterialService } from '../../services/material.service';
import { SidebarService } from '../../services/sidebar.service';
import { CalculationSummary, Calculation } from '../../models/calculation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, SubscriptionExpiryBannerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: CalculationSummary | null = null;
  isLoading: boolean = true;
  sidebarOpen: boolean = false;
  sidebarCollapsed: boolean = false;
  recentSaved: Calculation[] = [];
  savedLimit: number = Infinity;
  Infinity = Infinity;
  private sidebarSubscription: Subscription;

  constructor(
    public calculationService: CalculationService,
    private materialService: MaterialService,
    private sidebarService: SidebarService
  ) {
    this.sidebarSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.sidebarCollapsed = collapsed;
    });
  }

  ngOnDestroy(): void {
    this.sidebarSubscription.unsubscribe();
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

  toggleSidebarCollapse(): void {
    this.sidebarService.toggleCollapsed();
  }
}
