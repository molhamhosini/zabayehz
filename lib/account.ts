// Customer actions (login, addresses, checkout). Each function talks to the live API,
// or to a small in-memory stand-in when MOCK_API=1 so the flow can be tried offline (OTP code 1234).
import { backend, BackendError, getToken, MOCK } from './backend';
import { getConfig, getProductRaw } from './api';
import { bestDiscount, finalPrice } from './price';
import type { ApiConfig } from './types';

export type Address = {
  id: number;
  address_type: string;
  address: string;
  contact_person_name: string;
  contact_person_number: string;
  latitude: string;
  longitude: string;
  road?: string | null;
  house?: string | null;
  floor?: string | null;
};

export type Me = { id: number; f_name: string; l_name?: string | null; phone: string; email?: string | null };

// ---------- mock ----------
type MockDb = { otps: Map<string, string>; users: Map<string, Me>; tokens: Map<string, string>; addresses: Map<number, Address[]>; orders: number };
const g = globalThis as unknown as { __zjMock?: MockDb };
const db: MockDb = (g.__zjMock ??= { otps: new Map(), users: new Map(), tokens: new Map(), addresses: new Map(), orders: 100000 });

async function mockUser(): Promise<Me> {
  const t = await getToken();
  const phone = t ? db.tokens.get(t) : undefined;
  const u = phone ? db.users.get(phone) : undefined;
  if (!u) throw new BackendError(401, 'يرجى تسجيل الدخول أولًا');
  return u;
}

// ---------- auth ----------

/** Sends the SMS code. */
export async function sendOtp(phone: string): Promise<void> {
  if (MOCK) { db.otps.set(phone, '1234'); return; }
  await backend(`auth/check-phone?phone=${encodeURIComponent(phone)}`, { body: { phone } });
}

/** Returns a login token for existing customers, or a temporary token when the number is new. */
export async function verifyOtp(phone: string, code: string): Promise<{ token?: string; temporary?: boolean }> {
  if (MOCK) {
    if (db.otps.get(phone) !== code) throw new BackendError(400, 'رمز التحقق غير صحيح');
    if (!db.users.has(phone)) return { temporary: true };
    const token = `mock-${phone}-${Date.now()}`;
    db.tokens.set(token, phone);
    return { token };
  }
  const r = await backend<{ token?: string; temporary_token?: string }>('auth/verify-otp', { body: { phone, token: code } });
  if (r.token) return { token: r.token };
  if (r.temporary_token) return { temporary: true };
  throw new BackendError(400, 'تعذّر التحقق من الرمز');
}

export async function registerWithOtp(phone: string, name: string, email?: string): Promise<string> {
  if (MOCK) {
    if (db.otps.get(phone) !== '1234') throw new BackendError(400, 'أكمل التحقق من رقمك أولًا');
    db.users.set(phone, { id: db.users.size + 1, f_name: name, phone, email: email || null });
    const token = `mock-${phone}-${Date.now()}`;
    db.tokens.set(token, phone);
    return token;
  }
  const r = await backend<{ token?: string }>('auth/registration-with-otp', {
    body: { name, email: email || null, phone, referral_code: null },
  });
  if (!r.token) throw new BackendError(400, 'تعذّر إنشاء الحساب');
  return r.token;
}

export async function getMe(): Promise<Me> {
  if (MOCK) return mockUser();
  return backend<Me>('customer/info', { auth: true });
}

// ---------- addresses ----------

export async function listAddresses(): Promise<Address[]> {
  if (MOCK) return db.addresses.get((await mockUser()).id) ?? [];
  return backend<Address[]>('customer/address/list', { auth: true });
}

export type NewAddress = Omit<Address, 'id'>;

export async function addAddress(a: NewAddress): Promise<void> {
  if (MOCK) {
    const u = await mockUser();
    const list = db.addresses.get(u.id) ?? [];
    list.push({ ...a, id: Date.now() });
    db.addresses.set(u.id, list);
    return;
  }
  await backend('customer/address/add', { auth: true, body: a });
}

// ---------- maps (through the backend's own Google proxy) ----------

export async function placeSuggestions(q: string): Promise<{ id: string; main: string; secondary: string }[]> {
  if (MOCK) {
    return ['الشهامة الجديدة', 'مدينة خليفة', 'الخالدية', 'مدينة محمد بن زايد']
      .filter((n) => !q || n.includes(q) || q.length < 2)
      .map((n, i) => ({ id: `mock${i}`, main: n, secondary: 'أبوظبي' }));
  }
  type R = { suggestions?: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } }[] };
  const r = await backend<R>(`mapapi/place-api-autocomplete?search_text=${encodeURIComponent(q)}`);
  return (r.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      id: p.placeId,
      main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
      secondary: p.structuredFormat?.secondaryText?.text ?? '',
    }));
}

