import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() isCollapsed: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();
  
  currentUser: User | null = null;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/finalboss']);
    this.closeSidebar.emit();
  }

  onNavigate(): void {
    this.closeSidebar.emit();
  }

  toggleCollapseSidebar(): void {
    this.toggleCollapse.emit();
  }

  onOverlayClick(): void {
    this.closeSidebar.emit();
  }

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === 'superadmin';
  }
}
