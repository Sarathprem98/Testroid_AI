import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type ApiRequestOptions, type ApiResponse, type HttpMethod } from './BaseApiClient';
import type {
  DemoblazeCartMutationResponse,
  DemoblazeCategoryResponse,
  DemoblazeCheckResponse,
  DemoblazeEntriesResponse,
  DemoblazeLoginResponse,
  DemoblazeProduct,
  DemoblazeSignupResponse,
  DemoblazeViewCartResponse,
} from '../types/demoblazeApiTypes';

export class DemoblazeApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async signup(username: string, password: string): Promise<ApiResponse<DemoblazeSignupResponse>> {
    return this.post<DemoblazeSignupResponse>('/signup', { username, password });
  }

  async login(username: string, password: string): Promise<ApiResponse<DemoblazeLoginResponse>> {
    return this.post<DemoblazeLoginResponse>('/login', { username, password });
  }

  // Validates a session token (the site's own /check call on page load).
  async checkToken(token: string): Promise<ApiResponse<DemoblazeCheckResponse>> {
    return this.post<DemoblazeCheckResponse>('/check', { token });
  }

  // GET, not POST — api.demoblaze.com returns 405 for a POST here.
  async getEntries(): Promise<ApiResponse<DemoblazeEntriesResponse>> {
    return this.get<DemoblazeEntriesResponse>('/entries');
  }

  // Response is { Items: [...] }, not a bare array — confirmed live; the category
  // value is also not the UI's display name (e.g. 'phone'/'notebook'/'monitor',
  // not 'Phones'/'Laptops'/'Monitors').
  async getProductsByCategory(category: string): Promise<ApiResponse<DemoblazeCategoryResponse>> {
    return this.post<DemoblazeCategoryResponse>('/bycat', { cat: category });
  }

  // The endpoint is /view, not /prodbyid — the latter 404s. Confirmed against
  // the site's own js/prod.js and js/cart.js, which both call POST /view.
  async getProductById(id: number | string): Promise<ApiResponse<DemoblazeProduct>> {
    return this.post<DemoblazeProduct>('/view', { id });
  }

  // `cartItemId` mirrors the site's client-generated guid() — any unique string
  // works, it's just the cart line-item id, not a product id. `loggedIn` maps to
  // the site's `flag` (true when using a token-bearing session, false for anonymous
  // cookie-based carts) — omitting it caused every real addtocart call to 4xx.
  async addToCart(params: { cartItemId: string; cookie: string; productId: number | string; loggedIn: boolean }): Promise<ApiResponse<DemoblazeCartMutationResponse>> {
    const { cartItemId, cookie, productId, loggedIn } = params;
    return this.post<DemoblazeCartMutationResponse>('/addtocart', { id: cartItemId, cookie, prod_id: productId, flag: loggedIn });
  }

  async viewCart(cookie: string, loggedIn: boolean): Promise<ApiResponse<DemoblazeViewCartResponse>> {
    return this.post<DemoblazeViewCartResponse>('/viewcart', { cookie, flag: loggedIn });
  }

  // Deletes a single cart line item (by the id passed to addToCart) — /delcart
  // does not exist; the real endpoint is /deleteitem.
  async deleteCartItem(cartItemId: string): Promise<ApiResponse<DemoblazeCartMutationResponse>> {
    return this.post<DemoblazeCartMutationResponse>('/deleteitem', { id: cartItemId });
  }

  // Clears an entire cart by cookie/session — distinct endpoint from deleteCartItem.
  async clearCart(cookie: string): Promise<ApiResponse<DemoblazeCartMutationResponse>> {
    return this.post<DemoblazeCartMutationResponse>('/deletecart', { cookie });
  }

  // Generic passthrough for negative testing (wrong verb, unknown path, malformed body) that the
  // domain methods above can't express — each of them only ever issues its own endpoint's correct
  // verb/shape by design.
  async sendRaw<T = unknown>(method: HttpMethod, path: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.send<T>(method, path, { ...options, data });
  }
}
