import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth-guard';
import { loggedGuard } from './core/guards/logged/logged-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Fresh-Cart | Main Page',
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent),
    title: 'Fresh-Cart | Shop',
  },
  { path: 'products', redirectTo: 'shop' },
  {
    path: 'brands',
    loadComponent: () =>
      import('./features/brands/brands.component').then((m) => m.BrandsComponent),
    title: 'Fresh-Cart | Brands',
  },
  {
    path: 'b-details/:id',
    loadComponent: () =>
      import('./features/b-details/b-details.component').then((m) => m.BDetailsComponent),
    title: 'Fresh-Cart | Brand Details',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
    title: 'Fresh-Cart | Categories',
  },
  {
    path: 'c-details/:id',
    loadComponent: () =>
      import('./features/c-details/c-details.component').then((m) => m.CDetailsComponent),
    title: 'Fresh-Cart | Category Details',
  },
  {
    path: 'p-details/:id',
    loadComponent: () =>
      import('./features/p-details/p-details.component').then((m) => m.PDetailsComponent),
    title: 'Fresh-Cart | Product Details',
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
    title: 'Fresh-Cart | Cart',
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then((m) => m.WishlistComponent),
    title: 'Fresh-Cart | Wishlist',
  },
  {
    path: 'payment/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/payment/payment.component').then((m) => m.PaymentComponent),
    title: 'Fresh-Cart | Payment',
  },
  {
    path: 'allorders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/allorders/allorders.component').then((m) => m.AllordersComponent),
    title: 'Fresh-Cart | All orders',
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
    title: 'Fresh-Cart | Settings',
  },
  {
    path: 'login',
    canActivate: [loggedGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
    title: 'Fresh-Cart | Login',
  },
  {
    path: 'register',
    canActivate: [loggedGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
    title: 'Fresh-Cart | Register',
  },
  {
    path: 'reset-password',
    canActivate: [loggedGuard],
    loadComponent: () =>
      import('./features/reset-paswword/reset-paswword.component').then(
        (m) => m.ResetPaswwordComponent,
      ),
    title: 'Fresh-Cart | Reset Password',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/wildcard/wildcard.component').then((m) => m.WildcardComponent),
    title: 'Error 404',
  },
];
