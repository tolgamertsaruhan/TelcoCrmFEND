
export interface IndividualCustomerListResponse {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  nationalId: string;
  motherName: string;
  fatherName: string;
  gender: string;
  dateOfBirth: string;
  addresses: Address[];

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