export async function placeLocation(id: string): Promise<{ lat: number; lng: number; address: string }> {
  if (MOCK) return { lat: 24.5516, lng: 54.6805, address: 'أبوظبي' };
  type R = { location?: { latitude: number; longitude: number }; formattedAddress?: string; result?: { geometry?: { location?: { lat: number; lng: number } }; formatted_address?: string } };
  const r = await backend<R>(`mapapi/place-api-details?placeid=${encodeURIComponent(id)}`);
  const lat = r.location?.latitude ?? r.result?.geometry?.location?.lat;
  const lng = r.location?.longitude ?? r.result?.geometry?.location?.lng;
  if (lat === undefined || lng === undefined) throw new BackendError(400, 'تعذّر تحديد هذا الموقع');
  return { lat, lng, address: r.formattedAddress ?? r.result?.formatted_address ?? '' };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (MOCK) return 'الشهامة الجديدة، أبوظبي';
  const r = await backend<{ results?: { formatted_address?: string }[] }>(`mapapi/geocode-api?lat=${lat}&lng=${lng}`);
  return r.results?.[0]?.formatted_address ?? '';
}

// ---------- checkout ----------

type Branch = { id: number; name: string; latitude?: string; longitude?: string; coverage?: number; status?: number };
type FeeSetup = {
  delivery_charge_type?: 'fixed' | 'distance' | 'area' | string;
  delivery_charge_per_kilometer?: number;
  minimum_delivery_charge?: number;
  minimum_distance_for_free_delivery?: number;
  fixed_delivery_charge?: number;
};
type FeeInfo = { id: number; delivery_charge_setup?: FeeSetup };
export type Slot = { id: number; start_time: string; end_time: string };

type FullConfig = ApiConfig & {
  branches?: Branch[];
  minimum_order_value?: number | string;
  cash_on_delivery?: string | boolean;
  digital_payment?: string | boolean;
  active_payment_method_list?: { gateway: string; gateway_title: string }[];
  free_delivery_over_amount?: number | string;
  free_delivery_over_amount_status?: number | string;
};

const truthy = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

