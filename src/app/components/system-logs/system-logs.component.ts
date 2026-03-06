import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';
import { ThemeService } from '../../services/theme.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SubscriptionLog, SystemLog } from '../../models/subscription-log.model';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.css']
})
export class SystemLogsComponent implements OnInit {
  subscriptionLogs: SubscriptionLog[] = [];
  systemLogs: SystemLog[] = [];
  filteredLogs: (SubscriptionLog | SystemLog)[] = [];

  activeTab: 'subscription' | 'system' = 'subscription';
  logTypeFilter = 'all';
  dateRangeStart = '';
  dateRangeEnd = '';
  isLoading = true;
  sidebarOpen = false;
  sidebarCollapsed = false;
  isDarkMode = false;

  logTypes = ['all', 'approval', 'rejection', 'error', 'system', 'maintenance'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private logService: LogService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // ensure theme classes applied
    this.themeService.setTheme(this.themeService.getCurrentTheme());
    // Initialize theme
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    const currentUser = (this.authService as any).currentUserValue;
    if (!currentUser || currentUser.role !== 'superadmin') {
      this.router.navigate(['/finalboss']);
      return;
    }

    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    
    this.logService.getSubscriptionLogs().subscribe(subLogs => {
      this.subscriptionLogs = subLogs;
    });

    this.logService.getSystemLogs().subscribe(sysLogs => {
      this.systemLogs = sysLogs;
      this.filterLogs();
      this.isLoading = false;
    });
  }

  switchTab(tab: 'subscription' | 'system'): void {
    this.activeTab = tab;
    this.logTypeFilter = 'all';
    this.filterLogs();
  }

  filterLogs(): void {
    if (this.activeTab === 'subscription') {
      this.filteredLogs = this.filterSubscriptionLogs();
    } else {
      this.filteredLogs = this.filterSystemLogs();
    }
  }

  filterSubscriptionLogs(): SubscriptionLog[] {
    let filtered = [...this.subscriptionLogs];

    if (this.dateRangeStart) {
      const startDate = new Date(this.dateRangeStart);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (this.dateRangeEnd) {
      const endDate = new Date(this.dateRangeEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  filterSystemLogs(): SystemLog[] {
    let filtered = [...this.systemLogs];

    if (this.logTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === this.logTypeFilter);
    }

    if (this.dateRangeStart) {
      const startDate = new Date(this.dateRangeStart);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (this.dateRangeEnd) {
      const endDate = new Date(this.dateRangeEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  onFilterChange(): void {
    this.filterLogs();
  }

  getLogTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'approval': '✓',
      'rejection': '✕',
      'error': '⚠',
      'system': '⚙',
      'maintenance': '🔧'
    };
    return icons[type] || '•';
  }

  getLogTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'approval': 'text-success',
      'rejection': 'text-danger',
      'error': 'text-warning',
      'system': 'text-info',
      'maintenance': 'text-secondary'
    };
    return colors[type] || 'text-muted';
  }

  clearSystemLogs(): void {
    if (!confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      return;
    }

    this.logService.clearSystemLogs().subscribe(() => {
      this.loadLogs();
    });
  }

  exportLogs(): void {
    const logsToExport = this.activeTab === 'subscription' ? this.filteredLogs : this.filteredLogs;
    const dataStr = JSON.stringify(logsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.activeTab}-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
