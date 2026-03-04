import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-subscription-expiry-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-expiry-banner.component.html',
  styleUrl: './subscription-expiry-banner.component.css'
})
export class SubscriptionExpiryBannerComponent implements OnInit {
  showBanner = false;
  daysRemaining = 0;
  expiryDate: Date | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkSubscriptionExpiry();
  }

  checkSubscriptionExpiry(): void {
    const currentUser = (this.authService as any).currentUserValue;
    if (!currentUser) {
      this.showBanner = false;
      return;
    }

    // Get subscription end date from localStorage
    const subKey = `subscription_${currentUser.id}`;
    const subscriptionData = localStorage.getItem(subKey);
    
    if (!subscriptionData) {
      this.showBanner = false;
      return;
    }

    const subscription = JSON.parse(subscriptionData);
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days for 1 month
    
    this.expiryDate = endDate;
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    this.daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Show banner if within 7 days OR already expired
    this.showBanner = this.daysRemaining <= 7;
  }

  extendSubscription(): void {
    this.router.navigate(['/subscription']);
  }

  closeBanner(): void {
    this.showBanner = false;
  }
}
