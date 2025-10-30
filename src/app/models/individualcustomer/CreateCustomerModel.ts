export interface CreateCustomerModel {
  createIndividualCustomerRequest?:Customer,
  addressRequestList?: Address[];
  createContactMediumRequests?: ContactMedium[];
}

export interface Customer{
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId?: string;
  gender?: string;
  motherName?:string,
  fatherName?:string,
  dateOfBirth?:string
}

export interface Address {
  cityId:string,
  districtId: string;
  street: string;
  housenumber?: string;
  description?: string;
  isDefault:boolean;
}

export interface ContactMedium {
  type: string;  
  value: string;
}