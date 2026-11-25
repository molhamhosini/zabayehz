'use client';
import { useState } from 'react';
import { postJson, useUser } from './UserProvider';
import { useI18n } from './LangProvider';

type Step = 'phone' | 'code' | 'name';

export function LoginForm({ onDone }: { onDone?: () => void }) {
  const { refresh } = useUser();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sentAt, setSentAt] = useState(0);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  const send = () => run(async () => {
    const r = await postJson<{ phone: string }>('/api/auth/send', { phone });
    setPhone(r.phone); setStep('code'); setCode(''); setSentAt(Date.now());
  });
  const verify = () => run(async () => {
    const r = await postJson<{ ok?: boolean; needsName?: boolean }>('/api/auth/verify', { phone, code });
    if (r.needsName) { setStep('name'); return; }
    await refresh(); onDone?.();
  });
  const register = () => run(async () => {
    await postJson('/api/auth/register', { phone, name });
    await refresh(); onDone?.();
  });

  return (
    <form className="login" onSubmit={(e) => { e.preventDefault(); if (step === 'phone') send(); else if (step === 'code') verify(); else register(); }}>
      {step === 'phone' && (
        <>
          <label className="field">
            <span>{t.phone}</span>
            <div className="phone-input">
              <span className="cc num">+971</span>
              <input inputMode="tel" autoComplete="tel-national" placeholder="05XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" required />
            </div>
          </label>
          <p className="hint">{t.smsHint}</p>
          <button className="btn" disabled={busy || phone.replace(/\D/g, '').length < 9}>{busy ? t.sendingCode : t.sendCode}</button>
        </>
      )}
      {step === 'code' && (
        <>
          <label className="field">
            <span>{t.codeSentTo} <b className="num">{phone}</b></span>
            <input className="otp num" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} dir="ltr" autoFocus required />
          </label>
          <button className="btn" disabled={busy || code.length < 4}>{busy ? t.verifying : t.confirm}</button>
          <div className="row-links">
            <button type="button" className="link" onClick={() => setStep('phone')}>{t.changeNumber}</button>
            <button type="button" className="link" disabled={busy || Date.now() - sentAt < 30000} onClick={send}>{t.resend}</button>
          </div>
        </>
      )}
      {step === 'name' && (
        <>
          <p className="hint">{t.welcomeNew}</p>
          <label className="field">
            <span>{t.name}</span>
            <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </label>
          <button className="btn" disabled={busy || name.trim().length < 2}>{busy ? t.saving : t.continue}</button>
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
