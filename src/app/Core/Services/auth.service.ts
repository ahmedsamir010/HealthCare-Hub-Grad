import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { ChangePassword } from '../Models/ChangePassword';
import { LoginResonse } from '../Models/loginRespone';
import { VerEmail } from '../Models/EmailVerify';
import { Login } from '../Models/LoginForm';
import { Register } from '../Models/RegisterForm';
import { ResetPassword } from '../Models/resetPassword';
import { User } from '../Models/User';
import { env } from 'src/assets/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  apiUrl: string = env.api;
  user = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(data: Login) {
    return this.http.post<LoginResonse>(`${this.apiUrl}/Account/Login`, data).pipe(
      catchError((err) => {
        console.log(err);
        if (err.error === 'User is registered but the account is not activated') {
          return throwError(() => new Error('User Account not activated'));
        } else if (err.error && err.error.message) {
          return throwError(() => new Error(err.error.message));
        } else {
          return throwError(() => new Error('Unknown Error has Occurred'));
        }
      }),
      tap((d: LoginResonse) => {
        localStorage.setItem('token', d.token);
        const role = this.getRole();
        if (role) {
          localStorage.setItem('role', role);
          this.navigateBasedOnRole(role);
        }
      })
    );
  }

  signup(data: Register) {
    return this.http.post(`${this.apiUrl}/Account/Register`, data).pipe(
      catchError((err) => {
        console.log(err);
        if (err.error[0].code) {
          return throwError(() => err.error[0].code);
        } else if (err.error.message) {
          return throwError(() => err.error.message);
        }
        return throwError(() => err.error.message);
      })
    );
  }

  verifyEmail(data: VerEmail) {
    return this.http.post(`${this.apiUrl}/Account/Verify-Email`, data).pipe(
      catchError((err) => {
        console.log(err);
        if (err.error == 'Ha Ha Ha User is already verified') {
          return throwError(() => 'This Email Already Verified');
        } else {
          return throwError(() => err);
        }
      })
    );
  }

  forgotPassword(data: string) {
    return this.http.post(`${this.apiUrl}/Account/ForgotPassword`, { email: data }).pipe(
      catchError((err) => {
        if (!err || !err.message || !err.error.message) {
          return throwError(() => 'Unknown Error has Occurred');
        }
        return throwError(() => err.error.message);
      })
    );
  }

  changePassword(data: ChangePassword) {
    return this.http.post(`${this.apiUrl}/Account/ChangePassword`, data).pipe(
      catchError((err) => {
        console.log(err);
        return throwError(() => err);
      })
    );
  }

  resetPassword(data: ResetPassword) {
    return this.http.post(`${this.apiUrl}/Account/ResetPassword`, data).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getRole(): string | null {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      try {
        const decodedToken: any = jwtDecode(userToken);
        return decodedToken.role || null;
      } catch (error) {
        console.error('Invalid token format', error);
        return null;
      }
    }
    return null;
  }

  getUserData() {
    return this.http.get(`${this.apiUrl}/Account/GetCurrentuser`).pipe(
      take(1),
      catchError((err) => {
        console.log(err);
        return throwError(() => err);
      })
    );
  }

  updateUserinfo(data: FormData) {
    return this.http.put(`${this.apiUrl}/Account/UpdateCurrentUser`, data).pipe(
      catchError((err) => {
        console.log(err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  setCurrentUser(user: User) {
    localStorage.setItem('token', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  navigateBasedOnRole(role: string) {
    switch (role) {
      case 'Nurse':
        this.router.navigate(['/dashboard/nurse/appointments']);
        break;
      case 'Doctor':
        this.router.navigate(['/dashboard/doctor/appointments']);
        break;
      case 'User':
        this.router.navigate(['/home']);
        break;
      case 'AdminLab':
        this.router.navigate(['/dashboard/admin-lab/appointment']);
        break;
      case 'Admin':
        this.router.navigate(['/dashboard/admin/manage-doctors']);
        break;
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
}