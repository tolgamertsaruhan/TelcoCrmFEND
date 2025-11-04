import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  constructor(public authService: AuthService) {}

  getUserFullName(): string {
  const email = this.authService.userState().user?.sub;
  if (!email) return '';
  const namePart = email.split('@')[0]; // maria.garcia
  const parts = namePart.split('.');
  // İlk harfleri büyük yap
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}
}
