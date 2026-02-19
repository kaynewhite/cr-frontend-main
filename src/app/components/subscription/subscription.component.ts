import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionPlan, UserSubscription } from '../../models/subscription.model';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  currentSubscription: UserSubscription | null = null;
  isLoading: boolean = false;
  sidebarOpen: boolean = false;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.plans = this.subscriptionService.getPlans();
    this.currentSubscription = this.subscriptionService.getCurrentSubscription();
  }

  changePlan(planName: 'free' | 'basic' | 'pro'): void {
    if (this.currentSubscription?.currentPlan === planName) {
      return;
    }

    this.isLoading = true;
    this.subscriptionService.upgradePlan(planName).subscribe({
      next: (subscription) => {
        this.currentSubscription = subscription;
        this.isLoading = false;
        alert(`Successfully changed to ${planName.toUpperCase()} plan!`);
      },
      error: (error) => {
        this.isLoading = false;
        alert('Failed to change plan. Please try again.');
      }
    });
  }

  isCurrentPlan(planName: string): boolean {
    return this.currentSubscription?.currentPlan === planName;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
