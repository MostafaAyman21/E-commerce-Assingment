import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Details pages are rendered on the server per request.
  { path: 'p-details/:id', renderMode: RenderMode.Server },
  { path: 'c-details/:id', renderMode: RenderMode.Server },
  { path: 'b-details/:id', renderMode: RenderMode.Server },

  // Pages that depend on the logged user (cookie) or on query params render in the browser.
  { path: 'shop', renderMode: RenderMode.Client },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'wishlist', renderMode: RenderMode.Client },
  { path: 'payment/:id', renderMode: RenderMode.Client },
  { path: 'allorders', renderMode: RenderMode.Client },
  { path: 'settings', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'reset-password', renderMode: RenderMode.Client },

  // Home, brands, categories... are prerendered at build time.
  { path: '**', renderMode: RenderMode.Prerender },
];
