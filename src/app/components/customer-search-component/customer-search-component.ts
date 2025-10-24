import { Component, OnInit } from '@angular/core';
import { IndividualCustomerSearchRequest } from '../../models/individualcustomer/requests/individualCustomerSearchRequest';
import { IndividualCustomerListResponse } from '../../models/individualcustomer/responses/individualCustomerListResponse';
import { Router } from '@angular/router';
import { CustomerSearchService } from '../../services/customer-search-service';

@Component({
  selector: 'app-customer-search-component',
  imports: [],
  templateUrl: './customer-search-component.html',
  styleUrl: './customer-search-component.scss',
})
export class CustomerSearchComponent implements OnInit {

  // Form verileri için Request modeli
  searchForm: IndividualCustomerSearchRequest = {}; 
  // Arama sonuçları için Response modeli
  searchResults: IndividualCustomerListResponse[] | null = null; 
  
  // Arama yapılıyor mu? (Loading state)
  isLoading: boolean = false;
  // Form alanlarının disable durumları (NAT ID kısıtlaması)
  isNationalIdActive: boolean = false;
  // Herhangi bir alan dolu mu? ("Would you like to create the customer?" kontrolü için)
  isAnyFieldFilled: boolean = false; 

  // Router ve Service'i inject ediyoruz.
  constructor(
    private customerSearchService: CustomerSearchService,
    private router: Router 
  ) { }

  ngOnInit(): void {
    this.checkAnyFieldFilled();
  }

  /**
   * NAT ID alanının durumuna göre diğer alanları kısıtlar.
   */
  onNatIdChange(): void {
    this.isNationalIdActive = !!this.searchForm.nationalId; 
    this.checkAnyFieldFilled();
  }

  /**
   * Tüm arama alanlarını temizler.
   */
  clearSearch(): void {
    this.searchForm = {};
    this.searchResults = null;
    this.isNationalIdActive = false;
    this.isAnyFieldFilled = false;
  }

  /**
   * Herhangi bir arama filtresinin dolu olup olmadığını kontrol eder.
   */
  checkAnyFieldFilled(): void {
    const { id, customerNumber, nationalId, gsmNumber,  firstName, middleName, lastName } = this.searchForm;
    this.isAnyFieldFilled = !!(id || customerNumber || nationalId || gsmNumber ||  firstName || middleName || lastName);
  }

  /**
   * Arama işlemini başlatır.
   */
  search(): void {
    // ÖNCEKİ KONTROL (Kaldırılıyor veya Yorum Satırı Yapılıyor):
    /*
    if (!this.isAnyFieldFilled) {
        this.searchResults = null; // Arama kriteri yoksa sonuçları temizle
        return;
    }
    */
    
    // Yalnızca SEARCH'e basıldığında sonuç tablosu gösterilmesi için null'luyoruz
    this.searchResults = null; 
    this.isLoading = true;

    this.customerSearchService.searchCustomers(this.searchForm).subscribe({
      next: (data) => {
        this.searchResults = data; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults = []; 
        this.isLoading = false;
      }
    });
  }

  /**
   * Müşteri oluşturma sayfasına yönlendirir.
   */
  goToCreateCustomer(): void {
    // '/customer-create' rotası uygulamanızda tanımlı olmalıdır.
    this.router.navigate(['create-individual-customer']); 
  }

  /**
   * Müşterinin ContactMediums listesinden ilk GSM numarasını bulur.
   */
  getGsmNumber(customer: IndividualCustomerListResponse): string {
    return customer.contactMediums?.find(cm => cm.type === 'PHONE')?.value || 'N/A';
  }

  // NAT ID hariç alanın disable durumunu döner
  get isFieldDisabled(): boolean {
    return this.isNationalIdActive;
  }


}
