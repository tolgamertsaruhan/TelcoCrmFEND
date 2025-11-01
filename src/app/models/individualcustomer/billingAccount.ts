export interface BillingAccount {
  id?: string;
  type: 'INDIVIDUAL' | 'CORPORATE' | string;
  accountName: string;
  accountNumber?: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
  customerId: string;
  addressId?: string;
}