'use client';
// Account area: overview, orders, order details, profile and saved addresses.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address, OrderView } from '@/lib/account';
import { CONTACT, telHref } from '@/lib/site';
import { AddressForm } from './AddressForm';
import { useI18n } from './LangProvider';
import { LoginForm } from './LoginForm';
import { optionValue } from './CartView';
import { postJson, useUser } from './UserProvider';

const RUNNING = ['pending', 'confirmed', 'processing', 'out_for_delivery'];
const STEPS = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];

async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
  const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || (document.documentElement.lang === 'en' ? 'Something went wrong, please try again' : 'حدث خطأ، حاول مرة أخرى'));
  return d as T;
}

/** Shows the login form until the customer is signed in. */
function Gate({ title, back = true, children }: { title: string; back?: boolean; children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { t, href } = useI18n();
  useEffect(() => { document.title = `${title} | ${t.siteName}`; }, [title, t]);
  return (
    <div className="wrap narrow acc">
      {back && <nav className="crumbs" aria-label={t.breadcrumbs}><Link href={href('/account')}>{t.acc.back}</Link><span>/</span><span>{title}</span></nav>}
      <h1 className="page-title" style={{ marginTop: back ? 0 : 24 }}>{user || loading ? title : t.signIn}</h1>
      {loading ? <div className="panel">{t.loading}</div> : user ? children : <div className="panel"><LoginForm /></div>}
    </div>
  );
}

function useDate() {
  const { t } = useI18n();
  return useMemo(() => {
    const f = new Intl.DateTimeFormat(t.dateLocale, { day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' });
    return (s?: string | null) => {
      if (!s) return '';
      const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
      return Number.isNaN(d.getTime()) ? s : f.format(d);
    };
  }, [t]);
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const tone = RUNNING.includes(status) ? 'run' : status === 'delivered' ? 'ok' : 'off';
  return <span className={`status ${tone}`}>{t.acc.status[status] ?? status}</span>;
}

// ---------- overview ----------

export function AccountHome() {
  const { t } = useI18n();
  return <Gate title={t.acc.title} back={false}><AccountOverview /></Gate>;
}

function AccountOverview() {
  const { t, href } = useI18n();
  const { user, logout } = useUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  useEffect(() => {
    // The footer already knows which policy pages exist; reuse its links.
    setPages(Array.from(document.querySelectorAll<HTMLAnchorElement>('footer a[href*="/info/"]')).map((a) => a.getAttribute('href')!.split('/info/')[1]));
  }, []);

  async function remove() {
    if (!window.confirm(t.acc.deleteConfirm)) return;
    setBusy(true); setError('');
    try {
      await send('/api/me', 'DELETE');
      await logout();
      window.alert(t.acc.deleted);
      router.replace(href('/'));
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  if (!user) return null;
  return (
    <>
      <div className="panel acc-head">
        <div className="avatar" aria-hidden>{user.name.trim().charAt(0) || '؟'}</div>
        <div><b>{user.name}</b><div className="hint num">{user.phone}</div></div>
      </div>
      <div className="acc-tiles">
        <Link href={href('/account/orders')} className="tile-link"><b>{t.acc.orders}</b><span>{t.acc.ordersHint}</span></Link>
        <Link href={href('/account/profile')} className="tile-link"><b>{t.acc.profile}</b><span>{t.acc.profileHint}</span></Link>
        <Link href={href('/account/addresses')} className="tile-link"><b>{t.acc.addresses}</b><span>{t.acc.addressesHint}</span></Link>
      </div>
      {pages.length > 0 && (
        <section className="panel" style={{ marginTop: 14 }}>
          <h2>{t.acc.help}</h2>
          <ul className="link-list">
            {pages.map((p) => <li key={p}><Link href={href(`/info/${p}`)}>{t.pages[p]}</Link></li>)}
            <li><a href={telHref(CONTACT.phones[0])}>{t.contactUs}: <span className="num">{CONTACT.phones[0]}</span></a></li>
          </ul>
        </section>
      )}
      <div className="acc-actions">
        <button className="btn secondary" onClick={logout}>{t.logout}</button>
        <button className="link danger" onClick={remove} disabled={busy}>{busy ? t.acc.deleting : t.acc.deleteAccount}</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </>
  );
}

// ---------- orders ----------

export function OrdersList() {
  const { t, href, price } = useI18n();
  const { user } = useUser();
  const date = useDate();
  const [orders, setOrders] = useState<OrderView[] | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'running' | 'history'>('running');

  useEffect(() => {
    if (!user) return;
    send<{ orders: OrderView[] }>('/api/orders', 'GET').then((d) => {
      setOrders(d.orders);
      if (!d.orders.some((o) => RUNNING.includes(o.status)) && d.orders.length) setTab('history');
    }).catch((e) => setError((e as Error).message));
  }, [user]);

  const shown = (orders ?? []).filter((o) => (tab === 'running') === RUNNING.includes(o.status));
  return (
    <Gate title={t.acc.orders}>
      <div className="pills" role="tablist" style={{ marginBottom: 12 }}>
        {(['running', 'history'] as const).map((k) => (
          <button key={k} type="button" role="tab" className="pill" aria-pressed={tab === k} aria-selected={tab === k} onClick={() => setTab(k)}>{t.acc[k]}</button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {!orders && !error && <div className="panel">{t.loading}</div>}
      {orders && shown.length === 0 && <div className="empty"><b>{t.acc.noOrders}</b><Link href={href('/')} style={{ color: 'var(--brand)', fontWeight: 600 }}>{t.browse}</Link></div>}
      <div className="order-list">
        {shown.map((o) => (
          <Link key={o.id} href={href(`/account/orders/${o.id}`)} className="order-card">
            <div className="row1"><b>{t.acc.order(o.id)}</b><StatusBadge status={o.status} /></div>
            <div className="row2">
              <span>{date(o.createdAt)}{o.itemCount ? ` · ${t.acc.items(o.itemCount)}` : ''}</span>
              <b className="amt">{price(o.amount)}</b>
            </div>
          </Link>
        ))}
      </div>
    </Gate>
  );
}

export function OrderDetails({ id }: { id: number }) {
  const { t, price, opt } = useI18n();
  const { user } = useUser();
  const date = useDate();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    send<{ order: OrderView }>(`/api/orders/${id}`, 'GET').then((d) => setOrder(d.order)).catch((e) => setError((e as Error).message));
  }, [id]);
  useEffect(() => { if (user) load(); }, [user, load]);

  async function cancel() {
    if (!window.confirm(t.acc.cancelConfirm)) return;
    setBusy(true); setError('');
    try { setOrder((await postJson<{ order: OrderView }>(`/api/orders/${id}/cancel`, {})).order); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const step = order ? STEPS.indexOf(order.status) : -1;
  const subtotal = order?.items?.reduce((s, i) => s + i.unitPrice * i.qty, 0) ?? 0;
  return (
    <Gate title={t.acc.order(id)}>
      {error && <p className="error" role="alert">{error}</p>}
      {!order && !error && <div className="panel">{t.loading}</div>}
      {order && (
        <div className="order-detail">
          <section className="panel">
            <div className="row1"><span className="hint">{t.acc.placedOn} {date(order.createdAt)}</span><StatusBadge status={order.status} /></div>
            {step >= 0 && (
              <ol className="track" aria-label={t.acc.status[order.status]}>
                {STEPS.map((s, i) => <li key={s} className={i <= step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>{t.acc.status[s]}</li>)}
              </ol>
            )}
            {order.deliveryDate && (
              <p style={{ margin: '12px 0 0' }}>
                {t.acc.deliveryOn}: <b>{date(order.deliveryDate)}</b>
                {order.slot && <span className="num"> · {order.slot.from.slice(0, 5)}–{order.slot.to.slice(0, 5)}</span>}
              </p>
            )}
          </section>

          {order.items && order.items.length > 0 && (
            <section className="panel">
              <h2>{t.acc.details}</h2>
              <ul className="sum-lines">
                {order.items.map((i, k) => (
                  <li key={k}>
                    <span>
                      <span dir="auto">{i.name}</span> <small className="amt">× {i.qty}</small>
                      {i.options.length > 0 && <><br /><small className="hint">{i.options.map((o) => optionValue(o, opt, t.listSep)).join(' · ')}</small></>}
                    </span>
                    <span className="amt">{price(i.unitPrice * i.qty)}</span>
                  </li>
                ))}
              </ul>
              {subtotal > 0 && <div className="sum-row"><span>{t.subtotal}</span><span className="amt">{price(subtotal)}</span></div>}
              <div className="sum-row"><span>{t.delivery}</span><span className="amt">{order.delivery ? price(order.delivery) : t.free}</span></div>
              <div className="sum-row total"><span>{t.total}</span><span className="amt">{price(order.amount)}</span></div>
            </section>
          )}

          <section className="panel kv">
            <div><span>{t.acc.payment}</span><b>{t.acc.payMethods[order.payment] ?? order.payment} · {order.paymentStatus === 'paid' ? t.acc.paid : t.acc.unpaid}</b></div>
            {order.address && <div><span>{t.acc.deliverTo}</span><b dir="auto">{order.address.text}<br /><small className="hint">{order.address.name} · <span className="num">{order.address.phone}</span></small></b></div>}
            {order.note && <div><span>{t.acc.note}</span><b dir="auto">{order.note}</b></div>}
          </section>

          {order.status === 'pending' ? (
            <div>
              <button className="btn secondary danger" onClick={cancel} disabled={busy}>{busy ? t.acc.cancelling : t.acc.cancelOrder}</button>
              <p className="hint">{t.acc.cancelHint}</p>
            </div>
          ) : (
            <p className="hint">{t.acc.reorderHelp} <a className="num" href={telHref(CONTACT.phones[0])}>{CONTACT.phones[0]}</a></p>
          )}
        </div>
      )}
    </Gate>
  );
}

// ---------- profile ----------

export function ProfileForm() {
  const { t } = useI18n();
  const { user, refresh } = useUser();
  const [f, setF] = useState({ fName: '', lName: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (user) setF({ fName: user.fName ?? user.name, lName: user.lName ?? '', email: user.email ?? '' }); }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setMsg('');
    try { await send('/api/me', 'PUT', f); await refresh(); setMsg(t.acc.saved); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <Gate title={t.acc.profile}>
      <form className="panel addr-form" onSubmit={save}>
        <div className="grid2">
          <label className="field"><span>{t.acc.firstName}</span><input value={f.fName} onChange={(e) => setF({ ...f, fName: e.target.value })} autoComplete="given-name" required /></label>
          <label className="field"><span>{t.acc.lastName}</span><input value={f.lName} onChange={(e) => setF({ ...f, lName: e.target.value })} autoComplete="family-name" /></label>
          <label className="field"><span>{t.acc.email}</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" dir="ltr" /></label>
          <label className="field"><span>{t.acc.phoneLocked}</span><input value={user?.phone ?? ''} readOnly disabled dir="ltr" /></label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button className="btn" disabled={busy}>{busy ? t.saving : t.acc.saveChanges}</button>
          {msg && <span className="ok" role="status">{msg}</span>}
        </div>
      </form>
    </Gate>
  );
}

// ---------- addresses ----------

export function AddressBook() {
  const { t } = useI18n();
  const { user } = useUser();
  const [list, setList] = useState<Address[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    send<{ addresses: Address[] }>('/api/addresses', 'GET').then((d) => setList(d.addresses)).catch((e) => setError((e as Error).message));
  }, [user]);

  async function remove(id: number) {
    if (!window.confirm(t.acc.deleteAddressConfirm)) return;
    setError('');
    try { setList((await send<{ addresses: Address[] }>(`/api/addresses?id=${id}`, 'DELETE')).addresses); }
    catch (e) { setError((e as Error).message); }
  }

  return (
    <Gate title={t.acc.addresses}>
      {error && <p className="error" role="alert">{error}</p>}
      {!list && !error && <div className="panel">{t.loading}</div>}
      {list && (
        <div className="addr-list">
          {list.length === 0 && !adding && <div className="empty"><b>{t.acc.noAddresses}</b></div>}
          {list.map((a) => (
            <div key={a.id} className="addr static">
              <b>{t.addrTypes[a.address_type] ?? t.addrTypes.Home}</b>
              <span dir="auto">{[a.house && t.villa(a.house), a.floor && t.floor(a.floor), a.road, a.address].filter(Boolean).join(t.listSep)}</span>
              <small>{a.contact_person_name} · <span className="num">{a.contact_person_number}</span></small>
              <button type="button" className="link danger" onClick={() => remove(a.id)}>{t.acc.deleteAddress}</button>
            </div>
          ))}
          {adding ? (
            <div className="panel"><AddressForm onCancel={() => setAdding(false)} onSaved={(l) => { setList(l); setAdding(false); }} /></div>
          ) : (
            <button type="button" className="link" onClick={() => setAdding(true)}>{t.addAddress}</button>
          )}
        </div>
      )}
    </Gate>
  );
}
