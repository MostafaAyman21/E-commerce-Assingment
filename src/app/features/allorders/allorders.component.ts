import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/Orders/orders.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { IOrder } from '../../core/models/Order/iorder.interface';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-allorders',
  styleUrl: './allorders.component.css',
  templateUrl: './allorders.component.html',
})
export class AllordersComponent {
  private _OrdersService = inject(OrdersService);
  private _CartService = inject(CartService);
  private _AuthenticationService = inject(AuthenticationService);

  orders = signal<IOrder[]>([]);
  isLoading = signal<boolean>(true);
  expanded = signal<string[]>([]);

  totalSpent = computed(() => this.orders().reduce((sum, o) => sum + o.totalOrderPrice, 0));
  paidCount = computed(() => this.orders().filter((o) => o.isPaid).length);
  deliveredCount = computed(() => this.orders().filter((o) => o.isDelivered).length);

  ngOnInit() {
    // Coming back from Stripe the cart was emptied on the server: refresh the badge.
    this._CartService.getCount();

    // The user id comes from verifying the token with the API.
    this._AuthenticationService.VerifyToken().subscribe({
      next: (res) => this.getOrders(res.decoded.id),
      error: () => this.isLoading.set(false),
    });
  }

  getOrders(userId: string) {
    this._OrdersService.GetUserOrders(userId).subscribe({
      next: (res: IOrder[]) => {
        const sorted = [...res].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        this.orders.set(sorted);
        if (sorted.length) this.expanded.set([sorted[0]._id]);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggle(o_id: string) {
    this.expanded.update((ids) => (ids.includes(o_id) ? ids.filter((id) => id !== o_id) : [...ids, o_id]));
  }

  itemsCount(order: IOrder) {
    return order.cartItems.reduce((sum, item) => sum + item.count, 0);
  }
}
