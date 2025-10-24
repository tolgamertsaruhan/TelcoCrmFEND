import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { IndividualCustomerSearchRequest } from '../../models/individualcustomer/requests/individualCustomerSearchRequest';
import { IndividualCustomerListResponse } from '../../models/individualcustomer/responses/individualCustomerListResponse';
import { CustomerSearchService } from '../../services/customer-search-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-search',
  imports: [Navbar, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './customer-search.html',
  styleUrl: './customer-search.scss',
})
export class CustomerSearch implements OnInit{
  // Form verileri için Request modeli oluşturduk
  searchForm: IndividualCustomerSearchRequest = {}; 
  // Arama sonuçları için Response modeli oluşturduk
  searchResults: IndividualCustomerListResponse[] | null = null; 
  
  
  isLoading: boolean = false;
  // Form alanlarının disable durumları için natid de diğer alanlar bloke istendi
  isNationalIdActive: boolean = false;
  // Herhangi bir alan dolu mu? "Would you like to create the customer?" kontrolü için yaptk
  isAnyFieldFilled: boolean = false; 

  
  constructor(
    private customerSearchService: CustomerSearchService,
    private router: Router ,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkAnyFieldFilled();
  }

  //NAT ID alanının durumuna göre diğer alanları kısıtlar.
   
  onNatIdChange(): void {
    this.isNationalIdActive = !!this.searchForm.nationalId; 
    this.checkAnyFieldFilled();
  }

 
   //Tüm arama alanlarını temizler.
   
  clearSearch(): void {
    this.searchForm = {};
    this.searchResults = null;
    this.isNationalIdActive = false;
    this.isAnyFieldFilled = false;
  }

  
  //Herhangi bir arama filtresinin dolu olup olmadığını kontrol eder.
  
  checkAnyFieldFilled(): void {
    const { id, customerNumber, nationalId, gsmNumber,  firstName, middleName, lastName } = this.searchForm;
    this.isAnyFieldFilled = !!(id || customerNumber || nationalId || gsmNumber ||  firstName || middleName || lastName);
  }

  
   //Arama işlemini başlatır.
   
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
      next: (data) => {
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

  
   //Müşteri oluşturma sayfasına yönlendirir.
   
  goToCreateCustomer(): void {
   
    this.router.navigate(['create-individual-customer']); 
  }

  
  // Müşterinin ContactMediums listesinden ilk GSM numarasını bulur.
   
  /*getGsmNumber(customer: IndividualCustomerListResponse): string {
    return customer.contactMediums?.find(cm => cm.type === 'PHONE')?.value || 'N/A';
    
  }*/

  getGsmNumber(customer: IndividualCustomerListResponse): string {
    // Null/undefined kontrolü
    if (!customer.contactMediums || customer.contactMediums.length === 0) {
      return 'N/A';
    }
 
    // Önce primary olanı ara
    const primaryContact = customer.contactMediums.find(cm => cm.primary === true);
    if (primaryContact && primaryContact.value) {
      return primaryContact.value;
    }
 
    // Primary yoksa ilk contact'ı döndür
    const firstContact = customer.contactMediums[0];
    return firstContact?.value || 'N/A';
  }
 
  // NAT ID hariç alanın disable durumunu döner
  get isFieldDisabled(): boolean {
    return this.isNationalIdActive;
  }


 

}
