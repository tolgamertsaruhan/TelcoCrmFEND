export interface AddressForBillingAccountResponse {
  id: string;
  street: string;
  houseNumber: string;
  description: string;
  default: boolean;
  districtId: string;
  customerId: string;
}