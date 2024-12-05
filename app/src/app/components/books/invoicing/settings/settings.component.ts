import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class InvoiceSettingsComponent {
  saveSettings(): void {
    alert('Settings saved successfully!');
  }
}
