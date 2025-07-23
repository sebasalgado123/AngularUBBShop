import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    console.log('AuthGuard - Verificando acceso a:', state.url);
    console.log('AuthGuard - Usuario logueado:', this.auth.isLoggedIn());
    console.log('AuthGuard - Token:', this.auth.getToken());
    
    if (!this.auth.isLoggedIn()) {
      console.log('AuthGuard - Redirigiendo a login');
      return this.router.createUrlTree(['/login']);
    }
    // Protección extra para /admin
    if (state.url.startsWith('/admin') && !this.auth.hasRole('admin')) {
      return this.router.createUrlTree(['/']);
    }
    return true;
  }
} 