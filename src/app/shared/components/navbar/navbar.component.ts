import { afterNextRender, Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { FlowbiteService } from '../../../core/services/flowbite/flowbite.service';
import { AuthenticationService } from '../../../core/services/Auth/authentication.service';
import { CartService } from '../../../core/services/Cart/cart.service';
import { WishlistService } from '../../../core/services/Wishlist/wishlist.service';
import { CategoriesService } from '../../../core/services/Categories/categories.service';
import { ICategory } from '../../../core/models/Category/icategory.interface';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private _FlowbiteService = inject(FlowbiteService);
  private _AuthenticationService = inject(AuthenticationService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _CategoriesService = inject(CategoriesService);
  private _Router = inject(Router);
  private _Document = inject(DOCUMENT);

  isLogged = computed(() => this._AuthenticationService.isLoggin());
  userDetails = computed(() => this._AuthenticationService.userInfo());
  cartBadge = computed(() => this._CartService.count());
  wishlistBadge = computed(() => this._WishlistService.wishlistIds().length);
  categories = signal<ICategory[]>([]);

  constructor() {
    afterNextRender(() => this.initFlowbite());
    // Close the mobile menu after each navigation.
    this._Router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this._Document.getElementById('mobile-navbar-menu')?.classList.add('hidden'));
  }

  ngOnInit(): void {
    this._CategoriesService.GetAllCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });
  }

  private initFlowbite() {
    this._FlowbiteService.loadFlowbite((flowbite) => {
      flowbite.initFlowbite();
    });
  }

  search(term: string) {
    const keyword = term.trim();
    this._Router.navigate(['/shop'], { queryParams: keyword ? { keyword } : {} });
  }

  logOut() {
    this._AuthenticationService.logOut();
  }
}
