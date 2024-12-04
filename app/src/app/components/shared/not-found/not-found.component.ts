import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NotFoundComponent {
  private location = inject(Location);
  protected window = window;

  goBack(): void {
    this.location.back();
  }
}
