import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../models/material.model';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  searchQuery: string = '';
  showAddModal: boolean = false;
  editingMaterial: Material | null = null;
  sidebarOpen: boolean = false;
  
  newMaterial = {
    name: '',
    quantity: 0,
    costPerUnit: 0,
    unit: 'piece' as 'piece' | 'pack' | 'roll' | 'sheet' | 'ream' | 'meter',
    category: ''
  };

  constructor(private materialService: MaterialService) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.materials = this.materialService.getMaterials();
    this.filteredMaterials = this.materials;
  }

  searchMaterials(): void {
    if (!this.searchQuery) {
      this.filteredMaterials = this.materials;
    } else {
      this.filteredMaterials = this.materialService.searchMaterials(this.searchQuery);
    }
  }

  addMaterial(): void {
    if (!this.newMaterial.name || this.newMaterial.quantity <= 0 || this.newMaterial.costPerUnit <= 0) {
      alert('Please fill in all fields correctly');
      return;
    }

    this.materialService.addMaterial(this.newMaterial);
    this.loadMaterials();
    this.showAddModal = false;
    this.resetForm();
  }

  deleteMaterial(id: string): void {
    if (confirm('Are you sure you want to delete this material?')) {
      this.materialService.deleteMaterial(id);
      this.loadMaterials();
    }
  }

  resetForm(): void {
    this.newMaterial = { name: '', quantity: 0, costPerUnit: 0, unit: 'piece', category: '' };
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
