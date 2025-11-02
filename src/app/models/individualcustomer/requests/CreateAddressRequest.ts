export interface CreateAddressRequest {
  customerId: string;
  districtId: string;
  street: string;
  houseNumber: string;
  description: string;
  default: boolean;
}