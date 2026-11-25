import type { Metadata } from 'next';
import Link from 'next/link';
import { ClearCartOnSuccess } from '@/components/ClearCartOnSuccess';
import { CONTACT, telHref } from '@/lib/site';

export const metadata: Metadata = { title: 'حالة الطلب', robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function OrderResult({ searchParams }: Props) {
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
            <h1>تم استلام طلبك</h1>
            {id && <p>رقم الطلب: <b className="num">{id}</b></p>}
            <p className="hint">سنتواصل معك لتأكيد موعد التوصيل. يمكنك متابعة الطلب أيضًا من تطبيق ذبائح الجزيرة.</p>
          </>
        ) : (
          <>
            <div className="badge-fail" aria-hidden>!</div>
            <h1>لم تكتمل عملية الدفع</h1>
            <p className="hint">لم يتم خصم أي مبلغ إذا ألغيت الدفع. يمكنك المحاولة مرة أخرى أو اختيار الدفع عند الاستلام.</p>
            <p className="hint">للمساعدة: <a className="num" href={telHref(CONTACT.phones[0])}>{CONTACT.phones[0]}</a></p>
          </>
        )}
        <div className="actions" style={{ justifyContent: 'center' }}>
          {ok ? <Link className="btn" href="/">متابعة التسوق</Link> : <Link className="btn" href="/checkout">العودة لإتمام الطلب</Link>}
        </div>
      </div>
    </div>
  );
}
