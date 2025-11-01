export interface IndividualCustomerSearchResponse {
  id: string;
  firstName: string;
  lastName: string;
  customerNumber: string;
  middleName: string;
  nationalId: string;
  motherName: string;
  fatherName: string;
  gender: string;
  dateOfBirth: string;
  addressSearchList: Address[];
  contactMediumSearchList: ContactMedium[]; 
  billingAccountList: BillingAccount[];

}
export interface Address { 
  id: string;
  street: string;
  houseNumber: string;
  description: string;
  districtId: string;
  districtName: string;
  cityName: string;
  customerId: string;
  default: boolean;
}

export interface ContactMedium {
  contactMediumId: string;
  customerId: string;
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface BillingAccount { 
  billingAccountId: string;
  type: string;
  status: string;
  accountNumber:string;
  accountName:string,
  customerId:string,
  addressId:string

}
