import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatedIndividualCustomerResponse } from '../../../models/individualcustomer/responses/CreateFullIndividualCustomerResponse';

@Component({
  selector: 'app-customer-information',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './customer-information.html',
  styleUrl: './customer-information.scss',
})
export class CustomerInformation {
  customerForm!: FormGroup;
  originalData: any;
  customerId!: string;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.parent?.snapshot.paramMap.get('id') || '';

     this.customerForm = this.fb.group({
      firstName: [
        { value: '', disabled: true }, 
        [Validators.required, Validators.minLength(2), Validators.maxLength(20)]
      ],
      middleName: [
        { value: '', disabled: true }, 
        [Validators.minLength(2), Validators.maxLength(20)]
      ],
      lastName: [
        { value: '', disabled: true }, 
        [Validators.required, Validators.minLength(2), Validators.maxLength(20)]
      ],
      gender: [{ value: '', disabled: true }, Validators.required],
      nationalId: [
        { value: '', disabled: true }, 
        [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^\d+$/)]
      ],
      dateOfBirth: [{ value: '', disabled: true }, Validators.required],
      motherName: [
        { value: '', disabled: true }, 
        [Validators.minLength(2), Validators.maxLength(20)]
      ],
      fatherName: [
        { value: '', disabled: true }, 
        [Validators.minLength(2), Validators.maxLength(20)]
      ],
    });

    // National ID için sadece sayı girişi kontrolü
    this.customerForm.get('nationalId')?.valueChanges.subscribe(value => {
      if (value) {
        const numericValue = value.replace(/\D/g, '');
        if (value !== numericValue) {
          this.customerForm.get('nationalId')?.setValue(numericValue, { emitEvent: false });
        }
      }
    });

    this.loadCustomer();
  }

  loadCustomer(): void {
    this.http
      .get<CreatedIndividualCustomerResponse>(
        `http://localhost:8091/customerservice/api/individual-customers/getById/${this.customerId}`
      )
      .subscribe({
        next: (res) => {
          this.customerForm.patchValue(res);
          this.originalData = { ...res };
          this.customerForm.disable();
        },
        error: (err) => console.error('Error loading customer:', err),
      });
  }

  onEdit(): void {
    this.isEditing = true;
    this.customerForm.enable();
  }

  onCancel(): void {
    this.isEditing = false;
    this.customerForm.patchValue(this.originalData);
    this.customerForm.disable();
  }

  onSave(): void {
    if (this.customerForm.valid) {
      //const updatedCustomer = this.customerForm.getRawValue();
      const updatedCustomer = {
        ...this.customerForm.getRawValue(),
        id: this.customerId, // customerId'yi component içinde tutuyoruz
      };
      this.http
        .put(`http://localhost:8091/customerservice/api/individual-customers/`, updatedCustomer)
        .subscribe({
          next: () => {
            alert('Customer information updated successfully!');
            this.isEditing = false;
            this.originalData = { ...updatedCustomer };
            this.customerForm.disable();
          },
          error: (err) => {
            console.error(err);
            alert('Error updating customer!');
          },
        });
    }
  }

  onDelete(): void {
    if (confirm('Emin misiniz? Bu müşteri soft delete edilecek.')) {
      this.http
        .delete(
          `http://localhost:8091/customerservice/api/individual-customers/${this.customerId}/soft`
        )
        .subscribe({
          next: () => {
            alert('Customer deleted successfully!');
            this.router.navigateByUrl('/customer-search');
          },
          error: (err) => {
            console.error(err);
            alert('Error deleting customer!');
          },
        });
    }
  }
}
