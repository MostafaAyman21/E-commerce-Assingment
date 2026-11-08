import { Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private _AuthenticationService = inject(AuthenticationService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);

  /** Set by the auth guard: where to go after signing in. */
  returnUrl = input<string>();

  isLoading = signal<boolean>(false);
  msgError = signal<string>('');
  isSuccess = signal<boolean>(false);

  showPassword = signal<boolean>(false);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  submitLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.msgError.set('');

      this._AuthenticationService.SignIn(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.message === 'success') {
            this.isSuccess.set(true);
            this._AuthenticationService.saveToken(res.token, res.user.email);
            this._ToastrService.success(`Welcome back, ${res.user.name}`, 'Signed in');
            setTimeout(() => {
              this._Router.navigateByUrl(this.returnUrl() || '/home');
            }, 600);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.msgError.set(err.error?.message || 'Invalid email or password');
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
