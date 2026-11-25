'use client';
import { useEffect, useRef, useState } from 'react';
import { postJson, useUser } from './UserProvider';
import type { Address } from '@/lib/account';

type Place = { id: string; main: string; secondary: string };

export function AddressForm({ onSaved, onCancel }: { onSaved: (list: Address[]) => void; onCancel?: () => void }) {
  const { user } = useUser();
  const [q, setQ] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [area, setArea] = useState('');
  const [type, setType] = useState('Home');
  const [details, setDetails] = useState({ road: '', house: '', floor: '', address: '' });
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+971/, '0') ?? '');
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2 || loc) { setPlaces([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/places?q=${encodeURIComponent(q.trim())}`);
        setPlaces((await r.json()).places ?? []);
      } catch { setPlaces([]); }
    }, 300);
  }, [q, loc]);

  async function pick(p: Place) {
    setError(''); setPlaces([]);
    try {
      const r = await fetch(`/api/places/details?id=${encodeURIComponent(p.id)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setLoc({ lat: d.lat, lng: d.lng });
      setArea([p.main, p.secondary].filter(Boolean).join('، '));
      setQ(p.main);
    } catch (e) { setError((e as Error).message || 'تعذّر تحديد الموقع'); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError('المتصفح لا يدعم تحديد الموقع'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLoc({ lat, lng });
        try {
          const r = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          const a = (await r.json()).address || 'موقعي الحالي';
          setArea(a); setQ(a);
        } catch { setArea('موقعي الحالي'); setQ('موقعي الحالي'); }
        setLocating(false);
      },
      () => { setLocating(false); setError('لم نتمكن من الوصول لموقعك، ابحث عن منطقتك بالاسم'); },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!loc) { setError('اختر منطقتك من القائمة أو استخدم موقعك الحالي'); return; }
    setBusy(true); setError('');
    try {
      const full = [details.address, area].filter(Boolean).join('، ');
      const r = await postJson<{ addresses: Address[] }>('/api/addresses', {
        address_type: type, address: full, latitude: loc.lat, longitude: loc.lng,
        contact_person_name: name, contact_person_number: phone,
        road: details.road, house: details.house, floor: details.floor,
      });
      onSaved(r.addresses);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <form className="addr-form" onSubmit={save}>
      <div className="field">
        <span>المنطقة</span>
        <div className="combo">
          <input value={q} onChange={(e) => { setQ(e.target.value); setLoc(null); setArea(''); }} placeholder="ابحث عن منطقتك، مثل: الشهامة، مدينة خليفة" aria-autocomplete="list" />
          {places.length > 0 && (
            <ul className="suggest" role="listbox">
              {places.map((p) => (
                <li key={p.id}><button type="button" onClick={() => pick(p)}><b>{p.main}</b><small>{p.secondary}</small></button></li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="link" onClick={useMyLocation} disabled={locating}>{locating ? 'جارٍ تحديد موقعك…' : 'استخدم موقعي الحالي'}</button>
        {loc && <span className="ok">✓ تم تحديد الموقع</span>}
      </div>
      <div className="grid2">
        <label className="field"><span>الشارع</span><input value={details.road} onChange={(e) => setDetails({ ...details, road: e.target.value })} /></label>
        <label className="field"><span>رقم الفيلا / المبنى</span><input value={details.house} onChange={(e) => setDetails({ ...details, house: e.target.value })} /></label>
        <label className="field"><span>الطابق / الشقة</span><input value={details.floor} onChange={(e) => setDetails({ ...details, floor: e.target.value })} /></label>
        <label className="field"><span>علامة مميزة (اختياري)</span><input value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} placeholder="بجانب مسجد…" /></label>
        <label className="field"><span>اسم المستلم</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="field"><span>جوال المستلم</span><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" dir="ltr" required /></label>
      </div>
      <div className="pills" role="radiogroup" aria-label="نوع العنوان">
        {[['Home', 'المنزل'], ['Workplace', 'العمل'], ['Other', 'آخر']].map(([v, l]) => (
          <button key={v} type="button" className="pill" aria-pressed={type === v} onClick={() => setType(v)}>{l}</button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button className="btn" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ العنوان'}</button>
        {onCancel && <button type="button" className="btn secondary" onClick={onCancel}>إلغاء</button>}
      </div>
    </form>
  );
}
