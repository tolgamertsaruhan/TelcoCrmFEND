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
  originalData: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') || '';

    this.contactForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.email]],
      mobilePhone: [{ value: '', disabled: true }],
      homePhone: [{ value: '', disabled: true }],
      fax: [{ value: '', disabled: true }]
    });

    this.loadContactInfo();
  }

  loadContactInfo(): void {
    this.http.get<CreatedContactMediumResponse>(
      `http://localhost:8091/customerservice/api/contactmediums/${this.customerId}/customerId`
    ).subscribe({
      next: (res) => {
        if (res) {
          this.contactForm.patchValue(res);
          this.originalData = { ...res };
          this.contactId = res.id;
        } else {
          console.log('No contact info found for this customer.');
        }
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
    if (this.contactForm.valid) {
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
    }
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
          this.originalData = null;
        },
        error: (err) => {
          console.error(err);
          alert('Error deleting contact info!');
        }
      });
    }
  }
}
