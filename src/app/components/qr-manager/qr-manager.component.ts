import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SubscriptionService } from '../../services/subscription.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-qr-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './qr-manager.component.html',
  styleUrls: ['./qr-manager.component.css']
})
export class QrManagerComponent implements OnInit {
  currentMayaQr: string | null = null;
  currentGcashQr: string | null = null;
  // upload state
  editingMethod: 'maya' | 'gcash' | null = null;
  newQrFile: File | null = null;
  newQrPreview: string | null = null;

  sidebarOpen = false;
  sidebarCollapsed = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // ensure theme classes applied so dark mode works here too
    this.themeService.setTheme(this.themeService.getCurrentTheme());
    this.currentMayaQr = this.subscriptionService.getMayaQr();
    this.currentGcashQr = this.subscriptionService.getGcashQr();
  }

  onFileChange(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.newQrFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newQrPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveQr(): void {
    if (!this.editingMethod) {
      alert('Please select a method first');
      return;
    }
    if (this.newQrPreview) {
      if (this.editingMethod === 'maya') {
        this.subscriptionService.setMayaQr(this.newQrPreview);
        this.currentMayaQr = this.newQrPreview;
      } else if (this.editingMethod === 'gcash') {
        this.subscriptionService.setGcashQr(this.newQrPreview);
        this.currentGcashQr = this.newQrPreview;
      }
      this.newQrFile = null;
      this.newQrPreview = null;
      alert(`${this.editingMethod.toUpperCase()} QR code updated successfully`);
    }
  }

  clearQr(method: 'maya' | 'gcash'): void {
    if (confirm(`Remove the current ${method.toUpperCase()} QR code?`)) {
      if (method === 'maya') {
        this.subscriptionService.setMayaQr(null);
        this.currentMayaQr = null;
      } else {
        this.subscriptionService.setGcashQr(null);
        this.currentGcashQr = null;
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onSidebarClose(): void {
    this.sidebarOpen = false;
  }

  onCollapseSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
