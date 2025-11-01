import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CityService } from '../../../services/city-service';
import { DistrictService } from '../../../services/district-service';
import { AddressService } from '../../../services/address-service';
import { Address } from '../../../models/individualcustomer/requests/CreateCustomerModel';
import { CommonModule } from '@angular/common';
import { UpdateAddressRequest } from '../../../models/individualcustomer/requests/UpdateAddressRequest';

@Component({
  selector: 'app-address-information',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule],
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private addressService: AddressService,
    private cityService: CityService,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ Parent route’tan müşteri ID’sini alıyoruz
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
      districtId: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      description: [''],
      isPrimary: [false]
    });
  }

  loadAddresses(): void {
    /*if (!this.customerId) return;
    this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
      next: (data) => (this.addresses = data),
      error: (err) => console.error('Error loading addresses:', err)
    });*/

    /*if (!this.customerId) return;
    this.addressService.getAddressesByCustomerId(this.customerId).subscribe({
    next: (data) => {
      this.addresses = data;
      this.cdr.detectChanges(); // 🟢 Angular’a değişikliği bildir
    },
    error: (err) => console.error('Error loading addresses:', err)
  });*/
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

  loadCities(): void {
    this.cityService.getCities().subscribe({
      next: (data) => (this.cities = data),
      error: (err) => console.error('Error loading cities:', err)
    });
  }

  onCityChange(): void {
    /*const cityId = this.addressForm.get('cityId')?.value;
    if (cityId) {
      this.districtService.getDistrictsByCity(cityId).subscribe({
        next: (data) => (this.districts = data),
        error: (err) => console.error('Error loading districts:', err)
      });
    } else {
      this.districts = [];
    }*/

      // 2. düzenleme
  /* const cityId = this.addressForm.get('cityId')?.value;
  if (cityId) {
    this.districtService.getDistrictsByCity(cityId).subscribe({
      next: (data) => {
        this.districts = data;

        // Eğer düzenleme modundaysan, districtId'yi tekrar patch et
        if (this.isEditing) {
          const currentDistrict = this.addressForm.get('districtId')?.value;
          this.addressForm.patchValue({ districtId: currentDistrict });
        }
      },
      error: (err) => console.error('Error loading districts:', err)
    });
  } else {
    this.districts = [];
  }*/

   const selectedCityId = this.addressForm.get('cityId')?.value;

  if (selectedCityId) {
    this.districtService.getDistrictsByCity(selectedCityId).subscribe({
      next: (response) => {
        this.districts = response;
        this.addressForm.patchValue({ districtId: null }); // ✅ district sıfırlanır
      },
    });
  } else {
    this.districts = [];
    this.addressForm.patchValue({ districtId: null });
  }
  }

  startAdd(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.editingAddressId = "";
    this.addressForm.reset({ isPrimary: false });
  }

  startEdit(address: CreatedAddressResponse): void {
  /*this.isEditing = true;
  this.isAdding = false;
  this.editingAddressId = address.id;

  /*this.addressForm.patchValue({
    districtId: address.districtId,
    street: address.street,
    houseNumber: address.houseNumber,
    description: address.description,
    isPrimary: address.isDefault === 'true' // string → boolean
  });

  this.onCityChange();
  // districtId üzerinden city'yi bul
  this.districtService.getDistrictById(address.districtId).subscribe({
    next: (district) => {
      this.addressForm.patchValue({
        cityId: district.cityId, // buradan cityId'yi getiriyoruz
        districtId: address.districtId,
        street: address.street,
        houseNumber: address.houseNumber,
        description: address.description,
        isPrimary: address.isDefault
      });

      this.onCityChange(); // city'ye göre districtleri tekrar yükle
    },
    error: (err) => console.error(err)
  });

  */

  this.isEditing = true;
  this.isAdding = false;
  this.editingAddressId = address.id;

  // districtId üzerinden city’yi bul
  this.districtService.getDistrictById(address.districtId).subscribe({
    next: (district) => {
      // önce şehir listesini yükle
      this.cityService.getCities().subscribe({
        next: (cities) => {
          this.cities = cities;

          // Şehrin district’lerini yükle
          this.districtService.getDistrictsByCity(district.cityId).subscribe({
            next: (districtList) => {
              this.districts = districtList;

              // Formu patchle
              this.addressForm.patchValue({
                cityId: district.cityId,
                districtId: address.districtId,
                street: address.street,
                houseNumber: address.houseNumber,
                description: address.description,
                isPrimary: address.isDefault
              });

              this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading districts for edit:', err)
          });
        },
        error: (err) => console.error('Error loading cities:', err)
      });
    },
    error: (err) => console.error('Error getting district:', err)
  });
}

  cancel(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.editingAddressId = "";
  }

  save(): void {
    /*const formValue = this.addressForm.value;

    if (this.isAdding) {
      // ✅ Yeni adres ekleme
      this.addressService
        .addAddress({ ...formValue, customerId: this.customerId })
        .subscribe({
          next: () => {
            this.isAdding = false;
            this.loadAddresses();
          },
          error: (err) => console.error('Error adding address:', err)
        });
    } else if (this.isEditing && this.editingAddressId) {
  const updateRequest = {
    id: this.editingAddressId,              // ✅ backend’in beklediği id
    street: formValue.street,
    houseNumber: formValue.houseNumber,
    description: formValue.description,
    districtId: formValue.districtId,
    isDefault: formValue.isDefault           // ✅ backend’te “default” alanına denk geliyor
  };

  console.log(updateRequest);
  this.addressService.updateAddress(updateRequest).subscribe({
    next: () => {
      this.isEditing = false;
      this.loadAddresses();
    },
    error: (err) => console.error('Error updating address:', err)
  });
    }

    */

    /*
const formValue = this.addressForm.value;
   const updatedRequest: UpdateAddressRequest = {
  id: this.editingAddressId,
  street: formValue.street,
  houseNumber: formValue.houseNumber,
  description: formValue.description,
  districtId: formValue.districtId,
  isDefault: formValue.isPrimary ?? false  // ✅ backend’in beklediği isim
};

console.log('Final Update Request:', updatedRequest);

this.addressService.updateAddress(updatedRequest).subscribe({
  next: () => {
    this.isEditing = false;
    this.loadAddresses();
  },
  error: (err) => console.error('Error updating address:', err)
});*/
const formValue = this.addressForm.value;

    // ✅ CREATE MODE
    if (this.isAdding) {
      const createRequest = {
      
        customerId: this.customerId,
        districtId: formValue.districtId,
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        description: formValue.description,
        isDefault: formValue.isPrimary ?? false
      };

      console.log('Create Request:', createRequest);

      this.addressService.addAddressInfoPage(createRequest).subscribe({
        next: () => {
          this.isAdding = false;
          this.loadAddresses();
        },
        error: (err) => console.error('Error creating address:', err)
      });

      return;
    }

    // 📝 UPDATE MODE
    if (this.isEditing && this.editingAddressId) {
      const updatedRequest: UpdateAddressRequest = {
        id: this.editingAddressId,
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        description: formValue.description,
        districtId: formValue.districtId,
        isDefault: formValue.isPrimary ?? false
      };

      console.log('Final Update Request:', updatedRequest);

      this.addressService.updateAddress(updatedRequest).subscribe({
        next: () => {
          this.isEditing = false;
          this.loadAddresses();
        },
        error: (err) => console.error('Error updating address:', err)
      });
    }

  }

  confirmDelete(addressId: string): void {
    const confirmed = confirm('Are you sure you want to delete this address?');
    if (confirmed) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => this.loadAddresses(),
        error: (err) => console.error('Error deleting address:', err)
      });
    }
  }
}