export async function checkoutOptions() {
  const cfg = (await getConfig()) as FullConfig;
  const branch = (cfg.branches ?? []).find((b) => b.status !== 0) ?? cfg.branches?.[0] ?? null;
  const [slots, fees] = MOCK
    ? [
        [{ id: 11, start_time: '09:00:00', end_time: '12:00:00' }, { id: 14, start_time: '12:00:02', end_time: '15:00:02' }, { id: 15, start_time: '15:00:02', end_time: '18:00:00' }] as Slot[],
        [{ id: 1, delivery_charge_setup: { delivery_charge_type: 'distance', delivery_charge_per_kilometer: 0, minimum_delivery_charge: 0, fixed_delivery_charge: 100 } }] as FeeInfo[],
      ]
    : await Promise.all([backend<Slot[]>('timeSlot'), backend<FeeInfo[]>('config/delivery-fee')]);
  const fee = fees.find((f) => f.id === branch?.id)?.delivery_charge_setup ?? {};
  const payments: { id: string; label: string }[] = [];
  if (MOCK || truthy(cfg.cash_on_delivery)) payments.push({ id: 'cash_on_delivery', label: 'الدفع عند الاستلام' });
  if (MOCK || truthy(cfg.digital_payment)) {
    for (const m of cfg.active_payment_method_list ?? (MOCK ? [{ gateway: 'stripe', gateway_title: 'Pay Online' }] : [])) {
      payments.push({ id: m.gateway, label: m.gateway === 'stripe' ? 'الدفع بالبطاقة' : m.gateway_title });
    }
  }
  return {
    branch: branch ? { id: branch.id, lat: Number(branch.latitude), lng: Number(branch.longitude), coverage: Number(branch.coverage) || 0 } : null,
    fee,
    freeOver: truthy(cfg.free_delivery_over_amount_status) ? Number(cfg.free_delivery_over_amount) || 0 : 0,
    minOrder: Number(cfg.minimum_order_value) || 0,
    slots: slots.map((s) => ({ id: s.id, from: s.start_time.slice(0, 5), to: s.end_time.slice(0, 5) })),
    payments: MOCK ? payments.length ? payments : [] : payments,
  };
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Same rules as the app's CheckOutHelper.getDeliveryCharge (area pricing is not used by this store). */
export function deliveryCharge(fee: FeeSetup, distance: number, subtotal: number, freeOver: number): number {
  if (freeOver && subtotal >= freeOver) return 0;
  if (fee.delivery_charge_type === 'fixed') return Number(fee.fixed_delivery_charge) || 0;
  if (fee.delivery_charge_type === 'distance') {
    if (distance <= (Number(fee.minimum_distance_for_free_delivery) || 0)) return 0;
    const c = distance * (Number(fee.delivery_charge_per_kilometer) || 0);
    return Math.max(c, Number(fee.minimum_delivery_charge) || 0);
  }
  return 0;
}

export type OrderLineInput = {
  productId: number;
  qty: number;
  selections: Record<string, string>; // choice title -> chosen option
  multi: Record<string, string[]>; // multi-choice title -> chosen options
};

export type PlaceOrderInput = {
  lines: OrderLineInput[];
  addressId: number;
  date: string; // yyyy-mm-dd
  slotId: number;
  payment: string;
  note?: string;
  origin: string; // site origin, for the card-payment return address
};

/** Re-prices every line from the live product data, so the browser can't change prices. */
async function priceLines(lines: OrderLineInput[]) {
  const out = [];
  let subtotal = 0;
  for (const l of lines) {
    const p = await getProductRaw(l.productId);
    if (!p) throw new BackendError(400, 'أحد المنتجات في السلة لم يعد متوفرًا');
    const order = (p.choice_options ?? []).filter((c) => c.display_type !== 'multi_image');
    const parts = order.map((c) => l.selections[c.title.trim()]).filter(Boolean) as string[];
    const key = parts.map((s) => s.replace(/\s+/g, '')).join('-');
    const v = (p.variations ?? []).find((x) => x.type.replace(/\s+/g, '') === key);
    if ((p.variations ?? []).length && !v) throw new BackendError(400, `اختيارات «${p.name}» غير متوفرة، أعد اختيارها من صفحة المنتج`);
    const base = v ? v.price : p.price;
    const unit = finalPrice(base, bestDiscount(p, base));
    const qty = Math.max(1, Math.min(Number(l.qty) || 1, Number(p.maximum_order_quantity) || 99));
    subtotal += unit * qty;
    out.push({
      product_id: p.id,
      price: base,
      variant: '',
      variation: [{ type: v?.type ?? null }],
      // The mobile app sends the discounted unit price in this field; kept identical so the backend treats both the same.
      discount_amount: unit,
      quantity: qty,
      tax_amount: 0,
      multi_selections: l.multi ?? {},
      variation_selections: l.selections ?? {},
    });
  }
  return { cart: out, subtotal: Math.round(subtotal * 100) / 100 };
}

export async function placeOrder(input: PlaceOrderInput): Promise<{ orderId: string; redirect?: string }> {
  if (!input.lines.length) throw new BackendError(400, 'السلة فارغة');
  const [me, addresses, opts] = await Promise.all([getMe(), listAddresses(), checkoutOptions()]);
  const address = addresses.find((a) => a.id === input.addressId);
  if (!address) throw new BackendError(400, 'اختر عنوان التوصيل');
  if (!opts.slots.some((s) => s.id === input.slotId)) throw new BackendError(400, 'اختر وقت التوصيل');
  if (!opts.payments.some((p) => p.id === input.payment)) throw new BackendError(400, 'اختر طريقة الدفع');

  const { cart, subtotal } = await priceLines(input.lines);
  if (opts.minOrder && subtotal < opts.minOrder) throw new BackendError(400, `الحد الأدنى للطلب ${opts.minOrder} د.إ`);

  let distance = 0;
  if (opts.branch && Number.isFinite(opts.branch.lat)) {
    distance = Math.round(distanceKm(opts.branch, { lat: Number(address.latitude), lng: Number(address.longitude) }) * 100) / 100;
    if (opts.branch.coverage && distance > opts.branch.coverage) throw new BackendError(400, 'هذا العنوان خارج منطقة التوصيل');
  }
  const delivery = deliveryCharge(opts.fee, distance, subtotal, opts.freeOver);

  const body = {
    cart,
    coupon_discount_amount: 0,
    coupon_discount_title: '',
    coupon_code: null,
    order_amount: subtotal + delivery,
    order_type: 'delivery',
    branch_id: opts.branch?.id,
    delivery_address_id: address.id,
    time_slot_id: input.slotId,
    delivery_date: input.date,
    payment_method: input.payment,
    order_note: input.note?.slice(0, 500) ?? '',
    distance,
    selected_delivery_area: null,
    is_partial: '0',
    bring_change_amount: null,
    is_guest: '0',
    customer_id: String(me.id),
    payment_platform: 'web',
    call_back: `${input.origin}/order/result`,
  };

  if (MOCK) {
    db.orders += 1;
    return input.payment === 'cash_on_delivery'
      ? { orderId: String(db.orders) }
      : { orderId: String(db.orders), redirect: `${input.origin}/order/result?status=success&id=${db.orders}` };
  }

  const placed = await backend<{ order_id: number | string }>('customer/order/place', { auth: true, body });
  const orderId = String(placed.order_id);
  if (input.payment === 'cash_on_delivery') return { orderId };

  // Card payment: the order exists first, then the backend returns the gateway page to send the customer to.
  const pay = await backend<{ redirect_link?: string }>('customer/payment-mobile', { auth: true, body: { ...body, order_id: orderId } });
  if (!pay.redirect_link) throw new BackendError(400, 'تعذّر فتح صفحة الدفع، يمكنك اختيار الدفع عند الاستلام');
  return { orderId, redirect: pay.redirect_link };
}
