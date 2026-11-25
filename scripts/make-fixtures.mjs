// Builds fixtures/data.json: sample data shaped like the live API, for offline development (MOCK_API=1).
// Names, prices and option lists were copied from https://poszabayeh.com/api/v1 on 2026-11-25.
import { writeFileSync, mkdirSync } from 'node:fs';

const CDN = 'https://zabayeh.b-cdn.net/';
const cuts = ['غوزي كامل','عربي 4 قطع','عربي 8 قطع','عربي بالطول','عزيمة مفطح','عربي عولقي','عولقي ثلاجة','عزيمة حضرمي','عولقي مفاصل','حضرمي مفاصل','ثلاجة','مقلقل','صالونه','برياني','عزيمة عماني','حضرمي ثلاجة'];
const cutImgs = ['ozeefull','arbictollfull','arbic8','arbic4','olake','frese','slon','asemahadrami','olakemafasel','adramimfaseal','mklklsleon','branisleon','asemhmofatah','aceemahomane','olkeslag','adramislag'].map((n) => `${CDN}${n}.png`);

function choices(weights, withImages) {
  const img = (arr) => (withImages ? arr : arr.map(() => ''));
  const type = withImages ? 'image' : 'text';
  return [
    { name: 'choice_30', title: 'الوزن والعمر', options: weights, required: true, display_type: 'text', option_images: weights.map(() => '') },
    { name: 'choice_27', title: 'طريقة التقطيع', options: cuts, required: true, display_type: type, option_images: img(cutImgs) },
    { name: 'choice_28', title: 'طريقة التغليف', options: ['أكياس','أطباق'], required: true, display_type: type, option_images: img([`${CDN}pak1.png`,`${CDN}pak2.png`]) },
    { name: 'choice_29', title: 'طريقة التعبئة', options: ['صندوق كرتون','صندوق فوم'], required: true, display_type: type, option_images: img([`${CDN}boxs.png`,`${CDN}foms.png`]) },
    { name: 'choice_34', title: 'الأجزاء التي لا ترغب بها', options: ['بدون رأس','بدون كبده','بدون كرشة','بدون كراعين'], required: false, display_type: 'multi_image', option_images: img(['head','kabdh','mosran','karen'].map((n) => `${CDN}${n}.png`)) },
  ];
}

function variations(base, weights, step) {
  const out = [];
  weights.forEach((w, wi) => cuts.forEach((c) => ['أكياس','أطباق'].forEach((p) => ['صندوق كرتون','صندوق فوم'].forEach((b) => {
    out.push({ type: `${w}-${c}-${p}-${b}`, price: base + wi * step + (b === 'صندوق فوم' ? 20 : 0), stock: 100 });
  }))));
  return out;
}

const W3 = ['12-10 كجم 2-3 شهور','15-13 كجم 4-5 شهور','18-16 كجم 6-7 شهور'];
const W1 = ['11-8 كجم 2-4 شهور'];
const W4 = ['17-16 كجم','18-17 كجم','20-19 كجم','20-21 كجم'];

const desc = 'خروف طازج يتميز بلحمه الطري ونكهته الغنية، يُذبح ويُجهز وفق الشريعة الإسلامية، ومناسب للشواء والمندي والكبسة وجميع المناسبات.';
const rows = [
  // id, name, cat, price, discount%, weights, step, images, rating
  [233, 'خروف كشميري عرض', 15, 750, 9.47, W1, 0, true, 5],
  [232, 'تيس محلي عرض', 15, 700, 7.28, W1, 0, true, null],
  [231, 'خروف نعيمي عرض', 15, 1000, 5.1, W1, 0, true, 4],
  [226, 'تيس محلي', 16, 700, 0, W3, 50, true, 4],
  [208, 'نصف تيس محلي', 13, 400, 0, W1, 0, true, null],
  [67, 'خروف نعيمي', 17, 1000, 0, W3, 150, true, 4.5],
  [65, 'خروف نجدي', 17, 1000, 0, W3, 150, true, 4],
  [62, 'تيس كشميري', 16, 700, 0, W3, 50, true, null],
  [61, 'تيس عماني', 16, 675, 0, W1, 0, true, 4],
  [55, 'خروف كشميري', 17, 700, 0, W3, 50, true, 4],
  [237, 'خروف نعيمي', 20, 1250, 0, W4, 0, false, null],
  [123, 'خروف نجدي', 20, 1150, 0, W4, 0, false, null],
];

const products = rows.map(([id, name, cat, price, discount, weights, step, images, rating]) => ({
  id, name, description: desc, image: [`p${id}.svg`], price, discount, discount_type: 'percent', unit: 'pc',
  total_stock: 100, category_ids: [{ id: String(cat) }], category_discount: null,
  rating: rating ? [{ average: String(rating) }] : [], maximum_order_quantity: 10,
  choice_options: choices(weights, images), variations: variations(price, weights, step),
  active_reviews: id === 67 ? [
    { id: 4, comment: 'طلبت خروف نعيمي ماشاءالله زين', rating: 4, created_at: '2026-08-07T14:31:21.000000Z', customer: { f_name: 'أحمد', l_name: '' } },
    { id: 7, comment: 'اللحم طازج والتوصيل سريع', rating: 5, created_at: '2026-09-02T10:00:00.000000Z', customer: { f_name: 'سالم', l_name: '' } },
  ] : [],
}));

const data = {
  config: {
    ecommerce_name: 'ذبائح الجزيرة',
    ecommerce_phone: '0547103665',
    ecommerce_email: 'zabayeh.online@gmail.com',
    ecommerce_address: 'شارع التغرودة، الشهامة الجديدة، أبوظبي، الإمارات العربية المتحدة',
    currency_symbol: 'د.إ',
    currency_symbol_position: 'right',
    base_urls: { product_image_url: '/mock', category_image_url: '/mock', banner_image_url: '/mock', ecommerce_image_url: '/mock' },
    play_store_config: { status: true, link: 'https://play.google.com/store/apps/details?id=com.poszabayeh.zabayehAljazeera' },
    app_store_config: { status: true, link: 'https://apps.apple.com/ae/app/zabayeh-al-jazeera/id6449191847' },
    whatsapp: { status: '0', number: '' },
  },
  categories: [
    { id: 13, name: 'ملحمة', image: 'c13.svg' },
    { id: 15, name: 'العروض', image: 'c15.svg' },
    { id: 16, name: 'الماعز', image: 'c16.svg' },
    { id: 17, name: 'الخروف', image: 'c17.svg' },
  ],
  banners: [
    { id: 9, title: 'عروض الذبائح', image: 'b1.svg', category_id: 15 },
    { id: 2, title: '.', image: 'b2.svg', category_id: 17 },
    { id: 8, title: '.', image: 'b3.svg', product_id: 67 },
  ],
  popular: [226, 67, 232, 55, 233, 65, 231, 208, 61],
  products,
};

mkdirSync('fixtures', { recursive: true });
writeFileSync('fixtures/data.json', JSON.stringify(data));
console.log('products', products.length, 'bytes', JSON.stringify(data).length);
