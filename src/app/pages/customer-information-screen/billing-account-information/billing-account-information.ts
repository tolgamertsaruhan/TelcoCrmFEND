import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAccountResponse } from '../../../models/individualcustomer/responses/BillingAccountResponse';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingAccountService } from '../../../services/billingAccount-service';
import { AddressService } from '../../../services/address-service';
import { CityService } from '../../../services/city-service';
import { DistrictService } from '../../../services/district-service';
import { AddressForBillingAccountResponse } from '../../../models/individualcustomer/responses/AddressForBillingAccountResponse';
import { OrderService } from '../../../services/order-service';
import { OrderResponse } from '../../../models/ordermodels/OrderResponse';
import { GetAddressResponse } from '../../../models/individualcustomer/responses/GetAddressResponse';
import { ProductOfferService } from '../../../services/product-offer-service';

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

  showProductModal = false;
  selectedProduct: any = null;
  productSpec: any = null;
  selectedOrder: any;

  // Address selection
  addresses: AddressForBillingAccountResponse[] = [];
  districtNames: { [key: string]: string } = {};
  cityNames: { [key: string]: string } = {};
  selectedAddressId: string | null = null;

  // New Address Form
  showAddAddressForm = false;
  newAddressForm!: FormGroup;
  cities: any[] = [];
  districts: any[] = [];

  // UI state
  isAdding = false;
  isEditing = false;
  editingId: string | null = null;
  expandedAccountId: string | null = null;
  expandedOrderId: string | null = null;  // ✅ MOVED HERE - was at bottom!

  // Notifications
  showNotificationUpdate = false;
  showNotificationCreate = false;
  isFadingOut = false;

  // Orders section
  orders: OrderResponse[] = [];
  loadingOrders = false;
  ordersLoadError = false;
  selectedOrderId: string | null = null;

  // Service Address for Orders
  orderAddressDetails: { [orderId: string]: GetAddressResponse } = {};
  orderDistrictNames: { [orderId: string]: string } = {};
  orderCityNames: { [orderId: string]: string } = {};

  types = ['INDIVIDUAL', 'CORPORATE', 'PREPAID', 'POSTPAID'];
  statuses = ['ACTIVE', 'SUSPENDED', 'CLOSED'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingAccountService,
    private addressService: AddressService,
    private cityService: CityService,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private orderService: OrderService,
    private productOfferService: ProductOfferService
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

  // -------------------- INIT FORMS --------------------
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

  // -------------------- LOAD INITIAL DATA --------------------
  loadAccounts() {
    this.billingService.getByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.accounts = data as BillingAccountResponse[];
        this.cdr.detectChanges();  // ✅ Changed from markForCheck to detectChanges
      },
      error: (err) => console.error('Error loading billing accounts', err)
    });
  }

  loadAddresses() {
    this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.addresses = data;

        this.addresses.forEach((a) => {
          this.districtService.getDistrictById(a.districtId).subscribe(district => {
            this.districtNames[a.districtId] = district.name;

            this.cityService.getCitiesforaddresspage().subscribe(cities => {
              const city = cities.find((c: any) => c.id === district.cityId);
              if (city) this.cityNames[a.districtId] = city.name;
              this.cdr.detectChanges();
            });
          });
        });
      }
    });
  }

  loadCities() {
    this.cityService.getCities().subscribe({
      next: (data) => {
        this.cities = data;
        this.cdr.detectChanges();  // ✅ Added detectChanges
      }
    });
  }

  // -------------------- ADDRESS SELECTION --------------------
  selectAddress(id: string) {
    this.selectedAddressId = id;
    this.accountForm.patchValue({ addressId: id });
    this.cdr.detectChanges();  // ✅ Added detectChanges
  }

  startAddAddress() {
    this.showAddAddressForm = true;
    this.newAddressForm.reset({ isDefault: false });
    this.cdr.detectChanges();
  }

  onCityChangeForNewAddress() {
    const selectedCityId = this.newAddressForm.get('cityId')?.value;

    if (selectedCityId) {
      this.districtService.getDistrictsByCity(selectedCityId).subscribe(res => {
        this.districts = res;
        this.newAddressForm.patchValue({ districtId: null });
        this.cdr.detectChanges();  // ✅ Moved inside subscribe
      });
    } else {
      this.districts = [];
      this.newAddressForm.patchValue({ districtId: null });
      this.cdr.detectChanges();
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
      default: formValue.isDefault
    };

    this.addressService.addAddressInfoPage(createRequest).subscribe((res) => {
      this.showAddAddressForm = false;
      this.loadAddresses();

      this.selectedAddressId = res.id;
      this.accountForm.patchValue({ addressId: res.id });
      this.cdr.detectChanges();
    });
  }

  // -------------------- ADD / EDIT BILLING ACCOUNT --------------------
  startAdd() {
    console.log('startAdd called');  // ✅ Debug log
    
    this.isAdding = true;
    this.isEditing = false;
    this.editingId = null;
    this.selectedAddressId = null;

    this.accountForm.reset({
      type: 'INDIVIDUAL',
      status: 'ACTIVE',
      accountName: '',
      accountNumber: '',
      addressId: ''
    });

    console.log('isAdding:', this.isAdding);  // ✅ Debug log
    this.cdr.detectChanges();
  }

  startEdit(account: BillingAccountResponse) {
    console.log('startEdit called', account);  // ✅ Debug log
    
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
    this.accountForm.reset();
    this.cdr.detectChanges();
  }

  save() {
    console.log('save called');  // ✅ Debug log
    console.log('Form valid:', this.accountForm.valid);
    console.log('Selected address:', this.selectedAddressId);
    
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

      console.log('Creating account with payload:', payload);  // ✅ Debug log

      this.billingService.add(payload).subscribe({
        next: (response) => {
          console.log('Account created:', response);  // ✅ Debug log
          this.isAdding = false;
          this.selectedAddressId = null;
          this.accountForm.reset();
          this.loadAccounts();
          this.cdr.detectChanges();
          setTimeout(() => this.showSuccessNotificationCreate(), 100);
        },
        error: (err) => {
          console.error('Error creating account:', err);
          alert('Error creating billing account');
        }
      });
    }

    if (this.isEditing && this.editingId) {
      const payload = {
        id: this.editingId,
        accountName: formValue.accountName,
        type: formValue.type,
        status: formValue.status,
        customerId: this.customerId,
        addressId: addressId
      };

      console.log('Updating account with payload:', payload);  // ✅ Debug log

      this.billingService.update(payload).subscribe({
        next: (response) => {
          console.log('Account updated:', response);  // ✅ Debug log
          this.isEditing = false;
          this.editingId = null;
          this.selectedAddressId = null;
          this.accountForm.reset();
          this.loadAccounts();
          this.cdr.detectChanges();
          setTimeout(() => this.showSuccessNotificationUpdate(), 100);
        },
        error: (err) => {
          console.error('Error updating account:', err);
          alert('Error updating billing account');
        }
      });
    }
  }

  confirmDelete(id?: string) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this billing account?')) {
      this.billingService.delete(id).subscribe({
        next: () => {
          this.loadAccounts();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting account:', err);
          alert('Error deleting billing account');
        }
      });
    }
  }

  // -------------------- ORDERS LOAD + SERVICE ADDRESS FIX --------------------
  toggleExpand(accountId: string) {
    if (this.expandedAccountId === accountId) {
      this.expandedAccountId = null;
      this.orders = [];
      this.selectedOrderId = null;
      this.expandedOrderId = null;  // ✅ Reset expanded order too
      this.cdr.detectChanges();
      return;
    }

    this.expandedAccountId = accountId;
    this.selectedOrderId = null;
    this.expandedOrderId = null;  // ✅ Reset expanded order

    this.loadOrdersForBillingAccount(accountId);
  }

  private loadOrdersForBillingAccount(billingAccountId: string) {
    this.loadingOrders = true;
    this.ordersLoadError = false;
    this.orders = [];

    this.orderService.getOrdersByBillingAccountId(billingAccountId).subscribe({
      next: (data: OrderResponse[]) => {
        this.orders = data || [];
        this.loadingOrders = false;

        // Load address details for each order
        this.orders.forEach(order => {
          if (order.serviceAddress) {
            this.loadOrderAddressDetails(order.orderId, order.serviceAddress);
          }
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loadingOrders = false;
        this.ordersLoadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  // -------------------- SERVICE ADDRESS LOADING PER ORDER --------------------
  loadOrderAddressDetails(orderId: string, addressId: string) {
    this.addressService.getAddressById(addressId).subscribe({
      next: (addr) => {
        this.orderAddressDetails[orderId] = addr;

        this.districtService.getDistrictById(addr.districtId).subscribe(district => {
          this.orderDistrictNames[orderId] = district.name;

          this.cityService.getCitiesforaddresspage().subscribe(cities => {
            const city = cities.find((c: any) => c.id === district.cityId);
            if (city) this.orderCityNames[orderId] = city.name;
            this.cdr.detectChanges();
          });
        });
      },
      error: (err) => {
        console.error('Error loading order address:', err);
      }
    });
  }

  // -------------------- ORDER TOGGLE --------------------
  toggleOrder(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    this.cdr.detectChanges();
  }

  // -------------------- SELECT ORDER --------------------
  selectOrder(order: OrderResponse) {
    this.selectedOrderId = this.selectedOrderId === order.orderId ? null : order.orderId;
    this.cdr.detectChanges();
  }

  // -------------------- START SALE --------------------
  startNewSale(accountId: string) {
    this.router.navigate(['/offer-selection'], {
      queryParams: { billingAccountId: accountId }
    });
  }

  // -------------------- VIEW PRODUCT --------------------
  viewProduct(item: any, order: any) {
    console.log("Product clicked:", item);
    console.log("Order:", order);
    
    this.selectedProduct = item;
    this.selectedOrder = order;

    if (!item.productOfferId) {
      alert("Product Offer ID bulunamadı!");
      return;
    }

    this.productOfferService.getProductOffer(item.productOfferId).subscribe({
      next: (spec) => {
        this.productSpec = spec;
        this.showProductModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading product spec:', err);
        alert("Spec bilgisi alınamadı.");
      }
    });
  }

  // -------------------- NOTIFICATIONS --------------------
  showSuccessNotificationUpdate(): void {
    this.ngZone.run(() => {
      this.showNotificationUpdate = true;
      this.isFadingOut = false;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isFadingOut = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showNotificationUpdate = false;
          this.isFadingOut = false;
          this.cdr.detectChanges();
        }, 500);
      }, 4500);
    });
  }

  showSuccessNotificationCreate(): void {
    this.ngZone.run(() => {
      this.showNotificationCreate = true;
      this.isFadingOut = false;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isFadingOut = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showNotificationCreate = false;
          this.isFadingOut = false;
          this.cdr.detectChanges();
        }, 500);
      }, 4500);
    });
  }
}
