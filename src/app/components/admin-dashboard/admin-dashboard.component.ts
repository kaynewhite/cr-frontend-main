import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { LogService } from '../../services/log.service';
import { CalculationService } from '../../services/calculation.service';
import { SubscriptionService } from '../../services/subscription.service';
import { ThemeService } from '../../services/theme.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TopUser {
  id: string;
  name: string;
  email: string;
  calculationCount: number;
  subscription: string;
}

interface MonthlyRevenue {
  total: number;
  approvedCount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  topUsers: TopUser[] = [];
  monthlyRevenue: MonthlyRevenue = { total: 0, approvedCount: 0 };
  pendingPayments: any[] = [];
  allPayments: any[] = [];
  isLoading = true;
  isSuperAdmin = false;
  isApprovingAll = false;
  sidebarOpen = false;
  sidebarCollapsed = false;
  isDarkMode = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService,
    private logService: LogService,
    private calculationService: CalculationService,
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // ensure body classes set for theme
    this.themeService.setTheme(this.themeService.getCurrentTheme());
    // Initialize theme
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.currentUser = (this.authService as any).currentUserValue;
    this.isSuperAdmin = this.currentUser?.role === 'superadmin';

    if (!this.currentUser || (this.currentUser.role !== 'admin' && this.currentUser.role !== 'superadmin')) {
      this.router.navigate(['/finalboss']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all payments
    this.paymentService.getAll().subscribe({
      next: (payments) => {
        this.allPayments = payments;
        this.pendingPayments = payments.filter(p => p.status === 'pending');
        this.calculateMonthlyRevenue();
        this.calculateTopUsers();
        this.isLoading = false;
      }
    });
  }

  calculateMonthlyRevenue(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const approvedThisMonth = this.allPayments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return p.status === 'approved' 
        && paymentDate.getMonth() === currentMonth 
        && paymentDate.getFullYear() === currentYear;
    });

    this.monthlyRevenue.approvedCount = approvedThisMonth.length;
    
    // Calculate total revenue based on plan pricing
    this.monthlyRevenue.total = approvedThisMonth.reduce((sum, payment) => {
      const plan = this.subscriptionService.getPlans().find(p => p.id === payment.plan);
      return sum + (plan?.price || 0);
    }, 0);
  }

  calculateTopUsers(): void {
    // Get all users from localStorage
    const usersStr = localStorage.getItem('users');
    const allUsers = usersStr ? JSON.parse(usersStr) : [];
    const regularUsers = allUsers.filter((u: any) => u.role === 'user');

    // Count calculations per user from localStorage
    const userCalculations: { [key: string]: number } = {};
    const savedCalculations = localStorage.getItem('savedCalculations');
    
    if (savedCalculations) {
      try {
        const calculations = JSON.parse(savedCalculations);
        calculations.forEach((calc: any) => {
          const userId = calc.userId || 'unknown';
          userCalculations[userId] = (userCalculations[userId] || 0) + 1;
        });
      } catch (e) {
        console.error('Failed to parse calculations', e);
      }
    }

    // Map users with calculation counts
    this.topUsers = regularUsers
      .map((user: any) => {
        const subStr = localStorage.getItem(`subscription_${user.id}`);
        const subscription = subStr ? JSON.parse(subStr).plan : user.subscriptionPlan || 'free';
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          calculationCount: userCalculations[user.id] || 0,
          subscription
        };
      })
      .sort((a: TopUser, b: TopUser) => b.calculationCount - a.calculationCount)
      .slice(0, 3);
  }

  getSampleSubscription(userId: string): string {
    // Mock subscription status - in a real app, fetch from database
    const subscriptions: { [key: string]: string } = {
      '1': 'Pro',
      '3': 'Basic',
      '4': 'Free'
    };
    return subscriptions[userId] || 'Free';
  }

  approvePendingPayments(): void {
    if (this.pendingPayments.length === 0) {
      alert('No pending payments to approve');
      return;
    }

    if (!confirm(`Approve all ${this.pendingPayments.length} pending payments?`)) {
      return;
    }

    this.isApprovingAll = true;
    let approved = 0;
    const totalToApprove = this.pendingPayments.length;

    this.pendingPayments.forEach((payment, index) => {
      this.paymentService.update(payment.id, { 
        status: 'approved',
        approvedBy: this.currentUser.id,
        approvedAt: new Date().toISOString()
      }).subscribe({
        next: () => {
          // Log the subscription approval
          const plan = this.subscriptionService.getPlans().find(p => p.id === payment.plan);
          this.logService.addSubscriptionLog({
            id: `log_${Date.now()}_${index}`,
            userId: payment.userId,
            action: 'approved',
            plan: payment.plan,
            cost: plan?.price || 0,
            approvedBy: this.currentUser.name,
            timestamp: new Date().toISOString()
          }).subscribe();

          // update user subscription via service
          this.subscriptionService.upgradePlanForUser(payment.userId, payment.plan).subscribe();

          approved++;
          if (approved === totalToApprove) {
            this.isApprovingAll = false;
            alert(`Successfully approved ${approved} payments!`);
            this.loadDashboardData();
          }
        },
        error: (err) => {
          console.error('Error approving payment', err);
          approved++;
          if (approved === totalToApprove) {
            this.isApprovingAll = false;
            this.loadDashboardData();
          }
        }
      });
    });
  }

  viewPaymentApprovals(): void {
    this.router.navigate(['/admin-payments']);
  }

  viewUserManagement(): void {
    this.router.navigate(['/admin-users']);
  }

  viewSystemLogs(): void {
    this.router.navigate(['/admin-logs']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/finalboss']);
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
