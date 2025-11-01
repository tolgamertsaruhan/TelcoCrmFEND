import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactMedium } from '../../../models/individualcustomer/requests/CreateCustomerModel';
import { CreatedContactMediumResponse } from '../../../models/individualcustomer/responses/CreateFullIndividualCustomerResponse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-medium-information',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './contact-medium-information.html',
  styleUrl: './contact-medium-information.scss',
})
export class ContactMediumInformation {
  contactForm!: FormGroup;
  contactId?: string;
  customerId!: string;
  isEditing = false;
  originalData: CreatedContactMediumResponse[] = [];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.parent?.snapshot.paramMap.get('id') || '';;

    this.contactForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.email]],
      mobilePhone: [{ value: '', disabled: true }],
      homePhone: [{ value: '', disabled: true }],
      fax: [{ value: '', disabled: true }]
    });

    this.loadContactInfo();
  }

  loadContactInfo(): void {
    this.http.get<CreatedContactMediumResponse[]>(
    `http://localhost:8091/customerservice/api/contactmediums/contacts-for-customer/${this.customerId}`
  ).subscribe({
    next: (res) => {
      console.log('Contact response:', res);

      // Form alanlarını doldur
      const formValues: any = {
        email: '',
        mobilePhone: '',
        homePhone: '',
        fax: ''
      };

      res.forEach(cm => {
        switch (cm.type) {
          case 'EMAIL':
            formValues.email = cm.value;
            this.contactId = cm.id; // isteğe bağlı: email id
            break;
          case 'MOBILE_PHONE':
            formValues.mobilePhone = cm.value;
            break;
          case 'HOME_PHONE':
            formValues.homePhone = cm.value;
            break;
          case 'FAX':
            formValues.fax = cm.value;
            break;
        }
      });

      this.contactForm.patchValue(formValues);
      //this.originalData = { ...formValues };
      this.originalData = res; 
      this.contactForm.disable(); // gerekiyorsa tekrar disable et
    },
    error: (err) => console.error('Error loading contact info:', err)
  });
  }

  onEdit(): void {
    this.isEditing = true;
    this.contactForm.enable();
  }

  onCancel(): void {
    this.isEditing = false;
    this.contactForm.patchValue(this.originalData || {});
    this.contactForm.disable();
  }

  onSave(): void {
    /*if (this.contactForm.valid) {
      const updatedContact = this.contactForm.getRawValue();

      // Eğer daha önce bir contact kaydı varsa PUT, yoksa POST yapalım:
      const request$ = this.contactId
        ? this.http.put(
            `http://localhost:8091/customerservice/api/contactmediums`,
            updatedContact
          )
        : this.http.post(
            `http://localhost:8091/customerservice/api/contactmediums`,
            { ...updatedContact, customerId: this.customerId }
          );

      request$.subscribe({
        next: () => {
          alert('Contact information saved successfully!');
          this.isEditing = false;
          this.originalData = { ...updatedContact };
          this.contactForm.disable();
        },
        error: (err) => {
          console.error(err);
          alert('Error saving contact info!');
        }
      });
    }*/
    if (!this.contactForm.valid) return;

  const formValues = this.contactForm.getRawValue();
  const updatePayload = [];

  // Her form alanını backend formatına çevir
  if (formValues.email) {
    const emailContact = this.originalData?.find((c: any) => c.type === 'EMAIL');
    updatePayload.push({
      id: emailContact?.id || undefined,
      type: 'EMAIL',
      value: formValues.email,
      customerId: this.customerId,
      primary: emailContact?.isPrimary || false
    });
  }

  if (formValues.mobilePhone) {
    const mobileContact = this.originalData?.find((c: any) => c.type === 'MOBILE_PHONE');
    updatePayload.push({
      id: mobileContact?.id || undefined,
      type: 'MOBILE_PHONE',
      value: formValues.mobilePhone,
      customerId: this.customerId,
      primary: mobileContact?.isPrimary || false
    });
  }

  if (formValues.homePhone) {
    const homeContact = this.originalData?.find((c: any) => c.type === 'HOME_PHONE');
    updatePayload.push({
      id: homeContact?.id || undefined,
      type: 'HOME_PHONE',
      value: formValues.homePhone,
      customerId: this.customerId,
      primary: homeContact?.isPrimary || false
    });
  }

  if (formValues.fax) {
    const faxContact = this.originalData?.find((c: any)=> c.type === 'FAX');
    updatePayload.push({
      id: faxContact?.id || undefined,
      type: 'FAX',
      value: formValues.fax,
      customerId: this.customerId,
      primary: faxContact?.isPrimary || false
    });
  }

  // PUT veya POST işlemi
  updatePayload.forEach(contact => {
    const request$ = contact.id
      ? this.http.put(`http://localhost:8091/customerservice/api/contactmediums`, contact)
      : this.http.post(`http://localhost:8091/customerservice/api/contactmediums`, contact);

    request$.subscribe({
      next: () => console.log(`Saved ${contact.type}`),
      error: (err) => console.error(`Error saving ${contact.type}:`, err)
    });
  });

  alert('Contact information saved successfully!');
  this.isEditing = false;
  this.contactForm.disable();
  }

  onDelete(): void {
    if (!this.contactId) {
      alert('No contact record found to delete.');
      return;
    }

    if (confirm('Emin misiniz? Bu iletişim kaydı silinecek.')) {
      this.http.delete(
        `http://localhost:8091/customerservice/api/contactmediums/${this.contactId}/soft`
      ).subscribe({
        next: () => {
          alert('Contact deleted successfully!');
          this.contactForm.reset();
          this.contactForm.disable();
          this.isEditing = false;
          
        },
        error: (err) => {
          console.error(err);
          alert('Error deleting contact info!');
        }
      });
    }
  }
}
