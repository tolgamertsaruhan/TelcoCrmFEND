export interface IndividualCustomerSearchRequest {
  id?: string; // Customer ID
  accountNumber?: string; // Account Number
  firstName?: string;
  lastName?: string;
  nationalId?: string; // NAT ID
  mobilePhone?: string; // GSM Number (BE'de mobilePhone olarak bekleniyor)
  
  // UI'da var ama BE Request'te karşılığı olmayanlar, sadece form tutarlılığı için:
  middleName?: string; 
  gsmNumber?: string; // UI'da kullanılan isim (BE'ye mobilePhone olarak gidecek)
  //orderNumber?: string;
}