import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,
    RouterLink,
    RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  constructor(public authService: AuthService) {}
   isOpen = signal(true);

  onToggle() {
    this.isOpen.set(!this.isOpen());
  }
}
