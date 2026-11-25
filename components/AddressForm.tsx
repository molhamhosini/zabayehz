'use client';
import { useEffect, useRef, useState } from 'react';
import { postJson, useUser } from './UserProvider';
import { useI18n } from './LangProvider';
import type { Address } from '@/lib/account';

type Place = { id: string; main: string; secondary: string };

export function AddressForm({ onSaved, onCancel }: { onSaved: (list: Address[]) => void; onCancel?: () => void }) {
  const { user } = useUser();
  const { t } = useI18n();
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
    } catch (e) { setError((e as Error).message || t.placeFailed); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError(t.noGeo); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLoc({ lat, lng });
        try {
          const r = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          const a = (await r.json()).address || t.myLocation;
          setArea(a); setQ(a);
        } catch { setArea(t.myLocation); setQ(t.myLocation); }
        setLocating(false);
      },
      () => { setLocating(false); setError(t.geoFailed); },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!loc) { setError(t.pickArea); return; }
    setBusy(true); setError('');
    try {
      const full = [details.address, area].filter(Boolean).join(t.listSep);
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
        <span>{t.area}</span>
        <div className="combo">
          <input value={q} onChange={(e) => { setQ(e.target.value); setLoc(null); setArea(''); }} placeholder={t.areaPh} aria-autocomplete="list" />
          {places.length > 0 && (
            <ul className="suggest" role="listbox">
              {places.map((p) => (
                <li key={p.id}><button type="button" onClick={() => pick(p)}><b>{p.main}</b><small>{p.secondary}</small></button></li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="link" onClick={useMyLocation} disabled={locating}>{locating ? t.locating : t.useLocation}</button>
        {loc && <span className="ok">{t.located}</span>}
      </div>
      <div className="grid2">
        <label className="field"><span>{t.street}</span><input value={details.road} onChange={(e) => setDetails({ ...details, road: e.target.value })} /></label>
        <label className="field"><span>{t.house}</span><input value={details.house} onChange={(e) => setDetails({ ...details, house: e.target.value })} /></label>
        <label className="field"><span>{t.floorApt}</span><input value={details.floor} onChange={(e) => setDetails({ ...details, floor: e.target.value })} /></label>
        <label className="field"><span>{t.landmark}</span><input value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} placeholder={t.landmarkPh} /></label>
        <label className="field"><span>{t.recipient}</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="field"><span>{t.recipientPhone}</span><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" dir="ltr" required /></label>
      </div>
      <div className="pills" role="radiogroup" aria-label={t.addrType}>
        {['Home', 'Workplace', 'Other'].map((v) => (
          <button key={v} type="button" className="pill" aria-pressed={type === v} onClick={() => setType(v)}>{t.addrTypes[v]}</button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button className="btn" disabled={busy}>{busy ? t.saving : t.saveAddress}</button>
        {onCancel && <button type="button" className="btn secondary" onClick={onCancel}>{t.cancel}</button>}
      </div>
    </form>
  );
}
