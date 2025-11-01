import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerCreationService } from '../../../../services/customer-creation-service';
import { CommonModule } from '@angular/common';
import { CityService } from '../../../../services/city-service';
import { DistrictService } from '../../../../services/district-service';
import { Sidebar } from "../../../../components/sidebar/sidebar";
import { Navbar } from "../../../../components/navbar/navbar";

@Component({
  selector: 'app-address-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Sidebar, Navbar],
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
    districtId: [{ value: state.addressRequestList?.[0]?.districtId ?? '', disabled: true }, Validators.required],
    street: [{ value: state.addressRequestList?.[0]?.street ?? '', disabled: true }, Validators.required],
    houseNumber: [{ value: state.addressRequestList?.[0]?.houseNumber ?? '', disabled: true }],
    description: [{ value: state.addressRequestList?.[0]?.description ?? '', disabled: true }],
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
    this.form.get('districtId')?.enable();
    this.cdr.detectChanges();

    const selectedDistrictId = this.customerService.state().addressRequestList?.[0]?.districtId;
    if (selectedDistrictId) {
      this.form.patchValue({ districtId: selectedDistrictId });
      this.enableOtherFields();
    }
  });
}
  onCityChange(event: any) {
  const cityId = event.target.value;
  // District'i temizle ve disable et
    this.form.patchValue({ districtId: '' });
    this.form.get('districtId')?.disable();
    // Diğer alanları temizle ve disable et
    this.disableOtherFields();
    this.districts = [];
    
    if (cityId) {
      this.loadDistricts(cityId);
    }
}

  /*onCityChange(event: any) {
     const cityId = event.target.value;
     this.districtService.getDistrictsByCity(cityId).subscribe(data => {
      this.districts = data;
      this.cdr.detectChanges(); // 🔥 View’ı elle güncelle
    });
  }*/


     onDistrictChange(event: any) {
    const districtId = event.target.value;
    if (districtId) {
      this.enableOtherFields();
    } else {
      this.disableOtherFields();
    }
  }

  enableOtherFields() {
    this.form.get('street')?.enable();
    this.form.get('houseNumber')?.enable();
    this.form.get('description')?.enable();
  }

  disableOtherFields() {
    this.form.patchValue({
      street: '',
      houseNumber: '',
      description: ''
    });
    this.form.get('street')?.disable();
    this.form.get('houseNumber')?.disable();
    this.form.get('description')?.disable();
  }

  back() {
    // Disabled alanları da dahil et
    const formValue = {
      ...this.form.getRawValue()
    };
    
    const updated = {
      ...this.customerService.state(),
      addressRequestList: [formValue]
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
