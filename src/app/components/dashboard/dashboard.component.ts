import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CalculationService } from '../../services/calculation.service';
import { MaterialService } from '../../services/material.service';
import { CalculationSummary } from '../../models/calculation.model';

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

  constructor(
    private calculationService: CalculationService,
    private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    setTimeout(() => {
      this.summary = this.calculationService.getCalculationSummary();
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
