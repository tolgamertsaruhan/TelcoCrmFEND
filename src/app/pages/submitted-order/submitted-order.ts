import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
 
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
 
import { OrderService } from '../../services/order-service';
import { AddressService } from '../../services/address-service';
import { DistrictService } from '../../services/district-service';
import { CityService } from '../../services/city-service';
import { BillingAccountService } from '../../services/billingAccount-service';
 
import { OrderResponse } from '../../models/ordermodels/OrderResponse';
import { GetAddressResponse } from '../../models/individualcustomer/responses/GetAddressResponse';
import { BackgroundItem } from "../../components/background-item/background-item";
 
@Component({
  selector: 'app-submitted-order',
  standalone: true,
  imports: [CommonModule, Navbar, Sidebar, BackgroundItem],
  templateUrl: './submitted-order.html',
  styleUrl: './submitted-order.scss'
})
export class SubmittedOrderComponent implements OnInit {
 
  orderId!: string;
  order: OrderResponse | null = null;
 
  addressDetails: GetAddressResponse | null = null;
 
  districtName: string = '';
  cityName: string = '';
 
  isLoading: boolean = true;
  hasError: boolean = false;
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private addressService: AddressService,
    private districtService: DistrictService,
    private cityService: CityService,
    private billingAccountService: BillingAccountService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('orderId');
 
      if (!id) {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }
 
      this.orderId = id;
 
      setTimeout(() => this.loadOrder());
    });
  }
 
  loadOrder(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.order = res;
 
          // Backend serviceAddress = addressId
          this.loadAddressDetails(res.serviceAddress);
 
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.hasError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
 
  loadAddressDetails(addressId: string): void {
    this.addressService.getAddressById(addressId).subscribe({
      next: (addr) => {
        setTimeout(() => {
          this.addressDetails = addr;
 
          this.resolveDistrictAndCity(addr.districtId);
 
          this.cdr.detectChanges();
        });
      }
    });
  }
 
  resolveDistrictAndCity(districtId: string): void {
    this.districtService.getDistrictById(districtId).subscribe({
      next: (district) => {
        this.districtName = district.name;
 
        this.cityService.getCitiesforaddresspage().subscribe({
          next: (cities) => {
            const city = cities.find((c: any) => c.id === district.cityId);
            if (city) {
              this.cityName = city.name;
            }
            this.cdr.detectChanges();
          }
        });
      }
    });
  }
 
  // ❗ Sadece gerekli route'a yönlendireceğiz, customer-search yok.
  onFinish(): void {
 
    // 1️⃣ OrderId → BillingAccountId
    this.orderService.getBillingAccountIdByOrderId(this.orderId).subscribe({
      next: (billingAccountId: string) => {
 
        // 2️⃣ BillingAccountId → CustomerId
        this.billingAccountService.getCustomerIdByBillingAccountId(billingAccountId).subscribe({
          next: (customerId: string) => {
 
            // 3️⃣ Route’a yönlendir
            this.router.navigate([
              '/customer-information-screen',
              customerId,
              'billing-account-information'
            ]);
          }
        });
 
      }
    });
  }
}