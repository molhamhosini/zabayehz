import type { Metadata } from 'next';
import Link from 'next/link';
import { ClearCartOnSuccess } from '@/components/ClearCartOnSuccess';
import { pageLang } from '@/lib/i18n';
import { CONTACT, telHref } from '@/lib/site';
import { tools } from '@/lib/t';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: tools(await pageLang(params)).t.orderStatus, robots: { index: false } };
}

export default async function OrderResult({ params, searchParams }: Props) {
  const { t, href } = tools(await pageLang(params));
  const q = await searchParams;
  // The payment gateway returns with flag=success|fail (or status=…); cash orders come here with status=success.
  const s = (q.status || q.flag || '').toLowerCase();
  const ok = s === 'success' || s === 'payment-success';
  const id = (q.id || q.order_id || '').replace(/[^\w-]/g, '');
  return (
    <div className="wrap narrow" style={{ padding: '40px 16px' }}>
      <div className="panel result">
        {ok ? (
          <>
            <ClearCartOnSuccess />
            <div className="badge-ok" aria-hidden>✓</div>
            <h1>{t.orderReceived}</h1>
            {id && <p>{t.orderNo} <b className="num">{id}</b></p>}
            <p className="hint">{t.orderReceivedHint}</p>
          </>
        ) : (
          <>
            <div className="badge-fail" aria-hidden>!</div>
            <h1>{t.payFailed}</h1>
            <p className="hint">{t.payFailedHint}</p>
            <p className="hint">{t.help} <a className="num" href={telHref(CONTACT.phones[0])}>{CONTACT.phones[0]}</a></p>
          </>
        )}
        <div className="actions" style={{ justifyContent: 'center' }}>
          {ok ? <Link className="btn" href={href('/')}>{t.keepShopping}</Link> : <Link className="btn" href={href('/checkout')}>{t.backToCheckout}</Link>}
        </div>
      </div>
    </div>
  );
}
