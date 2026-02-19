import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CalculationService } from '../../services/calculation.service';
import { Calculation } from '../../models/calculation.model';

@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  calculations: Calculation[] = [];
  filteredCalculations: Calculation[] = [];
  searchQuery: string = '';
  sortBy: 'date' | 'profit' | 'name' = 'date';
  sidebarOpen: boolean = false;

  constructor(private calculationService: CalculationService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.calculations = this.calculationService.getCalculations();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.searchQuery 
      ? this.calculationService.searchCalculations(this.searchQuery)
      : this.calculations;
    this.filteredCalculations = this.calculationService.sortCalculations(this.sortBy, 'desc').filter(c => 
      filtered.some(f => f.id === c.id)
    );
  }

  deleteCalculation(id: string): void {
    if (confirm('Are you sure you want to delete this calculation?')) {
      this.calculationService.deleteCalculation(id);
      this.loadHistory();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
