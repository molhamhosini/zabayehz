export const SITE_URL = (process.env.SITE_URL || 'https://zabayeah.com').replace(/\/$/, '');
export const SITE_NAME = 'ذبائح الجزيرة';
export const SITE_DESC = 'ذبائح طازجة من مزارع الجزيرة: خروف نعيمي ونجدي وكشميري، تيس محلي وعماني، تُذبح يوميًا وفق الشريعة وتُقطَّع حسب طلبك وتصلك مبرّدة في الإمارات.';

// Company contact details shown on the site (set by the owner; these take priority over the API values).
export const CONTACT = {
  phones: ['0568888210', '0568888211'],
  email: 'info@zabayeah.com',
};

/** 05xxxxxxxx -> +9715xxxxxxxx for tel: links */
export const telHref = (n: string) => `tel:+971${n.replace(/\D/g, '').replace(/^0/, '')}`;
