import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

interface Director {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: 'Active' | 'Resigned';
}

@Component({
  selector: 'app-create-director-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, NgbDropdownModule],
  templateUrl: './create-director-modal.component.html',
  styleUrls: ['./create-director-modal.component.scss']
})
export class CreateDirectorModalComponent implements OnInit {
  directorForm: FormGroup;

  titles = [
    'Mr',
    'Mrs',
    'Ms',
    'Miss',
    'Dr',
    'Prof'
  ];

  directorTypes = [
    'Executive Director',
    'Non-Executive Director',
    'Managing Director',
    'Independent Director',
    'Alternate Director'
  ];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.directorForm = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      resignationDate: [''],
      directorType: ['', Validators.required],
      occupation: ['', Validators.required],
      otherDirectorships: [''],
      shareholding: [''],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set default appointment date to today
    this.directorForm.patchValue({
      appointmentDate: new Date().toISOString().split('T')[0]
    });
  }

  onSubmit(): void {
    if (this.directorForm.valid) {
      const newDirector: Director = {
        ...this.directorForm.value,
        status: 'Active'
      };
      this.activeModal.close(newDirector);
    } else {
      Object.keys(this.directorForm.controls).forEach(key => {
        const control = this.directorForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
