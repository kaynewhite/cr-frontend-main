import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PaymentRequest } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly STORAGE_KEY = 'paymentRequests';
  private requestsSubject: BehaviorSubject<PaymentRequest[]>;
  public requests$: Observable<PaymentRequest[]>;

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const arr: PaymentRequest[] = stored ? JSON.parse(stored) : [];
    this.requestsSubject = new BehaviorSubject<PaymentRequest[]>(arr);
    this.requests$ = this.requestsSubject.asObservable();
  }

  private saveAll(reqs: PaymentRequest[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reqs));
    this.requestsSubject.next(reqs);
  }

  getAll(): Observable<PaymentRequest[]> {
    return of(this.requestsSubject.value);
  }

  add(request: PaymentRequest): Observable<void> {
    const all = [...this.requestsSubject.value, request];
    this.saveAll(all);
    return of(void 0);
  }

  update(id: string, changes: Partial<PaymentRequest>): Observable<void> {
    const all = this.requestsSubject.value.map(r => 
      r.id === id ? { ...r, ...changes } : r
    );
    this.saveAll(all);
    return of(void 0);
  }

  findById(id: string): Observable<PaymentRequest | undefined> {
    return of(this.requestsSubject.value.find(r => r.id === id));
  }
}
