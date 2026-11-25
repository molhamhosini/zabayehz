type P = { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });

export const SearchIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const CartIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 8H6.2" /><circle cx="9" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>);
export const PhoneIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>);
export const CheckIcon = ({ size }: P) => (<svg {...base(size)}><path d="m5 12 5 5L20 7" /></svg>);
export const StarIcon = ({ size = 14 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" /></svg>);
export const ShieldIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>);
export const TruckIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg>);
export const StethIcon = ({ size }: P) => (<svg {...base(size)}><path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v3a4 4 0 0 0 8 0v-2" /><circle cx="18" cy="12" r="2" /></svg>);
export const LeafIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" /><path d="M5 19 13 11" /></svg>);
export const WhatsIcon = ({ size = 26 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1 .3-3.4-.7a11.8 11.8 0 0 1-4.6-4.1c-.4-.6-1-1.6-1-2.7s.6-1.7.9-2c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6a8.5 8.5 0 0 0 4.2 3.7c.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3s.1.8-.1 1.4" /></svg>);
