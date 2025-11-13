import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
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
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Navbar, Sidebar],
  templateUrl: './customer-info.html',
  styleUrls: ['./customer-info.scss'],
})
export class CustomerInfo implements OnInit {
  form!: FormGroup;
  nationalIdExists = false;
  currentStep = 1;
  todayString = ''; // yyyy-mm-dd for max attribute
 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private customerService: CustomerCreationService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit() {
    // today string for input[type=date] max attribute
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.todayString = `${yyyy}-${mm}-${dd}`;
 
    this.buildForm();
  }
 
  // Custom validator: Sadece sayı kontrolü
  numericValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // Boşsa required validator kontrol eder
 
    const isNumeric = /^\d+$/.test(value); // Sadece rakam kontrolü
    return isNumeric ? null : { notNumeric: true };
  }
 
  buildForm() {
    const nameValidators = [Validators.minLength(2), Validators.maxLength(20)];
    this.form = this.fb.group({
      firstName: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.firstName ?? '',
        [Validators.required, ...nameValidators]
      ),
      lastName: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.lastName ?? '',
        [Validators.required, ...nameValidators]
      ),
      middleName: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.middleName ?? '',
        nameValidators
      ),
      nationalId: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.nationalId ?? '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          this.numericValidator
        ],
        [this.nationalIdExistsValidator.bind(this)]
      ),
      gender: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.gender ?? '',
        Validators.required
      ),
      motherName: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.motherName ?? '',
        nameValidators
      ),
      fatherName: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.fatherName ?? '',
        nameValidators
      ),
      dateOfBirth: new FormControl(
        this.customerService.state().createIndividualCustomerRequest?.dateOfBirth ?? '',
        Validators.required
      )
    });
 
    // Mevcut async validator ve TC check zaten async validatorda var; form.valueChanges ile
    // ekstra UI state set etmek isterseniz burada kullanabilirsiniz. Şimdilik validator içinde
    // http çağrısı yapılıyor (nationalIdExistsValidator).
  }
 
  // Async validator for nationalId (returns Observable)
  nationalIdExistsValidator(control: AbstractControl) {
    if (!control.value || control.value.length !== 11) {
      return of(null); // boş veya eksikse sorgulama yapma
    }
 
    return this.http
      .get<boolean>(`http://localhost:8091/customerservice/api/individual-customers/existsByNationalId/${control.value}`)
      .pipe(
        debounceTime(500),
        catchError(() => of(false)),
        switchMap(exists => {
          this.nationalIdExists = exists; // UI'da da gösterebilmek için
          this.cdr.detectChanges();
          return of(exists ? { nationalIdExists: true } : null);
        })
      );
  }
 
  goToStep(step: number) {
    const state = this.customerService.state();
 
    switch (step) {
      case 1:
        this.router.navigate(['/customer-create/customer-info']);
        break;
      case 2:
        if (this.form.valid) {
          this.customerService.setCustomerInfo(this.form.value);
          this.router.navigate(['/customer-create/address-info']);
        } else {
          // kullanıcıya kısa uyarı
          alert('Please fill required fields before moving to Address.');
        }
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
 
  next() {
    if (!this.form.valid) {
      alert('Please fill all required fields.');
      return;
    }
 
    this.customerService.setCustomerInfo(this.form.value);
    this.router.navigateByUrl('/customer-create/address-info');
  }
 
  goBackToSearch(): void {
    this.router.navigate(['/customer-search']);
  }
 
  // ---------- Name input helpers ----------
  /**
   * Bu fonksiyon first/last name alanlarına girilen tuşları kontrol eder.
   * Sadece harf (Türkçe karakterler dahil) + kontrol tuşlarına izin verir.
   */
  onNameKeydown(event: KeyboardEvent) {
    const allowedControlKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End'
    ];
 
    // Eğer control/meta/alt ile kombinasyon varsa izin ver (kopyala-yapıştır gibi)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
 
    if (allowedControlKeys.includes(event.key)) {
      return; // navigation / editing tuşlarına izin ver
    }
 
    // Türkçe ve İngilizce harfleri kapsayan regex (büyük-küçük, ç ğ ı ö ş ü)
    const letterRegex = /^[A-Za-zÇĞİÖŞÜçğıöşü]$/;
 
    if (!letterRegex.test(event.key)) {
      // printable değilse veya izin verilen harf değilse engelle
      event.preventDefault();
    }
  }
 
  /**
   * Paste olayını kontrol eder: yapıştırılan içerik yalnızca izin verilen harflerden oluşmalı.
   */
  onNamePaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') ?? '';
    const allowedRegex = /^[A-Za-zÇĞİÖŞÜçğıöşü]+$/;
    if (!allowedRegex.test(paste)) {
      event.preventDefault();
    }
  }
 
  // ---------- Date input helpers ----------
  /**
   * Klavyeden tarih yazmayı engelle (sadece tarih seçimiyle alınsın).
   * Yine Tab, Arrow, Enter gibi tuşlara izin veriyoruz.
   */
  preventDateTyping(event: KeyboardEvent) {
    const allowedKeys = ['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    // Diğer tüm tuşları iptal et => kullanıcı elle yazamaz
    event.preventDefault();
  }
 
  /**
   * Tarih ikonuna tıklanınca datepicker'ı açmaya çalış.
   * Modern tarayıcılarda showPicker() API'si olabilir; yoksa focus() ile dene.
   * @param input Element
   */
  openDatePicker(input: HTMLInputElement) {
    try {
      // @ts-ignore showPicker may exist in modern browsers
      if (typeof input.showPicker === 'function') {
        // show native picker
        // not all browsers support this, hence try/catch
        // remove readonly if set experimentally (we didn't set readonly attribute)
        input.showPicker();
        return;
      }
    } catch (e) {
      // ignore
    }
    // fallback: focus, bazı tarayıcılarda bu da datepicker'ı açar
    input.focus();
  }
 
  // Utility: dd-mm-yyyy gösterim (sadece UI bilgilendirmesi için)
  formatDateToDDMMYYYY(val: string | null): string {
    if (!val) return '';
    // val is yyyy-mm-dd (from input[type=date])
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
}