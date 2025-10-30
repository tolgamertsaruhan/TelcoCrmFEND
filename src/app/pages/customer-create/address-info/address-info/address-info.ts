import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerCreationService } from '../../../../services/customer-creation-service';
import { CommonModule } from '@angular/common';
import { CityService } from '../../../../services/city-service';
import { DistrictService } from '../../../../services/district-service';

@Component({
  selector: 'app-address-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './address-info.html',
  styleUrl: './address-info.scss',
})
export class AddressInfo  {
  form!: FormGroup;
  cities: any[] = [];
  districts: any[] = [];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerCreationService,
    private cityService: CityService,
    private districtService:DistrictService,
    private cdr:ChangeDetectorRef
  ) { }

  ngOnInit(){
    this.buildForm();
  }

  buildForm() {

    const state = this.customerService.state();
    
    this.form = this.fb.group({
    cityId: [state.addressRequestList?.[0]?.cityId ?? '', Validators.required],
    districtId: [state.addressRequestList?.[0]?.districtId ?? '', Validators.required],
    street: [state.addressRequestList?.[0]?.street ?? '', Validators.required],
    housenumber: [state.addressRequestList?.[0]?.housenumber ?? ''],
    description: [state.addressRequestList?.[0]?.description ?? ''],
    isDefault: [state.addressRequestList?.[0]?.isDefault ?? true]
    });

   /* this.cityService.getCities().subscribe(data => {
     this.cities = data;
     this.cdr.detectChanges(); // ✅ BURAYA TAŞINDI
     });*/

    this.cityService.getCities().subscribe(cities => {
    this.cities = cities;
    this.cdr.detectChanges();

    const selectedCityId = state.addressRequestList?.[0]?.cityId;
    if (selectedCityId) {
      // Form'u patch et
      this.form.patchValue({ cityId: selectedCityId });
      // Seçilen city için districtleri yükle
      this.loadDistricts(selectedCityId);
    }
  });
     

     

    
  }


  loadDistricts(cityId: string) {
  this.districtService.getDistrictsByCity(cityId).subscribe(districts => {
    this.districts = districts;
    this.cdr.detectChanges();

    const selectedDistrictId = this.customerService.state().addressRequestList?.[0]?.districtId;
    if (selectedDistrictId) {
      this.form.patchValue({ districtId: selectedDistrictId });
    }
  });
}
  onCityChange(event: any) {
  const cityId = event.target.value;
  this.loadDistricts(cityId);
}

  /*onCityChange(event: any) {
     const cityId = event.target.value;
     this.districtService.getDistrictsByCity(cityId).subscribe(data => {
      this.districts = data;
      this.cdr.detectChanges(); // 🔥 View’ı elle güncelle
    });
  }*/

  back() {
     const updated = {
    ...this.customerService.state(),
    addressRequestList: [this.form.value]
  };
  this.customerService.state.set(updated);

  this.router.navigateByUrl('/customer-create/customer-info');
  }

  next() {
    if (!this.form.valid) {
      alert('Please fill all required fields.');
      return;
    }

    const updated = {
      ...this.customerService.state(),
      addressRequestList: [this.form.value]
    };

    this.customerService.state.set(updated);
    this.router.navigateByUrl('/customer-create/contact-medium-info');
  }
}
