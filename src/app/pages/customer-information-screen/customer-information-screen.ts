import { Component } from '@angular/core';
import { CreatedIndividualCustomerResponse } from '../../models/individualcustomer/responses/CreateFullIndividualCustomerResponse';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-information-screen',
  imports: [],
  templateUrl: './customer-information-screen.html',
  styleUrl: './customer-information-screen.scss',
})
export class CustomerInformationScreen {

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
    this.customerId = this.route.snapshot.paramMap.get('id') || '';
 
    this.customerForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      middleName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }, Validators.required],
      gender: [{ value: '', disabled: true }, Validators.required],
      nationalId: [{ value: '', disabled: true }, Validators.required],
      birthDate: [{ value: '', disabled: true }],
      motherName: [{ value: '', disabled: true }],
      fatherName: [{ value: '', disabled: true }]
    });
 
    // Customer verisini API'den çek
    this.loadCustomer();
  }
 
  loadCustomer(): void {
    this.http.get<CreatedIndividualCustomerResponse>(
      `http://localhost:8091/customerservice/api/individual-customers/getById/${this.customerId}`
    ).subscribe({
      next: (res) => {
        this.customerForm.patchValue(res);
        this.originalData = { ...res }; // orijinal veriyi sakla
        this.customerForm.disable();
      },
      error: (err) => console.error('Error loading customer:', err)
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
      const updatedCustomer = this.customerForm.getRawValue();
 
      this.http.put(
        `http://localhost:8091/customerservice/api/individual-customers/${this.customerId}`,
        updatedCustomer
      ).subscribe({
        next: () => {
          alert('Customer information updated successfully!');
          this.isEditing = false;
          this.originalData = { ...updatedCustomer };
          this.customerForm.disable();
        },
        error: (err) => {
          console.error(err);
          alert('Error updating customer!');
        }
      });
    }
  }
 
  onDelete(): void {
    if (confirm('Emin misiniz? Bu müşteri soft delete edilecek.')) {
      this.http.delete(
        `http://localhost:8091/customerservice/api/individual-customers/${this.customerId}/soft`
      ).subscribe({
        next: () => {
          alert('Customer deleted successfully!');
          this.router.navigateByUrl('/customer-search');
        },
        error: (err) => {
          console.error(err);
          alert('Error deleting customer!');
        }
      });
    }
  }
}
