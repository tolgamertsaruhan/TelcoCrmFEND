import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/authmodels/LoginRequest';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Navbar, Sidebar],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  showPassword = false;

  private emailRegex = /^[a-z]+\.[a-z]+@etiya\.com$/; // ETIYA_EMAIL_REGEX
  
  private passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>/?]).{8,}$/; // STRONG_PASSWORD_REGEX

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit() {

     // ✅ Eğer kullanıcı zaten giriş yaptıysa doğrudan yönlendir
    if (this.auth.userState().isLoggedIn) {
      this.router.navigate(['/customer-search']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
      password: ['', [Validators.required, Validators.pattern(this.passwordRegex)]]
    });
  }

   togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    /*this.errorMessage = null;
    if (this.loginForm.invalid) return;
    this.isSubmitting = true;
    const payload: LoginRequest = this.loginForm.value;
    this.auth.login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.errorMessage = err?.error || 'Giriş başarısız';
      }
    });*/

    if (this.loginForm.invalid) return;
    
    this.isSubmitting = true;
    const payload: LoginRequest = this.loginForm.value;
    
    this.auth.login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.errorMessage = null;
        this.router.navigateByUrl('/');
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        // ChangeDetectorRef olmadan setTimeout kullanarak değişikliği sonraki cycle'a ertele
        this.errorMessage = 'Wrong username or password.\nPlease try again!';
        this.cd.detectChanges(); // <-- buradaki değişikliği Angular’a bildir
      }
    });
  }
}
