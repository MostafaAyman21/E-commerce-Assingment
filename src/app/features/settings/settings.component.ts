import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { AddressesService } from '../../core/services/Addresses/addresses.service';
import { IAddress } from '../../core/models/Address/iaddress.interface';

type Tab = 'info' | 'password' | 'addresses';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-settings',
  styleUrl: './settings.component.css',
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  protected _AuthenticationService = inject(AuthenticationService);
  private _AddressesService = inject(AddressesService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);

  /** `?tab=` query param. */
  tab = input<string>();
  activeTab = linkedSignal<Tab>(() =>
    this.tab() === 'password' || this.tab() === 'addresses' ? (this.tab() as Tab) : 'info',
  );

  tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'info', label: 'Account Info', icon: 'fa-regular fa-id-card' },
    { key: 'password', label: 'Change Password', icon: 'fa-solid fa-key' },
    { key: 'addresses', label: 'My Addresses', icon: 'fa-solid fa-location-dot' },
  ];

  infoLoading = signal<boolean>(false);
  passwordLoading = signal<boolean>(false);
  addressLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showAddressForm = signal<boolean>(false);
  addresses = signal<IAddress[]>([]);
  removingAddress = signal<string | null>(null);

  infoForm: FormGroup = new FormGroup({
    name: new FormControl(this._AuthenticationService.userInfo().name ?? null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    email: new FormControl(this._AuthenticationService.userEmail() || null, [Validators.email]),
    phone: new FormControl(null, [Validators.pattern(/^01[0125][0-9]{8}$/)]),
  });

  passwordForm: FormGroup = new FormGroup(
    {
      currentPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/),
      ]),
      rePassword: new FormControl(null, [Validators.required]),
    },
    { validators: [this.confirmPassword] },
  );

  addressForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    details: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    city: new FormControl(null, [Validators.required]),
  });

  confirmPassword(group: AbstractControl): ValidationErrors | null {
    return group.get('password')?.value === group.get('rePassword')?.value ? null : { mismatch: true };
  }

  ngOnInit() {
    this.getAddresses();
  }

  selectTab(tab: Tab) {
    this.activeTab.set(tab);
    this._Router.navigate([], { queryParams: { tab }, replaceUrl: true });
  }

  invalid(form: FormGroup, name: string) {
    const control = form.get(name);
    return !!control && control.invalid && control.touched;
  }

  updateInfo() {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }
    // Send only what changed: the API rejects an unchanged email as "already in use".
    const { name, email, phone } = this.infoForm.value;
    const data: Record<string, string> = {};
    if (name && name !== this._AuthenticationService.userInfo().name) data['name'] = name;
    if (email && email !== this._AuthenticationService.userEmail()) data['email'] = email;
    if (phone) data['phone'] = phone;
    if (!Object.keys(data).length) {
      this._ToastrService.info('Nothing to update', 'Settings');
      return;
    }

    this.infoLoading.set(true);
    this._AuthenticationService.UpdateLoggedUserData(data).subscribe({
      next: (res) => {
        this.infoLoading.set(false);
        this._AuthenticationService.userInfo.update((u) => ({ ...u, name: res.user.name }));
        if (res.user.email) {
          localStorage.setItem('userEmail', res.user.email);
          this._AuthenticationService.userEmail.set(res.user.email);
        }
        this._ToastrService.success('Your account details were updated', 'Settings');
      },
      error: (err) => {
        this.infoLoading.set(false);
        this._ToastrService.error(err.error?.errors?.msg || err.error?.message || 'Could not update your data', 'Settings');
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordLoading.set(true);
    this._AuthenticationService.ChangeMyPassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.passwordLoading.set(false);
        // The API returns a new token after changing the password.
        this._AuthenticationService.saveToken(res.token);
        this.passwordForm.reset();
        this._ToastrService.success('Your password was changed successfully', 'Password');
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this._ToastrService.error(err.error?.errors?.msg || err.error?.message || 'Could not change your password', 'Password');
      },
    });
  }

  getAddresses() {
    this._AddressesService.GetLoggedUserAddresses().subscribe({
      next: (res) => this.addresses.set(res.data),
    });
  }

  addAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.addressLoading.set(true);
    this._AddressesService.AddAddress(this.addressForm.value).subscribe({
      next: (res) => {
        this.addressLoading.set(false);
        this.addresses.set(res.data);
        this.addressForm.reset();
        this.showAddressForm.set(false);
        this._ToastrService.success(res.message, 'Addresses');
      },
      error: (err) => {
        this.addressLoading.set(false);
        this._ToastrService.error(err.error?.message || 'Could not add the address', 'Addresses');
      },
    });
  }

  removeAddress(a_id: string) {
    this.removingAddress.set(a_id);
    this._AddressesService.RemoveAddress(a_id).subscribe({
      next: (res) => {
        this.removingAddress.set(null);
        this.addresses.set(res.data);
        this._ToastrService.info('Address removed', 'Addresses');
      },
      error: (err) => {
        this.removingAddress.set(null);
        this._ToastrService.error(err.error?.message || 'Could not remove the address', 'Addresses');
      },
    });
  }
}
