import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAccountResponse } from '../../../models/individualcustomer/responses/BillingAccountResponse';
import { ActivatedRoute } from '@angular/router';
import { BillingAccountService } from '../../../services/billingAccount-service';
import { AddressService } from '../../../services/address-service';
import { CityService } from '../../../services/city-service';
import { DistrictService } from '../../../services/district-service';
import { AddressForBillingAccountResponse } from '../../../models/individualcustomer/responses/AddressForBillingAccountResponse';

@Component({
  selector: 'app-billing-account-information',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './billing-account-information.html',
  styleUrls: ['./billing-account-information.scss']
})
export class BillingAccountInformation implements OnInit {
  customerId!: string;
  accounts: BillingAccountResponse[] = [];
  accountForm!: FormGroup;

  // adres yönetimi
  addresses: AddressForBillingAccountResponse[] = [];
  districtNames: { [key: string]: string } = {};
  cityNames: { [key: string]: string } = {};
  selectedAddressId: string | null = null;

  // yeni adres oluşturma
  showAddAddressForm = false;
  newAddressForm!: FormGroup;
  cities: any[] = [];
  districts: any[] = [];

  // UI durumları
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
    private districtService: DistrictService
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.parent?.snapshot.paramMap.get('id') || '';
    this.initForm();
    this.initNewAddressForm();

    if (this.customerId) {
      this.loadAccounts();
      this.loadAddresses();
      this.loadCities();
    }
  }

  // =================== INIT FORMS ===================
  initForm() {
    this.accountForm = this.fb.group({
      type: ['INDIVIDUAL', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: [{ value: '', disabled: true }],
      status: ['ACTIVE', Validators.required],
      addressId: ['']
    });
  }

  initNewAddressForm() {
    this.newAddressForm = this.fb.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      description: [''],
      isDefault: [false]
    });
  }

  // =================== LOAD DATA ===================
  loadAccounts() {
    this.billingService.getByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.accounts = data as BillingAccountResponse[];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading billing accounts', err)
    });
  }

  loadAddresses() {
    if (!this.customerId) return;
    this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.addresses = data;
        this.addresses.forEach((address) => {
          this.districtService.getDistrictById(address.districtId).subscribe({
            next: (district) => {
              this.districtNames[address.districtId] = district.name;
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

  loadCities() {
    this.cityService.getCities().subscribe({
      next: (data) => (this.cities = data),
      error: (err) => console.error('Error loading cities:', err)
    });
  }

  // =================== ADDRESS MANAGEMENT ===================
  selectAddress(id: string) {
    this.selectedAddressId = id;
    this.accountForm.patchValue({ addressId: id });
  }

  startAddAddress() {
    this.showAddAddressForm = true;
    this.newAddressForm.reset({ isDefault: false });
  }

  onCityChangeForNewAddress() {
    const selectedCityId = this.newAddressForm.get('cityId')?.value;
    if (selectedCityId) {
      this.districtService.getDistrictsByCity(selectedCityId).subscribe({
        next: (res) => {
          this.districts = res;
          this.newAddressForm.patchValue({ districtId: null });
        }
      });
    } else {
      this.districts = [];
      this.newAddressForm.patchValue({ districtId: null });
    }
  }

  saveNewAddress() {
    if (this.newAddressForm.invalid) return;
    const formValue = this.newAddressForm.value;

    const createRequest = {
      customerId: this.customerId,
      districtId: formValue.districtId,
      street: formValue.street,
      houseNumber: formValue.houseNumber,
      description: formValue.description,
      default: formValue.isDefault ?? false
    };

    this.addressService.addAddressInfoPage(createRequest).subscribe({
      next: (res) => {
        this.showAddAddressForm = false;
        this.loadAddresses();
        this.selectedAddressId = res.id;
        this.accountForm.patchValue({ addressId: res.id });
      },
      error: (err) => console.error('Error creating address:', err)
    });
  }

  // =================== BILLING ACCOUNT CRUD ===================
  startAdd() {
    this.isAdding = true;
    this.isEditing = false;
    this.editingId = null;
    this.accountForm.reset({ type: 'INDIVIDUAL', status: 'ACTIVE' });
    this.selectedAddressId = null;
  }

  startEdit(account: BillingAccountResponse) {
    this.isEditing = true;
    this.isAdding = false;
    this.editingId = account.id;
    this.selectedAddressId = account.addressId || null;
    this.accountForm.patchValue({
      type: account.type,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      status: account.status,
      addressId: account.addressId || ''
    });
    this.cdr.detectChanges();
  }

  cancel() {
    this.isAdding = false;
    this.isEditing = false;
    this.editingId = null;
    this.selectedAddressId = null;
    this.showAddAddressForm = false;
  }

  save() {
    if (this.accountForm.invalid) {
      alert('Please fill required fields');
      return;
    }

    const formValue = this.accountForm.getRawValue();
    const addressId = this.selectedAddressId || formValue.addressId;
    if (!addressId) {
      alert('Please select or create an address');
      return;
    }

    if (this.isAdding) {
      const payload = {
        accountName: formValue.accountName,
        type: formValue.type,
        customerId: this.customerId,
        addressId: addressId
      };
      console.log(payload);
      this.billingService.add(payload).subscribe({
        next: () => {
          this.isAdding = false;
          this.loadAccounts();
        },
        error: (err) => console.error('Error adding billing account', err)
      });
    } else if (this.isEditing && this.editingId) {
      const payload = {
        id: this.editingId,
        accountName: formValue.accountName,
        type: formValue.type,
        status: formValue.status,
        customerId: this.customerId,
        addressId: addressId
      };
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
