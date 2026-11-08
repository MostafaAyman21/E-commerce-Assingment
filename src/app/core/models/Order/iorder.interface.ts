import { IProduct } from '../Product/iproduct.interface';

export interface IOrder {
  shippingAddress?: ShippingAddress
  taxPrice: number
  shippingPrice: number
  totalOrderPrice: number
  paymentMethodType: 'cash' | 'card'
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  _id: string
  user: User
  cartItems: CartItem[]
  createdAt: string
  updatedAt: string
  id: number
}

export interface ShippingAddress {
  details: string
  phone: string
  city: string
  postalCode?: string
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
}

export interface CartItem {
  count: number
  _id: string
  product: IProduct
  price: number
}
