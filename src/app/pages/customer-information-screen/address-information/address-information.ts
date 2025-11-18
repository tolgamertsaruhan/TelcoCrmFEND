import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CityService } from '../../../services/city-service';
import { DistrictService } from '../../../services/district-service';
import { AddressService } from '../../../services/address-service';
import { CommonModule } from '@angular/common';
import { UpdateAddressRequest } from '../../../models/individualcustomer/requests/UpdateAddressRequest';


@Component({
  selector: 'app-address-information',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './address-information.html',
  styleUrl: './address-information.scss',
})
export class AddressInformation {

  customerId!: string;
  addresses: CreatedAddressResponse[] = [];
  addressForm!: FormGroup;
  isAdding = false;
  isEditing = false;
  editingAddressId!: string;

  cities: any[] = [];
  districts: any[] = [];
  districtNames: { [key: string]: string } = {};
  cityNames: { [key: string]: string } = {};

  showNotificationUpdate = false;
  showNotificationCreate = false;
  isFadingOut = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private addressService: AddressService,
    private cityService: CityService,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.parent?.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadCities();

    if (this.customerId) {
      this.loadAddresses();
    }
  }

  initForm(): void {
    this.addressForm = this.fb.group({
      cityId: ['', Validators.required],
      districtId: [{ value: '', disabled: true }, Validators.required],
      street: [{ value: '', disabled: true }, Validators.required],
      houseNumber: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: true }, Validators.required],

      // ❗ CREATE modunda required değil
      isDefault: [{ value: false, disabled: true }]
    });
  }

  // --------------------------------------------------------

  loadAddresses(): void {
    if (!this.customerId) return;

    this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.addresses = data;

        this.addresses.forEach(address => {
          this.districtService.getDistrictById(address.districtId).subscribe({
            next: (district) => {
              this.districtNames[address.districtId] = district.name;

              this.cityService.getCitiesforaddresspage().subscribe({
                next: (cities) => {
                  const city = cities.find((c: any) => c.id === district.cityId);
                  if (city) this.cityNames[address.districtId] = city.name;

                  this.cdr.detectChanges();
                }
              });
            }
          });
        });
      }
    });
  }

  loadCities(): void {
    this.cityService.getCities().subscribe({
      next: (data) => (this.cities = data)
    });
  }

  onCityChange(): void {
    const cityId = this.addressForm.get('cityId')?.value;

    if (cityId) {
      this.addressForm.get('districtId')?.enable();
      this.addressForm.get('street')?.disable();
      this.addressForm.get('houseNumber')?.disable();
      this.addressForm.get('description')?.disable();
      this.addressForm.get('isDefault')?.disable();

      this.districtService.getDistrictsByCity(cityId).subscribe({
        next: (data) => {
          this.districts = data;
          this.addressForm.patchValue({ districtId: null });
        }
      });
    } else {
      this.addressForm.get('districtId')?.disable();
      this.addressForm.patchValue({ districtId: null });
    }
  }

  onDistrictChange(): void {
    const districtId = this.addressForm.get('districtId')?.value;

    if (districtId) {
      this.addressForm.get('street')?.enable();
      this.addressForm.get('houseNumber')?.enable();
      this.addressForm.get('description')?.enable();
      this.addressForm.get('isDefault')?.enable();
    }
  }

  // --------------------------------------------------------

  startAdd(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.editingAddressId = "";

    this.initForm();
    this.addressForm.enable();

    this.addressForm.get('districtId')?.disable();
    this.addressForm.get('street')?.disable();
    this.addressForm.get('houseNumber')?.disable();
    this.addressForm.get('description')?.disable();
    this.addressForm.get('isDefault')?.disable();
  }

  startEdit(address: CreatedAddressResponse): void {
  this.isEditing = true;
  this.isAdding = false;
  this.editingAddressId = address.id;

  this.addressForm.enable();

  // Checkbox required olmayacak! Çünkü kural checkbox'ın default olup olmaması.
  this.addressForm.get('isDefault')?.clearValidators();
  this.addressForm.get('isDefault')?.updateValueAndValidity();

  this.districtService.getDistrictById(address.districtId).subscribe({
    next: (district) => {
      this.cityService.getCities().subscribe({
        next: (cities) => {
          this.cities = cities;

          this.districtService.getDistrictsByCity(district.cityId).subscribe({
            next: (districtList) => {
              this.districts = districtList;

              this.addressForm.patchValue({
                cityId: district.cityId,
                districtId: address.districtId,
                street: address.street,
                houseNumber: address.houseNumber,
                description: address.description,
                isDefault: address.default
              });

              // 🔥 ASIL ÖNEMLİ YER BURASI
              if (address.default === true) {
                this.addressForm.get('isDefault')?.disable(); // kullanıcı kaldıramaz
              } else {
                this.addressForm.get('isDefault')?.enable(); // kullanıcı default yapabilir
              }

              this.cdr.detectChanges();
            }
          });
        }
      });
    }
  });
}


  cancel(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.editingAddressId = "";
  }

  // --------------------------------------------------------

  save(): void {
    const formValue = this.addressForm.value;

    // CREATE ------------------------------------------------
    if (this.isAdding) {
      const createRequest = {
        customerId: this.customerId,
        districtId: formValue.districtId,
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        description: formValue.description,

        // required değil → backend'e gönderiyoruz
        default: formValue.isDefault
      };

      this.addressService.addAddressInfoPage(createRequest).subscribe({
        next: () => {
          this.isAdding = false;
          this.loadAddresses();
        }
      });

      this.showSuccessNotificationCreate();
      return;
    }

    // UPDATE ------------------------------------------------
    if (this.isEditing && this.editingAddressId) {

      const updatedRequest: UpdateAddressRequest = {
        id: this.editingAddressId,
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        description: formValue.description,
        districtId: formValue.districtId,
        default: formValue.isDefault
      };

      this.addressService.updateAddress(updatedRequest).subscribe({
        next: () => {
          this.isEditing = false;
          this.loadAddresses();
        }
      });
    }

    this.showSuccessNotificationUpdate();
  }

  // --------------------------------------------------------

  showSuccessNotificationUpdate(): void {
    this.showNotificationUpdate = true;
    this.isFadingOut = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.ngZone.run(() => { this.isFadingOut = true; this.cdr.detectChanges(); });
      setTimeout(() => {
        this.ngZone.run(() => { this.showNotificationUpdate = false; this.cdr.detectChanges(); });
      }, 500);
    }, 4500);
  }

  showSuccessNotificationCreate(): void {
    this.showNotificationCreate = true;
    this.isFadingOut = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.ngZone.run(() => { this.isFadingOut = true; this.cdr.detectChanges(); });
      setTimeout(() => {
        this.ngZone.run(() => {
          this.showNotificationCreate = false;
          this.cdr.detectChanges();
        });
      }, 500);
    }, 4500);
  }

  confirmDelete(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => this.loadAddresses()
      });
    }
  }
}
