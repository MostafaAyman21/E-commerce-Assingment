# FreshCart – E-commerce Assignment (Angular 22)

An e-commerce web app built with **Angular 22** (standalone components, signals, SSR) and **Tailwind CSS 4**, using the [Route E-commerce API](https://documenter.getpostman.com/view/5709532/2s93JqTRWN).

## Run

```bash
npm install
npm start                    # dev server: http://localhost:4200
npm run build                # production build (SSR + prerender) in dist/ecommerce
npm run serve:ssr:ecommerce  # run the built SSR server: http://localhost:4000
```

## Features

| Area | Pages / features |
| --- | --- |
| Authentication | Login, Register, Forgot / Reset Password (email → code → new password), Change Password, update account data, token verification, guards |
| Home | Hero slider, categories, featured products, brands carousel |
| Products | Shop page with search, category / brand / price filters, sorting and pagination · Product details with image gallery, quantity, reviews (add / edit / delete) and related products |
| Brands | Brands list (paginated) · Brand details with its products |
| Categories | Categories list · Category details with subcategories filter and products |
| Cart | Display, add, update quantity, remove item, clear cart, apply coupon |
| Wishlist | Display, add, remove, move to cart |
| Payment | Cash on delivery and online payment (Stripe checkout session), saved addresses |
| Orders | Order history with status, items, shipping address and totals |
| Settings | Account info, change password, addresses (add / list / delete) |

> Stripe test card: `4242 4242 4242 4242`, any future date, any CVC.

## Routes

`/home` · `/shop` · `/p-details/:id` · `/brands` · `/b-details/:id` · `/categories` · `/c-details/:id` · `/cart` · `/wishlist` · `/payment/:cartId` · `/allorders` · `/settings` · `/login` · `/register` · `/reset-password`

## API endpoints used

- **Auth:** signup, signin, forgotPasswords, verifyResetCode, resetPassword, verifyToken
- **Users:** changeMyPassword, updateMe
- **Products:** list (page, limit, sort, category, subcategory, brand, price range), get by id
- **Categories / SubCategories:** list, get by id, subcategories of a category, all subcategories, subcategory by id
- **Brands:** list, get by id
- **Reviews:** product reviews, create, update, delete
- **Cart (v2):** get, add, update count, remove item, clear, apply coupon
- **Wishlist:** get, add, remove
- **Addresses:** get all, get by id, add, remove
- **Orders:** cash order, checkout session, user orders

## Tech

Angular 22 · Angular SSR (Express) · Tailwind CSS 4 · Flowbite · ngx-toastr · ngx-owl-carousel-o · Swiper · ngx-cookie-service · jwt-decode · Font Awesome

## Structure

```
src/app
├── core
│   ├── guards        # auth (logged users) / logged (guests only)
│   ├── interceptors  # Header (token), Error (expired session)
│   ├── models        # interfaces for the API data
│   └── services      # one service per API resource
├── features          # one folder per page
└── shared            # navbar, footer, product card, 404, search pipe
```
