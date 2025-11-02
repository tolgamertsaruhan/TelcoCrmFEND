import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAccount } from '../../../models/individualcustomer/billingAccount';
import { ActivatedRoute } from '@angular/router';
import { BillingAccountService } from '../../../services/billingAccount-service';
import { AddressService } from '../../../services/address-service';
import { BillingAccountResponse } from '../../../models/individualcustomer/responses/BillingAccountResponse';
import { CityService } from '../../../services/city-service';
import { DistrictService } from '../../../services/district-service';

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
  accounts: BillingAccountResponse[] = [];
  accountForm!: FormGroup;
  addresses: CreatedAddressResponse[] = [];
  districtNames: { [key: string]: string } = {};
  cityNames: { [key: string]: string } = {};

  isAdding = false;
  isEditing = false;
  editingId: string | null = null;

  types = ['INDIVIDUAL', 'CORPORATE', 'PREPAID', 'POSTPAID'];
  statuses = ['ACTIVE', 'SUSPENDED', 'CLOSED'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private billingService: BillingAccountService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef,
    private cityService: CityService,
    private districtService:DistrictService
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.parent?.snapshot.paramMap.get('id') || '';
    this.initForm();
    if (this.customerId) {
      this.loadAccounts();
      this.loadAddresses();
    }
  }

  initForm() {
    this.accountForm = this.fb.group({
      type: ['INDIVIDUAL', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: [{ value: '', disabled: true }],
      status: ['ACTIVE', Validators.required],
      addressId: ['', Validators.required],
    });
  }

  loadAccounts() {
    this.billingService.getByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.accounts = data as BillingAccountResponse[]; 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading billing accounts', err),
    });
  }

  loadAddresses() {
     if (!this.customerId) return;

  this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
    next: (data) => {
      this.addresses = data;

      // Her adres için district ve city isimlerini al
      this.addresses.forEach(address => {
        this.districtService.getDistrictById(address.districtId).subscribe({
          next: (district) => {
            this.districtNames[address.districtId] = district.name;

            // Şehrin adını da al
            this.cityService.getCitiesforaddresspage().subscribe({
              next: (cities) => {
                const city = cities.find((c: any) => c.id === district.cityId);
                if (city) {
                  this.cityNames[address.districtId] = city.name;
                }

                this.cdr.detectChanges();
              }
            });
          },
          error: (err) => console.error('Error loading district:', err)
        });
      });
    },
    error: (err) => console.error('Error loading addresses:', err)
  });
  }

  startAdd() {
    this.isAdding = true;
    this.isEditing = false;
    this.editingId = null;

    this.accountForm.reset({
      type: 'INDIVIDUAL',
      status: 'ACTIVE',
      accountNumber: '',
      addressId: '',
    });

    // Varsayılan adresi seç
    const defaultAddr = this.addresses.find(a => a.isDefault === true);
    if (defaultAddr) {
      this.accountForm.patchValue({ addressId: defaultAddr.id });
    }
  }

  startEdit(account: BillingAccountResponse) {
    this.isEditing = true;
    this.isAdding = false;
    this.editingId = account.id;

    this.accountForm.patchValue({
      type: account.type,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      status: account.status,
      addressId: account.addressId || '',
    });

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

    const formValue = this.accountForm.getRawValue();

    if (this.isAdding) {
      const payload = {
        accountName: formValue.accountName,
        type: formValue.type,
        customerId: this.customerId,
        addressId: formValue.addressId,
      };

      this.billingService.add(payload).subscribe({
        next: () => {
          this.isAdding = false;
          this.loadAccounts();
        },
        error: (err) => console.error('Error adding billing account', err),
      });
    } else if (this.isEditing && this.editingId) {
      const payload = {
        id: this.editingId,
        accountName: formValue.accountName,
        type: formValue.type,
        status: formValue.status,
        customerId: this.customerId,
        addressId: formValue.addressId,
      };

      console.log(payload);

      this.billingService.update(payload).subscribe({
        next: () => {
          this.isEditing = false;
          this.editingId = null;
          this.loadAccounts();
        },
        error: (err) => console.error('Error updating billing account', err),
      });
    }
  }

  

  confirmDelete(id?: string) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this billing account?')) return;

    this.billingService.delete(id).subscribe({
      next: () => this.loadAccounts(),
      error: (err) => console.error('Error deleting billing account', err),
    });
  }

}
