import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { IndividualCustomerSearchRequest } from '../../models/individualcustomer/requests/individualCustomerSearchRequest';
import { IndividualCustomerSearchResponse } from '../../models/individualcustomer/responses/individualCustomerSearchResponse';
import { CustomerSearchService } from '../../services/customer-search-service';
import { Router } from '@angular/router';
import { Sidebar } from "../../components/sidebar/sidebar";
import { CustomerCreationService } from '../../services/customer-creation-service';
import { BackgroundItem } from "../../components/background-item/background-item";

@Component({
  selector: 'app-customer-search',
  imports: [Navbar, FormsModule, ReactiveFormsModule, CommonModule, Sidebar, BackgroundItem],
  templateUrl: './customer-search.html',
  styleUrl: './customer-search.scss',
})
export class CustomerSearch implements OnInit {
  searchForm: IndividualCustomerSearchRequest = {}; 
  searchResults: IndividualCustomerSearchResponse[] | null = null; 
  paginatedResults: IndividualCustomerSearchResponse[] = [];

  isLoading: boolean = false;
  isNationalIdActive: boolean = false;
  isAnyFieldFilled: boolean = false; 
  isIdLocked: boolean = false;


  
  disabledFields = {
    id: false,
    accountNumber: false,
    nationalId: false,
    gsmNumber: false,
    firstName: false,
    middleName: false,
    lastName: false,
    orderId: false
  };


  // Pagination
  currentPage: number = 0;
  pageSize: number = 20;
  totalPages: number = 0;


  constructor(
    private customerSearchService: CustomerSearchService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private customerCreationService: CustomerCreationService
  ) { }

  /*ngOnInit(): void {
    this.checkAnyFieldFilled();
  }*/

    ngOnInit(): void {
  const state = history.state;

  if (state.searchForm) this.searchForm = state.searchForm;
  if (state.searchResults) this.searchResults = state.searchResults;
  if (state.currentPage) this.currentPage = state.currentPage;

  this.checkAnyFieldFilled();
}

  onChange(): void {
    //this.isNationalIdActive = !!this.searchForm.nationalId; 
    this.checkAnyFieldFilled();

    // Eğer searchResults varsa ve tüm inputlar boş değilse tabloyu sakla
  if (this.searchResults && !this.isAnyFieldFilled) {
    this.paginatedResults = this.searchResults.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }
  }

allowOnlyNumbers(event: KeyboardEvent, maxLength: number): void {
  const input = event.target as HTMLInputElement;
  const charCode = event.which ? event.which : event.keyCode;

  // Eğer sayı değilse engelle
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
    return;
  }

  // Maksimum karakter sınırı
  if (input.value.length >= maxLength) {
    event.preventDefault();
  }
}

