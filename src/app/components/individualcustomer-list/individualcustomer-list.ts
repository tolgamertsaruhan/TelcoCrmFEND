import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { IndividualcustomerItem } from '../individualcustomer-item/individualcustomer-item';
import { IndividualCustomerListResponse } from '../../models/individualcustomer/responses/individualCustomerListResponse';
import { CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-individualcustomer-list',
  imports: [CommonModule, IndividualcustomerItem],
  templateUrl: './individualcustomer-list.html',
  styleUrl: './individualcustomer-list.scss',
})
export class IndividualcustomerList implements OnInit {
  individualCustomerResponse = signal<IndividualCustomerListResponse[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.fetchIndividualCustomers();
  }

  fetchIndividualCustomers() {
    this.customerService.getIndividualCustomers().subscribe({
      next: (response) => 
        this.individualCustomerResponse.set(response)
      
    });
  }
}
