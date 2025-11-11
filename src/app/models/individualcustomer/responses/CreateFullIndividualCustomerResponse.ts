export interface CreatedIndividualCustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nationalId: string;
  motherName?: string;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: string;
}
 
export interface CreatedAddressResponse {
  id: string;
  street: string;
  houseNumber?: string;
  description?: string;
  isDefault: boolean;
  districtId: string;
  customerId: string;
}
 
export interface CreatedContactMediumResponse {
  id: string;
  customerId: string;
  type: string;
  value: string;
  isPrimary: boolean;
}
 
export interface CreateFullIndividualCustomerResponse {
  customerResponse: CreatedIndividualCustomerResponse;
  addressResponse: CreatedAddressResponse[];
  createdContactMediumResponses: CreatedContactMediumResponse[];
  
}