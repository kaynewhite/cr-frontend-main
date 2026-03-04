import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';
import { ThemeService } from '../../services/theme.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  subscription: string;
  status: string;
  createdAt: string;
  calculationCount: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: UserDetail[] = [];
  filteredUsers: UserDetail[] = [];
  searchTerm = '';
  subscriptionFilter = 'all';
  isLoading = true;
  sidebarOpen = false;
  sidebarCollapsed = false;
  isDarkMode = false;

  subscriptionOptions = ['all', 'free', 'basic', 'pro'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Initialize theme
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    const currentUser = (this.authService as any).currentUserValue;
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
      this.router.navigate(['/finalboss']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    // Get all users from localStorage
    const usersStr = localStorage.getItem('users');
    const allStoredUsers = usersStr ? JSON.parse(usersStr) : [];
    
    // Filter out admin/superadmin from the user list
    const regularUsers = allStoredUsers.filter((u: any) => u.role === 'user');

    // Count calculations per user
    const savedCalcsStr = localStorage.getItem('savedCalculations');
    const savedCalcs = savedCalcsStr ? JSON.parse(savedCalcsStr) : [];
    const calcCounts: { [key: string]: number } = {};
    
    savedCalcs.forEach((calc: any) => {
      const userId = calc.userId || 'unknown';
      calcCounts[userId] = (calcCounts[userId] || 0) + 1;
    });

    // Map users to detail interface
    this.users = regularUsers.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      subscription: user.subscriptionPlan || 'free',
      status: this.getSubscriptionStatus(user.id),
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      calculationCount: calcCounts[user.id] || 0
    }));

    this.applyFilters();
    this.isLoading = false;
  }

  getSubscriptionStatus(userId: string): string {
    const subStr = localStorage.getItem(`subscription_${userId}`);
    if (!subStr) return 'inactive';
    
    const sub = JSON.parse(subStr);
    return sub.status || 'inactive';
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filter by subscription plan
    if (this.subscriptionFilter !== 'all') {
      filtered = filtered.filter(u => u.subscription === this.subscriptionFilter);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id.includes(term)
      );
    }

    this.filteredUsers = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getUserSubscriptionName(plan: string): string {
    const plans = this.subscriptionService.getPlans();
    const found = plans.find(p => p.id === plan);
    return found ? found.name : plan.charAt(0).toUpperCase() + plan.slice(1);
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
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
