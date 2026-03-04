import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly STORAGE_KEY = 'currentUser';
  private readonly USERS_KEY = 'users';

  // Mock credentials
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'Test User',
      email: 'user@test.com',
      password: 'user123',
      role: 'user',
      subscriptionPlan: 'free',
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      subscriptionPlan: 'pro',
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'SuperAdmin User',
      email: 'superadmin@test.com',
      password: 'superadmin123',
      role: 'superadmin',
      subscriptionPlan: 'pro',
      createdAt: new Date()
    }
  ];

  constructor() {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Initialize users in localStorage - always check and update with latest mockUsers
    const storedUsers = localStorage.getItem(this.USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.mockUsers));
    } else {
      // Ensure all mock users exist in localStorage (in case new users were added)
      const users = JSON.parse(storedUsers);
      const superAdminExists = users.some((u: User) => u.email === 'superadmin@test.com');
      if (!superAdminExists) {
        const updatedUsers = [...users, this.mockUsers[2]]; // Add superadmin if missing
        localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {
      const users: User[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        observer.next(user);
        observer.complete();
      } else {
        observer.error({ message: 'Invalid email or password' });
      }
    });
  }

  signup(name: string, email: string, password: string): Observable<User> {
    return new Observable(observer => {
      const users: User[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
      
      if (users.some(u => u.email === email)) {
        observer.error({ message: 'Email already exists' });
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: 'user',
        subscriptionPlan: 'free',
        createdAt: new Date()
      };

      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);
      
      observer.next(newUser);
      observer.complete();
    });
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  updateProfile(name: string, email: string): Observable<User> {
    return new Observable(observer => {
      const currentUser = this.currentUserValue;
      if (!currentUser) {
        observer.error({ message: 'No user logged in' });
        return;
      }

      const users: User[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name, email };
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users[userIndex]));
        this.currentUserSubject.next(users[userIndex]);
        observer.next(users[userIndex]);
        observer.complete();
      } else {
        observer.error({ message: 'User not found' });
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }
}
