import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';
  private isCollapsed = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsed.asObservable();

  constructor() {
    const savedState = localStorage.getItem(this.SIDEBAR_COLLAPSED_KEY);
    const collapsed = savedState === 'true';
    this.setCollapsed(collapsed);
  }

  toggleCollapsed(): void {
    this.setCollapsed(!this.isCollapsed.value);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.next(collapsed);
    localStorage.setItem(this.SIDEBAR_COLLAPSED_KEY, collapsed.toString());
  }

  getCollapsed(): boolean {
    return this.isCollapsed.value;
  }
}
