import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor() {
    // Always logged in as dummy user
    const dummyUser: User = {
      id: '1',
      name: 'Test User',
      email: 'user@test.com',
      password: '',
      role: 'user',
      subscriptionPlan: 'free',
      createdAt: new Date(),
      status: 'active'
    };
    this.currentUserSubject = new BehaviorSubject<User | null>(dummyUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {
      // Always succeed
      const user: User = {
        id: '1',
        name: 'Test User',
        email: email,
        password: '',
        role: 'user',
        subscriptionPlan: 'free',
        createdAt: new Date(),
        status: 'active'
      };
      this.currentUserSubject.next(user);
      observer.next(user);
      observer.complete();
    });
  }

  signup(name: string, email: string, password: string): Observable<User> {
    return new Observable(observer => {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: 'user',
        subscriptionPlan: 'free',
        createdAt: new Date(),
        status: 'active'
      };
      this.currentUserSubject.next(newUser);
      observer.next(newUser);
      observer.complete();
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  updateProfile(name: string, email: string): Observable<User> {
    return new Observable(observer => {
      const currentUser = this.currentUserValue;
      if (!currentUser) {
        observer.error({ message: 'No user logged in' });
        return;
      }
      const updatedUser = { ...currentUser, name, email };
      this.currentUserSubject.next(updatedUser);
      observer.next(updatedUser);
      observer.complete();
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }
}