export interface UpdateAddressRequest {
  id: string;
  street: string;
  houseNumber?: string;
  description?: string;
  default: boolean;
  districtId: string;
  
}