import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationService } from '../../services/configuration-service';
import { OrderService } from '../../services/order-service';
import { AddressService } from '../../services/address-service';
import { CityService } from '../../services/city-service';
import { DistrictService } from '../../services/district-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from "../../components/navbar/navbar";
import { Sidebar } from "../../components/sidebar/sidebar";
import { BackgroundItem } from "../../components/background-item/background-item";

@Component({
  selector: 'app-configuration-product',
  templateUrl: './configuration-product.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar, Sidebar, BackgroundItem],
})
export class ConfigurationProductComponent implements OnInit {

  billingAccountId!: string;

  basket: any;
  customerId!: string;

  // Address Data
  addresses: any[] = [];
  selectedAddressId!: string;

  districtNames: { [key: string]: string } = {};
  cityNames: { [key: string]: string } = {};

  // New Address Modal
  showAddAddressForm: boolean = false;
  cities: any[] = [];
  districts: any[] = [];
  newAddressForm!: FormGroup;

  // Product configurations
  configurations: any[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigurationService,
    private orderService: OrderService,
    private addressService: AddressService,
    private cityService: CityService,
    private districtService: DistrictService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.billingAccountId = this.route.snapshot.queryParamMap.get('billingAccountId')!;

    this.initNewAddressForm();
    this.loadCustomerAndAddresses();
    this.loadBasket();
    this.loadCities();
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

  // LOAD CUSTOMER + ADDRESSES
  loadCustomerAndAddresses() {
    this.configService.getCustomerByBillingAccountId(this.billingAccountId)
      .subscribe((customerRes: any) => {

        this.customerId = customerRes;
        this.cdr.markForCheck();

        this.loadAddresses(this.customerId);
      });
  }

  loadAddresses(customerId: string) {
    this.addressService.getAddressesByCustomerId(customerId).subscribe({
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
                  this.cdr.markForCheck();
                }
              });
            }
          });
        });

        this.cdr.markForCheck();
      }
    });
  }

  loadCities() {
    this.cityService.getCities().subscribe(res => {
      this.cities = res;
      this.cdr.markForCheck();
    });
  }

  onCityChange() {
    const cityId = this.newAddressForm.get('cityId')?.value;
    if (!cityId) return;

    this.districtService.getDistrictsByCity(cityId).subscribe(res => {
      this.districts = res;
      this.newAddressForm.patchValue({ districtId: null });
      this.cdr.markForCheck();
    });
  }

  // SAVE NEW ADDRESS
  saveNewAddress() {
    if (this.newAddressForm.invalid) return;

    const val = this.newAddressForm.value;

    const createRequest = {
      customerId: this.customerId,
      districtId: val.districtId,
      street: val.street,
      houseNumber: val.houseNumber,
      description: val.description,
      default: val.isDefault ?? false
    };

    this.addressService.addAddressInfoPage(createRequest)
      .subscribe((res: any) => {

        this.showAddAddressForm = false;
        this.selectedAddressId = res.id;

        this.loadAddresses(this.customerId);

        this.cdr.detectChanges();
      });
  }

  // LOAD BASKET + CONFIG
  loadBasket() {
  this.configService.getBasket(this.billingAccountId)
    .subscribe((res: any) => {

      this.basket = res;
      this.configurations = [];  // Temizle

      res.basketItems.forEach((item: any) => {

        const count = item.quantity ?? 1;

        for (let i = 0; i < count; i++) {
          this.configurations.push({
            basketItemId: item.id,
            productOfferId: item.productOfferId,
            productName: item.productName,
            price: item.price,
            instanceNumber: i + 1,
            fields: {},
            schema: []
          });
        }

        this.loadConfig(item.productOfferId);
      });

      this.isLoading = false;
      this.cdr.detectChanges();
    });
}

  loadConfig(poId: string) {
  this.configService.getProductConfiguration(poId)
    .subscribe((res: any) => {

      this.configurations
        .filter(c => c.productOfferId === poId)
        .forEach(conf => {
          conf.schema = res.characteristics;
        });

      this.cdr.markForCheck();
    });
}

  // SUBMIT → CREATE ORDER → redirect to submitted-order
  onSubmit() {

    if (!this.selectedAddressId) {
      alert("Please select an address.");
      return;
    }

    const payload = {
      billingAccountId: this.billingAccountId,
      addressId: this.selectedAddressId,
      configurations: this.configurations.map(c => ({
        productOfferId: c.productOfferId,
        productName: c.productName,
        price: c.price,
        configurationValues: c.fields
      }))
    };

    this.orderService.createOrder(payload)
      .subscribe((orderResponse: any) => {

        const orderId = orderResponse?.orderId;
        if (!orderId) {
          alert("Order created but orderId missing.");
          return;
        }

        this.router.navigate(['/submitted-order'], {
          queryParams: { orderId }
        });
      });
  }
}
