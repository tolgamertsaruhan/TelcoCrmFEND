import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerCreationService } from '../../../../services/customer-creation-service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreateFullIndividualCustomerResponse } from '../../../../models/individualcustomer/responses/CreateFullIndividualCustomerResponse';
import { Navbar } from "../../../../components/navbar/navbar";
import { Sidebar } from "../../../../components/sidebar/sidebar";

@Component({
  selector: 'app-contact-medium-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Navbar, Sidebar],
  templateUrl: './contact-medium-info.html',
  styleUrl: './contact-medium-info.scss',
})
export class ContactMediumInfo {
   form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerCreationService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    const state = this.customerService.state();

    this.form = this.fb.group({
      emails: this.fb.array(
        (state.createContactMediumRequests?.filter((x: any) => x.type === 'EMAIL') ?? [''])
          .map((x: any) => new FormControl(x.value || '', [Validators.email]))
      ),
      mobilePhones: this.fb.array(
        (state.createContactMediumRequests?.filter((x: any) => x.type === 'MOBILE_PHONE') ?? [''])
          .map((x: any) => new FormControl(x.value || '', Validators.required))
      ),
      homePhones: this.fb.array(
        (state.createContactMediumRequests?.filter((x: any) => x.type === 'HOME_PHONE') ?? [])
          .map((x: any) => new FormControl(x.value || ''))
      ),
      faxes: this.fb.array(
        (state.createContactMediumRequests?.filter((x: any) => x.type === 'FAX') ?? [])
          .map((x: any) => new FormControl(x.value || ''))
      )
    });

    // Eğer state’te hiçbir email yoksa en az bir tane ekleyelim:
    if (this.emails.length === 0) this.emails.push(new FormControl('', [Validators.email]));
    if (this.mobilePhones.length === 0) this.mobilePhones.push(new FormControl('', Validators.required));
  }

  get emails() {
    return this.form.get('emails') as FormArray<FormControl>;
  }

  get mobilePhones() {
    return this.form.get('mobilePhones') as FormArray<FormControl>;
  }

  get homePhones() {
    return this.form.get('homePhones') as FormArray<FormControl>;
  }

  get faxes() {
    return this.form.get('faxes') as FormArray<FormControl>;
  }

  addField(field: FormArray<FormControl>, validator?: any) {
    field.push(new FormControl('', validator));
  }

  removeField(field: FormArray<FormControl>, i: number) {
    field.removeAt(i);
  }

  back() {

    const contactMediums = [
    ...this.emails.value.map(v => ({ type: 'EMAIL', value: v, primary: false })),
    ...this.mobilePhones.value.map(v => ({ type: 'MOBILE_PHONE', value: v, primary: false })),
    ...this.homePhones.value.map(v => ({ type: 'HOME_PHONE', value: v, primary: false })),
    ...this.faxes.value.map(v => ({ type: 'FAX', value: v, primary: false }))
  ];

    const updated = {
    ...this.customerService.state(),
    createContactMediumRequests: contactMediums
  };
  this.customerService.state.set(updated);
    this.router.navigateByUrl('/customer-create/address-info');
  }

  create() {
    if (!this.form.valid) {
      alert('Please fill required contact fields.');
      return;
    }

    const contactMediums: any[] = [];

    this.emails.value.forEach((val: string) => {
      if (val) contactMediums.push({ type: 'EMAIL', value: val, primary: false });
    });

    this.mobilePhones.value.forEach((val: string) => {
      if (val) contactMediums.push({ type: 'MOBILE_PHONE', value: val, primary: false });
    });

    this.homePhones.value.forEach((val: string) => {
      if (val) contactMediums.push({ type: 'HOME_PHONE', value: val, primary: false });
    });

    this.faxes.value.forEach((val: string) => {
      if (val) contactMediums.push({ type: 'FAX', value: val, primary: false });
    });

    const updated = {
      ...this.customerService.state(),
      createContactMediumRequests: contactMediums,
    };

    this.customerService.state.set(updated);

    // En güncel state'i al
  const currentState = this.customerService.getCurrentCustomer();

  // Backend'in beklediği yapıya uygun payload
  const payload = {
    createIndividualCustomerRequest: currentState.createIndividualCustomerRequest,
    addressRequestList: currentState.addressRequestList,
    createContactMediumRequests: currentState.createContactMediumRequests
  };

  console.log("Gönderilen payload:", payload);

  this.http
  .post<CreateFullIndividualCustomerResponse>(
    'http://localhost:8091/customerservice/api/individual-customers/create-full',
    payload
  )
  .subscribe({
    next: (response) => {
      const customerId = response.customerResponse?.id;
 
      if (customerId) {
        alert('Customer created successfully!');
        // ID ile yönlendirme
        this.router.navigateByUrl(`/customer-information-screen/${customerId}`);
      } else {
        alert('Customer created, but ID not found in response.');
      }
    },
    error: (err) => {
      console.error(err);
      alert('Error occurred: ' + err.message);
    },
  });

  // environment üzerinden API çağrısı yap
  /*this.http
    .post('http://localhost:8091/customerservice/api/individual-customers/create-full', payload)
    .subscribe({
      next: () => {
        alert('Customer created successfully!');
        this.router.navigateByUrl('/customer-search');
      },
      error: (err) => {
        console.error(err);
        alert('Error occurred: ' + err.message);
      },
    });*7

    /*this.http
      .post('http://localhost:8091/customerservice/api/individual-customers/create-full', updated)
      .subscribe({
        next: () => alert('Customer created successfully!'),
        error: (err) => alert('Error occurred: ' + err.message),
      });*/
  }
  

  /*addContactMedium() {
    if (this.form.valid) {
      this.customerService.addContactMedium(this.form.value);
      this.form.reset();
    }
  }

  createCustomer() {
    const payload = this.customerService.getCurrentCustomer();

    this.http.post('/api/customers', payload).subscribe({
      next: () => alert('Customer created successfully!'),
      error: (err) => alert('Error: ' + err.message)
    });
  }

  back() {
    history.back();
  }*/
}

