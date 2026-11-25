'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AddressForm } from './AddressForm';
import { useCart } from './CartProvider';
import { LoginForm } from './LoginForm';
import { postJson, useUser } from './UserProvider';
import { formatPrice } from '@/lib/price';
import type { Address } from '@/lib/account';

type Options = {
  branch: { id: number; lat: number; lng: number; coverage: number } | null;
  fee: { delivery_charge_type?: string; delivery_charge_per_kilometer?: number; minimum_delivery_charge?: number; minimum_distance_for_free_delivery?: number; fixed_delivery_charge?: number };
  freeOver: number;
  minOrder: number;
  slots: { id: number; from: string; to: string }[];
  payments: { id: string; label: string }[];
};

const DAY = new Intl.DateTimeFormat('ar-AE', { weekday: 'long' });
const DATE = new Intl.DateTimeFormat('ar-AE', { day: 'numeric', month: 'long', numberingSystem: 'latn' });
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  const s = h < 12 ? 'ص' : 'م';
  const hh = h % 12 || 12;
  return `${hh}${m ? `:${String(m).padStart(2, '0')}` : ''} ${s}`;
}

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function Checkout() {
  const router = useRouter();
  const { lines, total, ready, clear } = useCart();
  const { user, loading } = useUser();
  const [opts, setOpts] = useState<Options | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressId, setAddressId] = useState<number | null>(null);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  const [day, setDay] = useState(0);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [payment, setPayment] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/checkout').then((r) => r.json()).then((o: Options) => {
      setOpts(o);
      setPayment((p) => p ?? o.payments?.[0]?.id ?? null);
    }).catch(() => setError('تعذّر تحميل خيارات التوصيل'));
  }, []);

  useEffect(() => {
    if (!user) { setAddresses(null); return; }
    fetch('/api/addresses').then((r) => r.json()).then((d) => {
      const list: Address[] = d.addresses ?? [];
      setAddresses(list);
      setAddressId((cur) => cur ?? list[list.length - 1]?.id ?? null);
      setAddingAddress(list.length === 0);
    }).catch(() => setAddresses([]));
  }, [user]);

  // Today's slots that have already started are hidden.
  const slots = useMemo(() => {
    if (!opts) return [];
    if (day !== 0) return opts.slots;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return opts.slots.filter((s) => { const [h, m] = s.from.split(':').map(Number); return h * 60 + m > mins; });
  }, [opts, day]);
  useEffect(() => { if (slotId && !slots.some((s) => s.id === slotId)) setSlotId(null); }, [slots, slotId]);
  useEffect(() => { if (opts && day === 0 && slots.length === 0) setDay(1); }, [opts, day, slots.length]);

  const address = addresses?.find((a) => a.id === addressId) ?? null;
  const distance = address && opts?.branch ? km(opts.branch, { lat: Number(address.latitude), lng: Number(address.longitude) }) : 0;
  const outOfZone = !!(address && opts?.branch?.coverage && distance > opts.branch.coverage);
  const delivery = useMemo(() => {
    if (!opts) return 0;
    const f = opts.fee;
    if (opts.freeOver && total >= opts.freeOver) return 0;
    if (f.delivery_charge_type === 'fixed') return Number(f.fixed_delivery_charge) || 0;
    if (f.delivery_charge_type === 'distance') {
      if (distance <= (Number(f.minimum_distance_for_free_delivery) || 0)) return 0;
      return Math.max(distance * (Number(f.delivery_charge_per_kilometer) || 0), Number(f.minimum_delivery_charge) || 0);
    }
    return 0;
  }, [opts, distance, total]);
  const belowMin = !!(opts?.minOrder && total < opts.minOrder);

  async function submit() {
    setError('');
    if (!address) return setError('اختر عنوان التوصيل');
    if (!slotId) return setError('اختر وقت التوصيل');
    if (!payment) return setError('اختر طريقة الدفع');
    setBusy(true);
    try {
      const r = await postJson<{ orderId: string; redirect?: string }>('/api/orders', {
        lines: lines.map((l) => ({ productId: l.productId, qty: l.qty, selections: l.selections, multi: l.multi })),
        addressId: address.id, date: ymd(days[day]), slotId, payment, note,
      });
      if (r.redirect) {
        window.location.href = r.redirect;
        return;
      }
      clear();
      router.replace(`/order/result?status=success&id=${encodeURIComponent(r.orderId)}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!ready || loading) return <div className="panel">جارٍ التحميل…</div>;
  if (!lines.length) return <div className="empty"><b>سلتك فارغة</b><Link href="/" style={{ color: 'var(--brand)', fontWeight: 600 }}>تصفّح الذبائح</Link></div>;

  return (
    <div className="checkout">
      <div className="steps">
        <section className="panel">
          <h2><span className="n">1</span> رقم الجوال</h2>
          {user ? (
            <p className="done">✓ {user.name} · <span className="num">{user.phone}</span></p>
          ) : (
            <LoginForm />
          )}
        </section>

        <section className={`panel${user ? '' : ' locked'}`} aria-disabled={!user}>
          <h2><span className="n">2</span> عنوان التوصيل</h2>
          {user && addresses && (
            <>
              {addresses.length > 0 && !addingAddress && (
                <div className="addr-list" role="radiogroup">
                  {addresses.map((a) => (
                    <button key={a.id} type="button" className="addr" aria-pressed={a.id === addressId} onClick={() => setAddressId(a.id)}>
                      <b>{a.address_type === 'Workplace' ? 'العمل' : a.address_type === 'Other' ? 'آخر' : 'المنزل'}</b>
                      <span>{[a.house && `فيلا/مبنى ${a.house}`, a.floor && `طابق ${a.floor}`, a.road, a.address].filter(Boolean).join('، ')}</span>
                      <small>{a.contact_person_name} · <span className="num">{a.contact_person_number}</span></small>
                    </button>
                  ))}
                  <button type="button" className="link" onClick={() => setAddingAddress(true)}>+ إضافة عنوان جديد</button>
                </div>
              )}
              {addingAddress && (
                <AddressForm
                  onCancel={addresses.length ? () => setAddingAddress(false) : undefined}
                  onSaved={(list) => { setAddresses(list); setAddressId(list[list.length - 1]?.id ?? null); setAddingAddress(false); }}
                />
              )}
              {outOfZone && <p className="error">هذا العنوان خارج منطقة التوصيل حاليًا.</p>}
            </>
          )}
        </section>

        <section className={`panel${user ? '' : ' locked'}`}>
          <h2><span className="n">3</span> موعد التوصيل</h2>
          {user && opts && (
            <>
              <div className="days">
                {days.map((d, i) => (
                  <button key={i} type="button" className="day" aria-pressed={i === day} onClick={() => setDay(i)}>
                    <b>{i === 0 ? 'اليوم' : i === 1 ? 'غدًا' : DAY.format(d)}</b>
                    <small>{DATE.format(d)}</small>
                  </button>
                ))}
              </div>
              <div className="pills" style={{ marginTop: 12 }}>
                {slots.map((s) => (
                  <button key={s.id} type="button" className="pill" aria-pressed={s.id === slotId} onClick={() => setSlotId(s.id)}>
                    من {to12h(s.from)} إلى {to12h(s.to)}
                  </button>
                ))}
                {slots.length === 0 && <p className="hint">لا توجد أوقات متاحة في هذا اليوم.</p>}
              </div>
            </>
          )}
        </section>

        <section className={`panel${user ? '' : ' locked'}`}>
          <h2><span className="n">4</span> طريقة الدفع</h2>
          {user && opts && (
            <>
              <div className="pills">
                {opts.payments.map((p) => (
                  <button key={p.id} type="button" className="pill" aria-pressed={p.id === payment} onClick={() => setPayment(p.id)}>{p.label}</button>
                ))}
              </div>
              <label className="field" style={{ marginTop: 14 }}>
                <span>ملاحظات للطلب (اختياري)</span>
                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="مثل: الاتصال قبل الوصول" />
              </label>
            </>
          )}
        </section>
      </div>

      <aside className="panel summary">
        <h2>ملخص الطلب</h2>
        <ul className="sum-lines">
          {lines.map((l) => (
            <li key={l.key}>
              <span>{l.name} <small className="amt">× {l.qty}</small><br /><small className="hint">{l.options.slice(0, 2).map((o) => o.value).join(' · ')}</small></span>
              <span className="amt">{formatPrice(l.unitPrice * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="sum-row"><span>المجموع</span><span className="amt">{formatPrice(total)}</span></div>
        <div className="sum-row"><span>التوصيل</span><span className="amt">{address ? (delivery ? formatPrice(delivery) : 'مجاني') : '—'}</span></div>
        <div className="sum-row total"><span>الإجمالي</span><span className="amt">{formatPrice(total + delivery)}</span></div>
        {belowMin && <p className="error">الحد الأدنى للطلب {formatPrice(opts!.minOrder)}.</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" onClick={submit} disabled={!user || busy || belowMin || outOfZone || !address || !slotId || !payment}>
          {busy ? 'جارٍ إرسال الطلب…' : payment && payment !== 'cash_on_delivery' ? 'متابعة للدفع' : 'تأكيد الطلب'}
        </button>
        <p className="hint" style={{ textAlign: 'center' }}>الأسعار تُراجع من النظام عند التأكيد.</p>
      </aside>
    </div>
  );
}
