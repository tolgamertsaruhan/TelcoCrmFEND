export interface BillingAccountRequest {
  type: 'INDIVIDUAL' | 'CORPORATE' | 'PREPAID' | 'POSTPAID' |string;
  accountName: string;
  customerId: string;
  addressId?: string;
}