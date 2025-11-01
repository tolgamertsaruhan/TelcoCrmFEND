import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAccount } from '../../../models/individualcustomer/billingAccount';
import { ActivatedRoute } from '@angular/router';
import { BillingAccountService } from '../../../services/billingAccount-service';
import { AddressService } from '../../../services/address-service';

@Component({
  selector: 'app-billing-account-information',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './billing-account-information.html',
  styleUrl: './billing-account-information.scss',
})
export class BillingAccountInformation implements OnInit {
  customerId!: string;
  accounts: BillingAccount[] = [];
  accountForm!: FormGroup;

  isAdding = false;
  isEditing = false;
  editingId: string | null = null;

  // form helpers for select / UI
  types = ['INDIVIDUAL', 'CORPORATE', 'PREPAID', 'POSTPAID'];
  statuses = ['ACTIVE', 'SUSPENDED', 'CLOSED'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private billingService: BillingAccountService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // parent route'tan customer id al
    this.customerId = this.route.parent?.snapshot.paramMap.get('id') || '';
    this.initForm();
    if (this.customerId) {
      this.loadAccounts();
    }
  }

  initForm() {
    this.accountForm = this.fb.group({
      type: ['INDIVIDUAL', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: [''],
      status: ['ACTIVE', Validators.required],
      addressId: [''] // optional, fill from default address when adding
    });
  }

  loadAccounts() {
    if (!this.customerId) return;
    this.billingService.getByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.accounts = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading billing accounts', err)
    });
  }

  startAdd() {
    this.isAdding = true;
    this.isEditing = false;
    this.editingId = null;
    this.accountForm.reset({ type: 'INDIVIDUAL', status: 'ACTIVE', accountNumber: '' });

    // otomatik default adresi alıp addressId koymak istersen:
    this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
  next: (addresses) => {
    const defaultAddress = addresses.find(a => a.isDefault === 'true' || a.isDefault === "true");
    if (defaultAddress) {
      this.accountForm.patchValue({ addressId: defaultAddress.id });
    }
  },
  error: (err) => {
    console.error('Error loading addresses', err);
  }
});
  }

  startEdit(account: BillingAccount) {
    this.isEditing = true;
    this.isAdding = false;
    this.editingId = account.id || null;

    this.accountForm.patchValue({
      type: account.type,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      status: account.status || 'ACTIVE',
      addressId: account.addressId || ''
    });

    // change detection to ensure form re-renders
    this.cdr.detectChanges();
  }

  cancel() {
    this.isAdding = false;
    this.isEditing = false;
    this.editingId = null;
    this.accountForm.reset({ type: 'INDIVIDUAL', status: 'ACTIVE' });
  }

  save() {
    if (this.accountForm.invalid) {
      alert('Please fill required fields');
      return;
    }

    const formValue = this.accountForm.value;
    if (this.isAdding) {
      const payload: Partial<BillingAccount> = {
        accountName: formValue.accountName,
        type: formValue.type,
        customerId: this.customerId,
        addressId: formValue.addressId || undefined
      };
      this.billingService.add(payload).subscribe({
        next: () => {
          this.isAdding = false;
          this.loadAccounts();
        },
        error: (err) => console.error('Error adding billing account', err)
      });
    } else if (this.isEditing && this.editingId) {
      const payload: BillingAccount = {
        id: this.editingId,
        accountName: formValue.accountName,
        accountNumber: formValue.accountNumber,
        type: formValue.type,
        status: formValue.status,
        customerId: this.customerId,
        addressId: formValue.addressId || undefined
      };
      console.log('Billing update payload', payload);
      this.billingService.update(payload).subscribe({
        next: () => {
          this.isEditing = false;
          this.editingId = null;
          this.loadAccounts();
        },
        error: (err) => console.error('Error updating billing account', err)
      });
    }
  }

  confirmDelete(id?: string) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this billing account?')) return;
    this.billingService.delete(id).subscribe({
      next: () => this.loadAccounts(),
      error: (err) => console.error('Error deleting billing account', err)
    });
  }

}
