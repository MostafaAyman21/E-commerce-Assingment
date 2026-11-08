import { Component, computed, inject, signal } from '@angular/core';
import { OrdersService } from '../../core/services/Orders/orders.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { AddressesService } from '../../core/services/Addresses/addresses.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ICart } from '../../core/models/Cart/icart.interface';
import { IAddress } from '../../core/models/Address/iaddress.interface';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-payment',
  styleUrl: './payment.component.css',
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  private _OrdersService = inject(OrdersService);
  private _CartService = inject(CartService);
  private _AddressesService = inject(AddressesService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _ToastrService = inject(ToastrService);

  cartId = signal<string>('');
  cart = signal<ICart>({} as ICart);
  addresses = signal<IAddress[]>([]);
  selectedAddress = signal<string | null>(null);
  paymentMethod = signal<'cash' | 'online'>('cash');
  isLoading = signal<boolean>(false);
  saveAddress = signal<boolean>(false);

  items = computed(() => this.cart().data?.products ?? []);
  itemsCount = computed(() => this.items().reduce((sum, item) => sum + item.count, 0));

  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((param) => this.cartId.set(param.get('id')!));
    this._CartService.GetLoggedUserCart().subscribe({
      next: (res) => this.cart.set(res),
    });
    this._AddressesService.GetLoggedUserAddresses().subscribe({
      next: (res) => this.addresses.set(res.data),
    });
  }

  checkOut: FormGroup = new FormGroup({
    details: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    city: new FormControl(null, Validators.required),
    postalCode: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]),
  });

  /** Fills the form from a saved address (loaded by id from the API). */
  useAddress(a_id: string) {
    this.selectedAddress.set(a_id);
    this._AddressesService.GetSpecificAddress(a_id).subscribe({
      next: (res) => {
        const { details, phone, city } = res.data;
        this.checkOut.patchValue({ details, phone, city });
        this.saveAddress.set(false);
      },
    });
  }

  invalid(name: string) {
    const control = this.checkOut.get(name);
    return !!control && control.invalid && control.touched;
  }

  submitFormDetails() {
    if (this.checkOut.invalid) {
      this.checkOut.markAllAsTouched();
      return;
    }
    if (!this.items().length) {
      this._ToastrService.info('Your cart is empty', 'Checkout');
      return;
    }

    const shippingAddress = this.checkOut.value;
    const cartId = this.cart().cartId || this.cartId();

    if (this.saveAddress()) {
      const { details, phone, city } = shippingAddress;
      this._AddressesService.AddAddress({ name: city, details, phone, city }).subscribe();
    }

    this.isLoading.set(true);
    if (this.paymentMethod() == 'cash') {
      this._OrdersService.CreateCashOrderFromCart(cartId, shippingAddress).subscribe({
        next: () => {
          this._CartService.count.set(0);
          this._ToastrService.success('Your order was placed successfully', 'Order confirmed');
          this._Router.navigate([`/allorders`]);
        },
        error: (err) => this.fail(err),
      });
    } else if (this.paymentMethod() == 'online') {
      this._OrdersService.CheckoutSession(cartId, shippingAddress).subscribe({
        next: (res) => {
          this._ToastrService.info('Redirecting to the secure payment page...', 'Stripe');
          window.open(res.session.url, '_self');
        },
        error: (err) => this.fail(err),
      });
    }
  }

  private fail(err: any) {
    this.isLoading.set(false);
    this._ToastrService.error(err.error?.message || 'Could not place your order', 'Error');
  }
}
