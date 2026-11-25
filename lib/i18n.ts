// Website languages. Arabic lives at the site root (/product/1); English under /en (/en/product/1).
export const LANGS = ['ar', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_COOKIE = 'zj_lang';

export const isLang = (v: unknown): v is Lang => v === 'ar' || v === 'en';
export const dirOf = (l: Lang) => (l === 'ar' ? 'rtl' : 'ltr');

/** Adds the /en prefix for English links. `path` always starts with "/". */
export function href(lang: Lang, path: string): string {
  if (lang === 'ar') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

/** Canonical + hreflang links for a page path. */
export function alternates(lang: Lang, path: string) {
  return { canonical: href(lang, path), languages: { ar: path, en: href('en', path), 'x-default': path } };
}

const ar = {
  siteName: 'ذبائح الجزيرة',
  tagline: 'ذبائح طازجة توصل لبيتك',
  siteDesc: 'ذبائح طازجة من مزارع الجزيرة: خروف نعيمي ونجدي وكشميري، تيس محلي وعماني، تُذبح يوميًا وفق الشريعة وتُقطَّع حسب طلبك وتصلك مبرّدة في الإمارات.',
  ogLocale: 'ar_AE',
  switchLang: 'English',
  switchLangLabel: 'Switch to English',

  // header / footer
  perks: ['ذبح يومي وفق الشريعة', 'إشراف بيطري كامل', 'توصيل مبرّد'],
  homeLabel: 'ذبائح الجزيرة، الصفحة الرئيسية',
  categories: 'الأقسام',
  searchLabel: 'ابحث عن منتج',
  searchPlaceholder: 'ابحث: خروف نعيمي، تيس، نصف ذبيحة…',
  search: 'بحث',
  footerAbout: 'ذبائح طازجة من مزارعنا، تُذبح يوميًا وفق الشريعة الإسلامية وتصلك مبرّدة إلى باب البيت.',
  contactUs: 'تواصل معنا',
  getApp: 'حمّل التطبيق',
  rights: (y: number) => `© ${y} ذبائح الجزيرة. جميع الحقوق محفوظة.`,
  whatsapp: 'تواصل عبر واتساب',
  account: (n: string) => `حسابي: ${n}`,
  signIn: 'تسجيل الدخول',
  signInShort: 'دخول',
  cartLabel: (n: number) => `السلة${n ? `، ${n} منتجات` : ''}`,

  // home
  shopByCategory: 'تسوّق حسب القسم',
  weekOffers: 'عروض هذا الأسبوع',
  allOffers: 'كل العروض',
  whyUs: 'لماذا ذبائح الجزيرة',
  trust: [
    ['ذبح شرعي', 'يُذبح يوميًا حسب طلبك'],
    ['إشراف بيطري', 'فحص كامل قبل الذبح'],
    ['توصيل مبرّد', 'من المسلخ إلى بابك'],
    ['تغذية طبيعية', 'من مزارعنا مباشرة'],
  ] as [string, string][],
  popular: 'الأكثر طلبًا',
  latest: 'وصل حديثًا',
  bannersLabel: 'العروض',
  bannerAlt: 'عرض ذبائح الجزيرة',
  bannerN: (i: number) => `العرض ${i}`,

  // listing
  home: 'الرئيسية',
  breadcrumbs: 'مسار التنقل',
  productsCount: 'منتج',
  sortLabel: 'الترتيب',
  sorts: { '': 'المقترح', low: 'الأقل سعرًا', high: 'الأعلى سعرًا' } as Record<string, string>,
  emptyCategory: 'لا توجد منتجات في هذا القسم حاليًا',
  emptyCategoryHint: 'جرّب قسمًا آخر أو عُد لاحقًا.',
  categoryDesc: (c: string) => `تسوّق ${c} من ذبائح الجزيرة: ذبح يومي، تقطيع حسب طلبك، وتوصيل مبرّد.`,
  searchTitle: 'البحث',
  resultsFor: (q: string) => `نتائج البحث عن «${q}»`,
  results: 'نتيجة',
  searchHint: 'اكتب اسم المنتج في خانة البحث بالأعلى.',
  noResults: (q: string) => `لم نجد منتجات تطابق «${q}»`,
  noResultsHint: 'جرّب كلمة أخرى، أو تصفّح الأقسام:',

  // product
  off: 'خصم',
  pricePer: (u: string) => `السعر لكل ${u}`,
  units: { kg: 'كجم', pc: 'رأس' } as Record<string, string>,
  from: 'يبدأ من',
  rating: (r: number) => `التقييم ${r} من 5`,
  reviewsCount: 'تقييم',
  outOf5: (r: number) => `${r} من 5`,
  aboutProduct: 'عن المنتج',
  reviews: 'آراء العملاء',
  youMayLike: 'قد يعجبك أيضًا',
  productNotFound: 'المنتج غير موجود',
  productDesc: (n: string) => `${n} طازج من ذبائح الجزيرة، يُذبح يوميًا ويُقطَّع حسب طلبك.`,
  imageN: (i: number) => `الصورة ${i}`,
  save: 'وفّر',
  priceNote: 'السعر يشمل الذبح والتقطيع والتغليف حسب اختيارك',
  multiHint: 'اختياري، يمكنك اختيار أكثر من خيار',
  required: 'مطلوب',
  optional: 'اختياري',
  choose: (t: string) => `اختر ${t}`,
  soldOut: 'غير متوفر حاليًا',
  addToCart: 'أضف إلى السلة',
  added: 'أُضيف إلى السلة.',
  addedShort: 'أُضيف ✓',
  viewCart: 'عرض السلة',
  quantity: 'الكمية',
  increase: 'زيادة',
  decrease: 'إنقاص',
  total: 'الإجمالي',
  listSep: '، ',

  // cart / checkout
  cart: 'السلة',
  emptyCart: 'سلتك فارغة',
  browse: 'تصفّح الذبائح',
  remove: 'حذف',
  subtotal: 'المجموع',
  checkout: 'إتمام الطلب',
  loading: 'جارٍ التحميل…',
  loadOptionsFailed: 'تعذّر تحميل خيارات التوصيل',
  stepPhone: 'رقم الجوال',
  stepAddress: 'عنوان التوصيل',
  stepTime: 'موعد التوصيل',
  stepPayment: 'طريقة الدفع',
  addrTypes: { Home: 'المنزل', Workplace: 'العمل', Other: 'آخر' } as Record<string, string>,
  villa: (v: string) => `فيلا/مبنى ${v}`,
  floor: (v: string) => `طابق ${v}`,
  addAddress: '+ إضافة عنوان جديد',
  outOfZone: 'هذا العنوان خارج منطقة التوصيل حاليًا.',
  today: 'اليوم',
  tomorrow: 'غدًا',
  slot: (a: string, b: string) => `من ${a} إلى ${b}`,
  am: 'ص',
  pm: 'م',
  noSlots: 'لا توجد أوقات متاحة في هذا اليوم.',
  orderNote: 'ملاحظات للطلب (اختياري)',
  orderNotePh: 'مثل: الاتصال قبل الوصول',
  orderSummary: 'ملخص الطلب',
  delivery: 'التوصيل',
  free: 'مجاني',
  minOrder: (p: string) => `الحد الأدنى للطلب ${p}.`,
  sending: 'جارٍ إرسال الطلب…',
  toPayment: 'متابعة للدفع',
  confirmOrder: 'تأكيد الطلب',
  pricesChecked: 'الأسعار تُراجع من النظام عند التأكيد.',
  pickAddress: 'اختر عنوان التوصيل',
  pickSlot: 'اختر وقت التوصيل',
  pickPayment: 'اختر طريقة الدفع',
  dateLocale: 'ar-AE',

  // address form
  area: 'المنطقة',
  areaPh: 'ابحث عن منطقتك، مثل: الشهامة، مدينة خليفة',
  useLocation: 'استخدم موقعي الحالي',
  locating: 'جارٍ تحديد موقعك…',
  located: '✓ تم تحديد الموقع',
  myLocation: 'موقعي الحالي',
  noGeo: 'المتصفح لا يدعم تحديد الموقع',
  geoFailed: 'لم نتمكن من الوصول لموقعك، ابحث عن منطقتك بالاسم',
  placeFailed: 'تعذّر تحديد الموقع',
  pickArea: 'اختر منطقتك من القائمة أو استخدم موقعك الحالي',
  street: 'الشارع',
  house: 'رقم الفيلا / المبنى',
  floorApt: 'الطابق / الشقة',
  landmark: 'علامة مميزة (اختياري)',
  landmarkPh: 'بجانب مسجد…',
  recipient: 'اسم المستلم',
  recipientPhone: 'جوال المستلم',
  addrType: 'نوع العنوان',
  saving: 'جارٍ الحفظ…',
  saveAddress: 'حفظ العنوان',
  cancel: 'إلغاء',

  // login
  myAccount: 'حسابي',
  hello: 'مرحبًا',
  logout: 'تسجيل الخروج',
  phone: 'رقم الجوال',
  smsHint: 'سنرسل لك رمز تحقق في رسالة نصية.',
  sendingCode: 'جارٍ الإرسال…',
  sendCode: 'إرسال الرمز',
  codeSentTo: 'رمز التحقق المرسل إلى',
  verifying: 'جارٍ التحقق…',
  confirm: 'تأكيد',
  changeNumber: 'تغيير الرقم',
  resend: 'إعادة إرسال الرمز',
  welcomeNew: 'أهلًا بك! هذا أول طلب لك من هذا الرقم، اكتب اسمك لإكمال إنشاء الحساب.',
  name: 'الاسم',
  continue: 'متابعة',
  genericError: 'حدث خطأ، حاول مرة أخرى',

  // result / 404
  orderStatus: 'حالة الطلب',
  orderReceived: 'تم استلام طلبك',
  orderNo: 'رقم الطلب:',
  orderReceivedHint: 'سنتواصل معك لتأكيد موعد التوصيل. يمكنك متابعة الطلب أيضًا من تطبيق ذبائح الجزيرة.',
  payFailed: 'لم تكتمل عملية الدفع',
  payFailedHint: 'لم يتم خصم أي مبلغ إذا ألغيت الدفع. يمكنك المحاولة مرة أخرى أو اختيار الدفع عند الاستلام.',
  help: 'للمساعدة:',
  keepShopping: 'متابعة التسوق',
  backToCheckout: 'العودة لإتمام الطلب',
  notFound: 'الصفحة غير موجودة',
  backHome: 'العودة للرئيسية',
};

export type Dict = typeof ar;

const en: Dict = {
  siteName: 'Zabayeh Al Jazeera',
  tagline: 'Fresh meat delivered to your door',
  siteDesc: 'Fresh sheep and goats from Al Jazeera farms: Naimi, Najdi and Kashmiri sheep, local and Omani goats. Slaughtered daily the halal way, cut to your order and delivered chilled across the UAE.',
  ogLocale: 'en_AE',
  switchLang: 'عربي',
  switchLangLabel: 'التبديل إلى العربية',

  perks: ['Halal slaughter daily', 'Full veterinary supervision', 'Chilled delivery'],
  homeLabel: 'Zabayeh Al Jazeera, home',
  categories: 'Categories',
  searchLabel: 'Search for a product',
  searchPlaceholder: 'Search: Naimi sheep, goat, half carcass…',
  search: 'Search',
  footerAbout: 'Fresh meat from our own farms, slaughtered daily the halal way and delivered chilled to your door.',
  contactUs: 'Contact us',
  getApp: 'Get the app',
  rights: (y: number) => `© ${y} Zabayeh Al Jazeera. All rights reserved.`,
  whatsapp: 'Chat on WhatsApp',
  account: (n: string) => `My account: ${n}`,
  signIn: 'Sign in',
  signInShort: 'Sign in',
  cartLabel: (n: number) => `Cart${n ? `, ${n} items` : ''}`,

  shopByCategory: 'Shop by category',
  weekOffers: "This week's offers",
  allOffers: 'All offers',
  whyUs: 'Why Zabayeh Al Jazeera',
  trust: [
    ['Halal slaughter', 'Slaughtered daily to order'],
    ['Vet supervised', 'Fully inspected before slaughter'],
    ['Chilled delivery', 'From our abattoir to your door'],
    ['Natural feed', 'Straight from our farms'],
  ],
  popular: 'Most popular',
  latest: 'New arrivals',
  bannersLabel: 'Offers',
  bannerAlt: 'Zabayeh Al Jazeera offer',
  bannerN: (i: number) => `Offer ${i}`,

  home: 'Home',
  breadcrumbs: 'Breadcrumb',
  productsCount: 'products',
  sortLabel: 'Sort',
  sorts: { '': 'Recommended', low: 'Price: low to high', high: 'Price: high to low' },
  emptyCategory: 'No products in this category right now',
  emptyCategoryHint: 'Try another category or check back later.',
  categoryDesc: (c: string) => `Shop ${c} from Zabayeh Al Jazeera: slaughtered daily, cut to your order and delivered chilled.`,
  searchTitle: 'Search',
  resultsFor: (q: string) => `Results for “${q}”`,
  results: 'results',
  searchHint: 'Type a product name in the search box above.',
  noResults: (q: string) => `No products match “${q}”`,
  noResultsHint: 'Try another word, or browse the categories:',

  off: 'Save',
  pricePer: (u: string) => `Price per ${u}`,
  units: { kg: 'kg', pc: 'head' },
  from: 'From',
  rating: (r: number) => `Rated ${r} out of 5`,
  reviewsCount: 'reviews',
  outOf5: (r: number) => `${r} out of 5`,
  aboutProduct: 'About this product',
  reviews: 'Customer reviews',
  youMayLike: 'You may also like',
  productNotFound: 'Product not found',
  productDesc: (n: string) => `Fresh ${n} from Zabayeh Al Jazeera, slaughtered daily and cut to your order.`,
  imageN: (i: number) => `Image ${i}`,
  save: 'Save',
  priceNote: 'Price includes slaughter, cutting and packing as you choose',
  multiHint: 'Optional, you can pick more than one',
  required: 'Required',
  optional: 'Optional',
  choose: (t: string) => `Choose ${t.toLowerCase()}`,
  soldOut: 'Currently unavailable',
  addToCart: 'Add to cart',
  added: 'Added to cart.',
  addedShort: 'Added ✓',
  viewCart: 'View cart',
  quantity: 'Quantity',
  increase: 'Increase',
  decrease: 'Decrease',
  total: 'Total',
  listSep: ', ',

  cart: 'Cart',
  emptyCart: 'Your cart is empty',
  browse: 'Browse our meat',
  remove: 'Remove',
  subtotal: 'Subtotal',
  checkout: 'Checkout',
  loading: 'Loading…',
  loadOptionsFailed: "Couldn't load delivery options",
  stepPhone: 'Mobile number',
  stepAddress: 'Delivery address',
  stepTime: 'Delivery time',
  stepPayment: 'Payment method',
  addrTypes: { Home: 'Home', Workplace: 'Work', Other: 'Other' },
  villa: (v: string) => `Villa/Building ${v}`,
  floor: (v: string) => `Floor ${v}`,
  addAddress: '+ Add a new address',
  outOfZone: 'This address is outside our delivery area for now.',
  today: 'Today',
  tomorrow: 'Tomorrow',
  slot: (a: string, b: string) => `${a} – ${b}`,
  am: 'AM',
  pm: 'PM',
  noSlots: 'No delivery times left on this day.',
  orderNote: 'Order notes (optional)',
  orderNotePh: 'e.g. Call before arriving',
  orderSummary: 'Order summary',
  delivery: 'Delivery',
  free: 'Free',
  minOrder: (p: string) => `Minimum order is ${p}.`,
  sending: 'Placing your order…',
  toPayment: 'Continue to payment',
  confirmOrder: 'Place order',
  pricesChecked: 'Prices are checked against our system when you order.',
  pickAddress: 'Choose a delivery address',
  pickSlot: 'Choose a delivery time',
  pickPayment: 'Choose a payment method',
  dateLocale: 'en-AE',

  area: 'Area',
  areaPh: 'Search your area, e.g. Al Shamkha, Khalifa City',
  useLocation: 'Use my current location',
  locating: 'Finding your location…',
  located: '✓ Location set',
  myLocation: 'My current location',
  noGeo: "Your browser doesn't support location",
  geoFailed: "We couldn't get your location, search for your area by name",
  placeFailed: "Couldn't set this location",
  pickArea: 'Pick your area from the list or use your current location',
  street: 'Street',
  house: 'Villa / building no.',
  floorApt: 'Floor / apartment',
  landmark: 'Landmark (optional)',
  landmarkPh: 'Next to the mosque…',
  recipient: 'Recipient name',
  recipientPhone: 'Recipient mobile',
  addrType: 'Address type',
  saving: 'Saving…',
  saveAddress: 'Save address',
  cancel: 'Cancel',

  myAccount: 'My account',
  hello: 'Hello',
  logout: 'Sign out',
  phone: 'Mobile number',
  smsHint: "We'll text you a verification code.",
  sendingCode: 'Sending…',
  sendCode: 'Send code',
  codeSentTo: 'Verification code sent to',
  verifying: 'Verifying…',
  confirm: 'Confirm',
  changeNumber: 'Change number',
  resend: 'Resend code',
  welcomeNew: 'Welcome! This is your first order from this number. Enter your name to finish creating your account.',
  name: 'Name',
  continue: 'Continue',
  genericError: 'Something went wrong, please try again',

  orderStatus: 'Order status',
  orderReceived: "We've received your order",
  orderNo: 'Order number:',
  orderReceivedHint: "We'll contact you to confirm the delivery time. You can also track your order in the Zabayeh Al Jazeera app.",
  payFailed: "Payment wasn't completed",
  payFailedHint: "If you cancelled the payment, nothing was charged. You can try again or choose cash on delivery.",
  help: 'Need help?',
  keepShopping: 'Continue shopping',
  backToCheckout: 'Back to checkout',
  notFound: 'Page not found',
  backHome: 'Back to home',
};

const dicts: Record<Lang, Dict> = { ar, en };
export const dictOf = (l: Lang): Dict => dicts[l];

// ---------- product option labels ----------
// Options come from the system in Arabic and must be sent back in Arabic when ordering,
// so English only changes how they are displayed.

const OPTION_EN: Record<string, string> = {
  'الوزن والعمر': 'Weight & age',
  'طريقة التقطيع': 'Cutting style',
  'طريقة التغليف': 'Wrapping',
  'طريقة التعبئة': 'Packing',
  'الأجزاء التي لا ترغب بها': 'Parts to leave out',
  'غوزي كامل': 'Whole (Ghouzi)',
  'عربي 4 قطع': 'Arabic cut, 4 pieces',
  'عربي 8 قطع': 'Arabic cut, 8 pieces',
  'عربي بالطول': 'Arabic cut, lengthwise',
  'عزيمة مفطح': 'Feast cut (Mafatah)',
  'عربي عولقي': 'Arabic Awlaqi cut',
  'عولقي ثلاجة': 'Awlaqi fridge cut',
  'عزيمة حضرمي': 'Hadrami feast cut',
  'عولقي مفاصل': 'Awlaqi joint cut',
  'حضرمي مفاصل': 'Hadrami joint cut',
  'ثلاجة': 'Fridge cut (small pieces)',
  'مقلقل': 'Cubes (Mugalgal)',
  'صالونه': 'Stew cut (Saloona)',
  'برياني': 'Biryani cut',
  'عزيمة عماني': 'Omani feast cut',
  'حضرمي ثلاجة': 'Hadrami fridge cut',
  'أكياس': 'Bags',
  'أطباق': 'Trays',
  'صندوق كرتون': 'Carton box',
  'صندوق فوم': 'Foam box',
  'بدون رأس': 'No head',
  'بدون كبده': 'No liver',
  'بدون كرشة': 'No tripe',
  'بدون كراعين': 'No trotters',
};

const range = (a: string, b: string) => [Number(a), Number(b)].sort((x, y) => x - y).join('–');

/** Display text for an option or option-group title. Unknown labels are shown as they are. */
export function optLabel(lang: Lang, s: string): string {
  if (lang === 'ar') return s;
  const t = s.trim();
  if (OPTION_EN[t]) return OPTION_EN[t];
  // "12-10 كجم 2-3 شهور" -> "10–12 kg, 2–3 months"
  const m = t.match(/^(\d+)\s*-\s*(\d+)\s*كجم\s*(?:(\d+)\s*-\s*(\d+)\s*(?:شهور|شهر|أشهر))?$/);
  if (m) return `${range(m[1], m[2])} kg${m[3] ? `, ${range(m[3], m[4])} months` : ''}`;
  return t;
}

// Category names from the system's English data are inconsistent ("sheeps"), so set them here.
const CATEGORY_EN: Record<number, string> = { 13: 'Butchery', 15: 'Offers', 16: 'Goats', 17: 'Sheep' };
export function categoryName(lang: Lang, id: number, fromApi: string): string {
  if (lang === 'en' && CATEGORY_EN[id]) return CATEGORY_EN[id];
  return fromApi;
}

export const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

// ---------- server messages ----------
// Route handlers raise Arabic messages; English visitors get these instead.
const SERVER_EN: Record<string, string> = {
  'يرجى تسجيل الدخول أولًا': 'Please sign in first',
  'رمز التحقق غير صحيح': 'The verification code is incorrect',
  'تعذّر التحقق من الرمز': "Couldn't verify the code",
  'أكمل التحقق من رقمك أولًا': 'Verify your number first',
  'تعذّر إنشاء الحساب': "Couldn't create your account",
  'تعذّر تحديد هذا الموقع': "Couldn't find this location",
  'الدفع عند الاستلام': 'Cash on delivery',
  'الدفع بالبطاقة': 'Pay by card',
  'أحد المنتجات في السلة لم يعد متوفرًا': 'One of the products in your cart is no longer available',
  'السلة فارغة': 'Your cart is empty',
  'اختر عنوان التوصيل': 'Choose a delivery address',
  'اختر وقت التوصيل': 'Choose a delivery time',
  'اختر طريقة الدفع': 'Choose a payment method',
  'اختر يوم التوصيل': 'Choose a delivery day',
  'هذا العنوان خارج منطقة التوصيل': 'This address is outside our delivery area',
  'تعذّر فتح صفحة الدفع، يمكنك اختيار الدفع عند الاستلام': "Couldn't open the payment page, you can choose cash on delivery",
  'حدث خطأ غير متوقع، حاول مرة أخرى': 'Something went wrong, please try again',
  'موقع غير صالح': 'Invalid location',
  'اكتب اسمك': 'Enter your name',
  'أدخل رمز التحقق': 'Enter the verification code',
  'أدخل رقم جوال إماراتي صحيح، مثل 05XXXXXXXX': 'Enter a valid UAE mobile number, e.g. 05XXXXXXXX',
  'حدّد موقع التوصيل': 'Set the delivery location',
  'اكتب العنوان': 'Enter the address',
  'اكتب اسم المستلم': "Enter the recipient's name",
  'رقم جوال المستلم غير صحيح': "The recipient's mobile number is invalid",
};

export function serverMsg(lang: Lang, msg: string): string {
  if (lang === 'ar') return msg;
  if (SERVER_EN[msg]) return SERVER_EN[msg];
  let m = msg.match(/^الحد الأدنى للطلب (\d+(?:\.\d+)?) د\.إ$/);
  if (m) return `Minimum order is AED ${m[1]}`;
  m = msg.match(/^اختيارات «(.+)» غير متوفرة، أعد اختيارها من صفحة المنتج$/);
  if (m) return `The options for “${m[1]}” are no longer available, choose them again on the product page`;
  m = msg.match(/^تعذّر الاتصال بالخادم \((\d+)\)$/);
  if (m) return `Couldn't reach the server (${m[1]})`;
  return msg;
}

/** Reads the language from a page's params (always valid: unknown values never reach a page). */
export async function pageLang(params: Promise<{ lang: string }>): Promise<Lang> {
  const { lang } = await params;
  return isLang(lang) ? lang : 'ar';
}
