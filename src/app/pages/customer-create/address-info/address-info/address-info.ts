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
export class AddressInfo implements OnInit {
  form!: FormGroup;
  cities: any[] = [];
  districts: any[] = [];
  currentStep = 2;
 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerCreationService,
    private cityService: CityService,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit() {
    this.buildForm();
  }
 
  buildForm() {
    const state = this.customerService.state();
 
    this.form = this.fb.group({
      cityId: [state.addressRequestList?.[0]?.cityId ?? '', Validators.required],
      districtId: [{ value: state.addressRequestList?.[0]?.districtId ?? '', disabled: true }, Validators.required],
      street: [{ value: state.addressRequestList?.[0]?.street ?? '', disabled: true }, Validators.required],
      houseNumber: [{ value: state.addressRequestList?.[0]?.houseNumber ?? '', disabled: true }, Validators.required],
      description: [{ value: state.addressRequestList?.[0]?.description ?? '', disabled: true }, Validators.required],
      isDefault: [state.addressRequestList?.[0]?.default ?? true]
    });
 
    this.cityService.getCities().subscribe(cities => {
      this.cities = cities;
      this.cdr.detectChanges();
 
      const selectedCityId = state.addressRequestList?.[0]?.cityId;
      if (selectedCityId) {
        this.form.patchValue({ cityId: selectedCityId });
        this.loadDistricts(selectedCityId);
      }
    });
  }
 
  goBackToSearch(): void {
    this.router.navigate(['/customer-search']);
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
    this.form.patchValue({ districtId: '' });
    this.form.get('districtId')?.disable();
    this.disableOtherFields();
    this.districts = [];
 
    if (cityId) {
      this.loadDistricts(cityId);
    }
  }
 
  onDistrictChange(event: any) {
    const districtId = event.target.value;
    if (districtId) {
      this.enableOtherFields();
    } else {
      this.disableOtherFields();
    }
  }
 
  enableOtherFields() {
    ['street', 'houseNumber', 'description'].forEach(field => this.form.get(field)?.enable());
  }
 
  disableOtherFields() {
    this.form.patchValue({
      street: '',
      houseNumber: '',
      description: ''
    });
    ['street', 'houseNumber', 'description'].forEach(field => this.form.get(field)?.disable());
  }
 
  back() {
    const formValue = this.form.getRawValue();
 
    const updated = {
      ...this.customerService.state(),
      addressRequestList: [formValue],
      _meta: {
        ...this.customerService.state()._meta,
        addressFormValid: this.form.valid
      }
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
      addressRequestList: [this.form.value],
      _meta: {
        ...this.customerService.state()._meta,
        addressFormValid: this.form.valid
      }
    };
 
    this.customerService.state.set(updated);
    this.router.navigateByUrl('/customer-create/contact-medium-info');
  }
 
  goToStep(step: number) {
    const state = this.customerService.state();
    const formValue = this.form.getRawValue();
 
    const updated = {
      ...state,
      addressRequestList: [formValue],
      _meta: {
        ...state._meta,
        addressFormValid: this.form.valid
      }
    };
 
    this.customerService.state.set(updated);
 
    switch (step) {
      case 1:
        this.router.navigate(['/customer-create/customer-info']);
        break;
      case 2:
        break;
      case 3:
        if (state._meta?.addressFormValid) {
          this.router.navigate(['/customer-create/contact-medium-info']);
        } else {
          alert('Address form is not valid yet.');
        }
        break;
    }
  }
}