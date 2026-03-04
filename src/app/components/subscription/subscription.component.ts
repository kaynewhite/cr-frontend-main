import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SubscriptionService } from '../../services/subscription.service';
import { SidebarService } from '../../services/sidebar.service';
import { SubscriptionPlan, UserSubscription } from '../../models/subscription.model';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, SidebarComponent, PaymentModalComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  plans: SubscriptionPlan[] = [];
  currentSubscription: UserSubscription | null = null;
  isLoading: boolean = false;
  sidebarOpen: boolean = false;
  sidebarCollapsed: boolean = false;
  private sidebarSubscription: Subscription;

  // payment modal state
  showPaymentModal = false;
  pendingPlan: 'basic' | 'pro' | null = null;
  currentQrUrl: string | null = null; // would normally be fetched from server

  constructor(
    private subscriptionService: SubscriptionService,
    private sidebarService: SidebarService,
    private paymentService: PaymentService
  ) {
    this.sidebarSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.plans = this.subscriptionService.getPlans();
    this.currentSubscription = this.subscriptionService.getCurrentSubscription();
    
    // Subscribe to sidebar collapsed state
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.sidebarCollapsed = collapsed;
    });
  }

  changePlan(planName: 'free' | 'basic' | 'pro'): void {
    if (this.currentSubscription?.currentPlan === planName) {
      return;
    }

    // start payment flow for plan selection
    if (planName === 'basic' || planName === 'pro') {
      this.pendingPlan = planName;
      // fetch qr if exists (mocked)
      // in real app call service method
      this.currentQrUrl = null;
      this.showPaymentModal = true;
    } else {
      // free plan change can be immediate
      this.performPlanUpgrade(planName as any);
    }
  }

  performPlanUpgrade(planName: 'free' | 'basic' | 'pro') {
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

  // payment modal callbacks
  onPaymentCancel() {
    this.showPaymentModal = false;
    this.pendingPlan = null;
  }

  onPaymentSubmit(data: Partial<import('../../models/payment.model').PaymentRequest>) {
    // create request record
    if (this.pendingPlan && this.currentSubscription) {
      const payment: any = {
        id: Date.now().toString(),
        userId: this.currentSubscription.userId,
        plan: this.pendingPlan,
        method: data.method!,
        status: 'scanning',
        screenshotUrl: data.screenshotUrl,
        createdAt: new Date()
      };
      this.paymentService.add(payment);
    }

    this.showPaymentModal = false;
    alert('We are scanning your transactions, you will be approved within a day');
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleSidebarCollapse(): void {
    this.sidebarService.toggleCollapsed();
  }

  ngOnDestroy(): void {
    this.sidebarSubscription.unsubscribe();
  }
}
