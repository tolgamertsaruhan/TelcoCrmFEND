export interface BillingAccountResponse {
  id: string;
  type: 'INDIVIDUAL' | 'CORPORATE' | 'PREPAID' | 'POSTPAID' |string;
  accountName?: string;
  status: 'ACTIVE' | 'SUSPENDED' |'CLOSED' | string;
  accountNumber:string;
  customerId: string;
  addressId: string;
}