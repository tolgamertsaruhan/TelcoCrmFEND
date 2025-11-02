import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { RegisterUserRequest } from '../../models/authmodels/RegisterUserRequest';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Navbar, Sidebar],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  // Regexleri backend ile uyumlu yapıyoruz
  private emailRegex = /^[a-z]+\.[a-z]+@etiya\.com$/; // ETIYA_EMAIL_REGEX
  
  private passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>/?]).{8,}$/; // STRONG_PASSWORD_REGEX

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ ChangeDetectorRef inject
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
        password: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  submit(): void {
    this.errorMessage = null;

    // tüm alanların validatorlarını güncelle
    this.registerForm.markAllAsTouched();
    this.registerForm.updateValueAndValidity();
    this.cdr.detectChanges();

    if (this.registerForm.invalid) return;

    this.isSubmitting = true;

    const payload: RegisterUserRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        alert('Kayıt başarılı! Lütfen giriş yapın.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error || 'Kayıt başarısız.';
        this.cdr.detectChanges();
      },
    });
  }
}
