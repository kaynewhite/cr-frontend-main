import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SubscriptionLog, SystemLog } from '../models/subscription-log.model';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly SUB_LOGS_KEY = 'subscriptionLogs';
  private readonly SYS_LOGS_KEY = 'systemLogs';
  
  private subLogsSubject: BehaviorSubject<SubscriptionLog[]>;
  private sysLogsSubject: BehaviorSubject<SystemLog[]>;
  
  public subscriptionLogs$: Observable<SubscriptionLog[]>;
  public systemLogs$: Observable<SystemLog[]>;

  constructor() {
    const storedSubLogs = localStorage.getItem(this.SUB_LOGS_KEY);
    const storedSysLogs = localStorage.getItem(this.SYS_LOGS_KEY);
    
    const subLogs: SubscriptionLog[] = storedSubLogs ? JSON.parse(storedSubLogs) : [];
    const sysLogs: SystemLog[] = storedSysLogs ? JSON.parse(storedSysLogs) : [];
    
    this.subLogsSubject = new BehaviorSubject<SubscriptionLog[]>(subLogs);
    this.sysLogsSubject = new BehaviorSubject<SystemLog[]>(sysLogs);
    
    this.subscriptionLogs$ = this.subLogsSubject.asObservable();
    this.systemLogs$ = this.sysLogsSubject.asObservable();
  }

  // Subscription Logs
  addSubscriptionLog(log: SubscriptionLog): Observable<void> {
    const logs = [...this.subLogsSubject.value, log];
    localStorage.setItem(this.SUB_LOGS_KEY, JSON.stringify(logs));
    this.subLogsSubject.next(logs);
    return of(void 0);
  }

  getSubscriptionLogs(): Observable<SubscriptionLog[]> {
    return of(this.subLogsSubject.value);
  }

  getSubscriptionLogsByUser(userId: string): Observable<SubscriptionLog[]> {
    return of(this.subLogsSubject.value.filter(log => log.userId === userId));
  }

  // System Logs
  addSystemLog(log: SystemLog): Observable<void> {
    const logs = [...this.sysLogsSubject.value, log];
    localStorage.setItem(this.SYS_LOGS_KEY, JSON.stringify(logs));
    this.sysLogsSubject.next(logs);
    return of(void 0);
  }

  getSystemLogs(): Observable<SystemLog[]> {
    return of(this.sysLogsSubject.value);
  }

  getSystemLogsByType(type: string): Observable<SystemLog[]> {
    return of(this.sysLogsSubject.value.filter(log => log.type === type));
  }

  getSystemLogsByDateRange(startDate: Date, endDate: Date): Observable<SystemLog[]> {
    return of(this.sysLogsSubject.value.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    }));
  }

  clearSystemLogs(): Observable<void> {
    localStorage.removeItem(this.SYS_LOGS_KEY);
    this.sysLogsSubject.next([]);
    return of(void 0);
  }
}
