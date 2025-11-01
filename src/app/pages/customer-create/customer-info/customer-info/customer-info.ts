import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerCreationService } from '../../../../services/customer-creation-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';
import { Navbar } from "../../../../components/navbar/navbar";
import { Sidebar } from "../../../../components/sidebar/sidebar";

@Component({
  selector: 'app-customer-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Navbar, Sidebar],
  templateUrl: './customer-info.html',
  styleUrl: './customer-info.scss',
})
export class CustomerInfo {
form!: FormGroup;
nationalIdExists = false;
 
constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private customerService: CustomerCreationService
  ) {}

ngOnInit(){
    this.buildForm();
  }

buildForm() {
  const nameValidators = [Validators.minLength(2), Validators.maxLength(20)];
    this.form = this.fb.group({
      firstName: new FormControl(this.customerService.state().createIndividualCustomerRequest?.firstName ?? '', [Validators.required, ...nameValidators]),
      lastName: new FormControl(this.customerService.state().createIndividualCustomerRequest?.lastName ?? '',[Validators.required, ...nameValidators]),
      middleName: new FormControl(this.customerService.state().createIndividualCustomerRequest?.middleName ?? '',nameValidators),
      nationalId: new FormControl(this.customerService.state().createIndividualCustomerRequest?.nationalId ?? '', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11)
      ]),
      gender: new FormControl(this.customerService.state().createIndividualCustomerRequest?.gender ?? '', Validators.required),
      motherName: new FormControl(this.customerService.state().createIndividualCustomerRequest?.motherName ?? '',nameValidators),
      fatherName: new FormControl(this.customerService.state().createIndividualCustomerRequest?.fatherName ?? '',nameValidators),
      dateOfBirth: new FormControl(this.customerService.state().createIndividualCustomerRequest?.dateOfBirth ?? '', Validators.required)
    });

// 🧠 TC Kimlik numarası değiştikçe backend kontrolü
    this.form.get('nationalId')?.valueChanges
      .pipe(
        debounceTime(600),
        switchMap(value =>
          this.http.get<boolean>(`http://localhost:8091/customerservice/api/individual-customers/existsByNationalId/${value}`).pipe(
            catchError(() => of(false))
          )
        )
      )
      .subscribe(exists => (this.nationalIdExists = exists));
  }


  next() {
    if (!this.form.valid) {
      alert('Please fill all required fields.');
      return;
    }

    /*const updated = { ...this.customerService.state(), ...this.form.value };
    this.customerService.state.set(updated);
    this.router.navigateByUrl('/customer-create/address-info');*/

    // form'daki alanları "createIndividualCustomerRequest" içine kaydediyoruz
  const updated = { ...this.customerService.state(), ...this.form.value };
  this.customerService.setCustomerInfo(this.form.value);

  // Sonra bir sonraki sayfaya geçiyoruz
  this.router.navigateByUrl('/customer-create/address-info');
  }

  goBackToSearch(): void {
    // Absolute route ile
    this.router.navigate(['/customer-search']); // customer search sayfanın route'u

    // veya relative route ile parent route'a dönmek istersen
    // this.router.navigate(['../'], { relativeTo: this.route });
  }
  
}
