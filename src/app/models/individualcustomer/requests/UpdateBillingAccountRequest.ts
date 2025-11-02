export interface UpdateBillingAccountRequest {
  id:string;
  type: 'INDIVIDUAL' | 'CORPORATE' | 'PREPAID' | 'POSTPAID' |string;
  accountName: string;
  customerId: string;
  status: 'ACTIVE' | 'SUSPENDED' |'CLOSED' | string;
  addressId?: string;
}