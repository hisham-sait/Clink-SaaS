import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-statutory',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="d-flex flex-column h-100">
      <!-- Main Content -->
      <div class="flex-grow-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class StatutoryComponent {}
