import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';
import { IndividualCustomerCreateRequest } from '../../models/individualcustomer/requests/individualCustomerCreateRequest';
import { CreateAddress } from "../create-address/create-address";
import { Sidebar } from "../../components/sidebar/sidebar";

@Component({
  selector: 'app-individual-customer-create',
  imports: [Navbar, FormsModule, ReactiveFormsModule, CreateAddress, Sidebar],
  templateUrl: './individual-customer-create.html',
  styleUrl: './individual-customer-create.scss',
})
export class IndividualCustomerCreate {

  customerForm!: FormGroup;
 
  constructor(private fb: FormBuilder, private customerService: CustomerService) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      nationalId: ['', [Validators.required, Validators.minLength(11)]],
      motherName: [''],
      fatherName: [''],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
    });
  }
 
  onSubmit() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
 
    const request: IndividualCustomerCreateRequest = this.customerForm.value;
 
    this.customerService.createIndividualCustomer(request).subscribe({
      next: () => {
        alert('Customer created successfully!');
        this.customerForm.reset();
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        alert('Failed to create customer.');
      },
    });
  }
}
