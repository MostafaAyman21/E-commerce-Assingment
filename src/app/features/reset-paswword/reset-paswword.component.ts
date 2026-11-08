import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';

type Step = 1 | 2 | 3;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-reset-paswword',
  styleUrl: './reset-paswword.component.css',
  templateUrl: './reset-paswword.component.html',
})
export class ResetPaswwordComponent {
  private _AuthenticationService = inject(AuthenticationService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);

  step = signal<Step>(1);
  isLoading = signal<boolean>(false);
  msgError = signal<string>('');
  showPassword = signal<boolean>(false);

  // Step 1: send the code to the email
  emailForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });

  // Step 2: verify the code
  codeForm: FormGroup = new FormGroup({
    resetCode: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]),
  });

  // Step 3: choose a new password
  passwordForm: FormGroup = new FormGroup(
    {
      newPassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/),
      ]),
      rePassword: new FormControl(null, [Validators.required]),
    },
    { validators: [this.confirmPassword] },
  );

  confirmPassword(group: AbstractControl): ValidationErrors | null {
    return group.get('newPassword')?.value === group.get('rePassword')?.value ? null : { mismatch: true };
  }

  sendCode() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.start();
    this._AuthenticationService.ForgotPassword(this.emailForm.value.email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._ToastrService.success(res.message, 'Check your email');
        this.step.set(2);
      },
      error: (err) => this.fail(err),
    });
  }

  verifyCode() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.start();
    this._AuthenticationService.VerifyResetCode(this.codeForm.value.resetCode.trim()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._ToastrService.success('Code verified, choose a new password', 'Verified');
        this.step.set(3);
      },
      error: (err) => this.fail(err),
    });
  }

  resetPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.start();
    const email = this.emailForm.value.email;
    this._AuthenticationService.ResetPassword(email, this.passwordForm.value.newPassword).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._AuthenticationService.saveToken(res.token, email);
        this._ToastrService.success('Your password was reset and you are now signed in', 'Password reset');
        this._Router.navigate(['/home']);
      },
      error: (err) => this.fail(err),
    });
  }

  private start() {
    this.isLoading.set(true);
    this.msgError.set('');
  }

  private fail(err: any) {
    this.isLoading.set(false);
    this.msgError.set(err.error?.message || 'Something went wrong, please try again');
  }
}
