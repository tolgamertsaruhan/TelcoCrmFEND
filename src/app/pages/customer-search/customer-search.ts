import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { IndividualCustomerSearchRequest } from '../../models/individualcustomer/requests/individualCustomerSearchRequest';
import { IndividualCustomerSearchResponse } from '../../models/individualcustomer/responses/individualCustomerSearchResponse';
import { CustomerSearchService } from '../../services/customer-search-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-search',
  imports: [Navbar, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './customer-search.html',
  styleUrl: './customer-search.scss',
})
export class CustomerSearch implements OnInit {
  searchForm: IndividualCustomerSearchRequest = {}; 
  searchResults: IndividualCustomerSearchResponse[] | null = null; 

  isLoading: boolean = false;
  isNationalIdActive: boolean = false;
  isAnyFieldFilled: boolean = false; 

  constructor(
    private customerSearchService: CustomerSearchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkAnyFieldFilled();
  }

  onNatIdChange(): void {
    this.isNationalIdActive = !!this.searchForm.nationalId; 
    this.checkAnyFieldFilled();
  }

  clearSearch(): void {
    this.searchForm = {};
    this.searchResults = null;
    this.isNationalIdActive = false;
    this.isAnyFieldFilled = false;
  }

  checkAnyFieldFilled(): void {
    const { id, customerNumber, nationalId, gsmNumber, firstName, middleName, lastName } = this.searchForm;
    this.isAnyFieldFilled = !!(id || customerNumber || nationalId || gsmNumber || firstName || middleName || lastName);
  }

  search(): void {
    if (!this.isAnyFieldFilled) {
      this.searchResults = null;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    this.isLoading = true;
    this.searchResults = null;
    this.cdr.detectChanges(); 

    this.customerSearchService.searchCustomers(this.searchForm).subscribe({
      next: (data: IndividualCustomerSearchResponse[]) => {
        this.isLoading = false;
        this.searchResults = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isLoading = false;
        this.searchResults = [];
        this.cdr.detectChanges(); 
      }
    });
  }

  goToCreateCustomer(): void {
    this.router.navigate(['create-individual-customer']); 
  }

  getGsmNumber(customer: IndividualCustomerSearchResponse): string {
    if (!customer.contactMediumSearchList || customer.contactMediumSearchList.length === 0) {
      return 'N/A';
    }

    // Primary contact varsa al
    const primaryContact = customer.contactMediumSearchList.find(cm => cm.isPrimary === true);
    if (primaryContact && primaryContact.value) {
      return primaryContact.value;
    }

    // Yoksa ilk contact'ı al
    return customer.contactMediumSearchList[0]?.value || 'N/A';
  }

  get isFieldDisabled(): boolean {
    return this.isNationalIdActive;
  }
}