allowOnlyLetters(event: KeyboardEvent): void {
  const char = event.key;
  const regex = /^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]$/; // Türkçe karakterleri de dahil ettik

  if (!regex.test(char)) {
    event.preventDefault();
  }
}

  clearSearch(): void {
    /*this.searchForm = {};
    this.searchResults = null;
    this.isNationalIdActive = false;
    this.isAnyFieldFilled = false;
    this.isIdLocked = false;*/
    this.searchForm = {
      id: '',
      accountNumber: '',
      nationalId: '',
      gsmNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      orderId: ''
    };

    this.disabledFields = {
      id: false,
      accountNumber: false,
      nationalId: false,
      gsmNumber: false,
      firstName: false,
      middleName: false,
      lastName: false,
      orderId: false
    };

    this.isAnyFieldFilled = false;
    this.searchResults = null;
    //this.paginatedResults = [];
    this.currentPage=0;
  }

  checkAnyFieldFilled(): void {
    
  const { id, accountNumber, nationalId, gsmNumber, firstName, middleName, lastName, orderId } = this.searchForm;

  // 1️⃣ Kimlik alanlarından biri dolu mu?
  const isAnyIdentityFieldFilled = !!(id || accountNumber || nationalId || gsmNumber || orderId);

  // 2️⃣ İsim alanlarından biri dolu mu?
  const isAnyNameFieldFilled = !!(firstName || middleName || lastName);

  // 3️⃣ Arama yapılabilir mi?
  this.isAnyFieldFilled = isAnyIdentityFieldFilled || isAnyNameFieldFilled;

  // 4️⃣ Disable mantığı (kimlik <-> isim alanları)
  if (isAnyIdentityFieldFilled) {
    this.disabledFields = {
      id: !id,
      accountNumber: !accountNumber,
      nationalId: !nationalId,
      gsmNumber: !gsmNumber,
      firstName: true,
      middleName: true,
      lastName: true,
      orderId: !orderId
    };
    this.cdr.detectChanges();
  } else if (isAnyNameFieldFilled) {
    this.disabledFields = {
      id: true,
      accountNumber: true,
      nationalId: true,
      gsmNumber: true,
      firstName: false,
      middleName: false,
      lastName: false,
      orderId: true
    };
    this.cdr.detectChanges();
  } else {
    // Hiçbiri dolu değilse, her şey aktif
    this.disabledFields = {
      id: false,
      accountNumber: false,
      nationalId: false,
      gsmNumber: false,
      firstName: false,
      middleName: false,
      lastName: false,
      orderId: false
    };
    this.cdr.detectChanges();
  }
  }

  search(): void {
    /*if (!this.isAnyFieldFilled) {
      this.searchResults = null;
      this.paginatedResults = [];
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    this.isLoading = true;
    this.searchResults = null;
    this.paginatedResults = [];
    this.cdr.detectChanges(); 

    this.customerSearchService.searchCustomers(this.searchForm).subscribe({
      next: (data: IndividualCustomerSearchResponse[]) => {
        this.isLoading = false;
        this.searchResults = data;
        this.currentPage = 1;
        this.updatePaginatedResults();
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isLoading = false;
        this.searchResults = [];
        this.paginatedResults = [];
        this.cdr.detectChanges(); 
      }
    });

     if (!this.isAnyFieldFilled) {
    this.searchResults = null;
    this.isLoading = false;
    return;
  }*/

  this.isLoading = true;
  this.customerSearchService.searchCustomers(this.searchForm, this.currentPage, this.pageSize).subscribe({
    next: (data) => {
      this.searchResults = data;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Search error:', err);
      this.searchResults = [];
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
  }


  nextPage(): void {
  if (this.searchResults && this.searchResults.length === this.pageSize) {
    this.currentPage++;
    this.search();
    this.cdr.detectChanges();
  }
}

prevPage(): void {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.search();
    this.cdr.detectChanges();
  }
}
  /*updatePaginatedResults(): void {
    if (!this.searchResults) {
      this.paginatedResults = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedResults = this.searchResults.slice(startIndex, endIndex);

    this.totalPages = Math.ceil(this.searchResults.length / this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedResults();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedResults();
    }
  }*/

  goToCreateCustomer(): void {
    this.customerCreationService.reset();
    this.router.navigate(['customer-create/customer-info']); 
  }

  getGsmNumber(customer: IndividualCustomerSearchResponse): string {

    return customer.contactMediumSearchList?.find(cm => cm.type === 'MOBILE_PHONE')?.value || 'N/A';
    /*if (!customer.contactMediumSearchList || customer.contactMediumSearchList.length === 0) {
      return 'N/A';
    }

    // Primary contact varsa al
    const primaryContact = customer.contactMediumSearchList.find(cm => cm.isPrimary === true);
    if (primaryContact && primaryContact.value) {
      return primaryContact.value;
    }

    // Yoksa ilk contact'ı al
    return customer.contactMediumSearchList[0]?.value || 'N/A';*/
  }

  get isFieldDisabled(): boolean {
    return this.isIdLocked;
  }

 /* goToCustomerInformation(customerId: string): void {
  this.router.navigate([`customer-information-screen/`, customerId]);
}*/

goToCustomerInformation(customerId: string): void {
  this.router.navigate(
    [`customer-information-screen/`, customerId],
    { 
      state: { 
        searchForm: this.searchForm, 
        searchResults: this.searchResults, 
        currentPage: this.currentPage 
      }
    }
  );
}
}
