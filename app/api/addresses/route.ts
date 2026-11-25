import { NextResponse } from 'next/server';
import { badRequest, errorResponse, normalizePhone } from '@/lib/backend';
import { addAddress, deleteAddress, listAddresses } from '@/lib/account';

export async function GET() {
  try {
    return NextResponse.json({ addresses: await listAddresses() });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const lat = Number(b.latitude), lng = Number(b.longitude);
    const phone = normalizePhone(String(b.contact_person_number ?? ''));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return badRequest('حدّد موقع التوصيل');
    if (!String(b.address ?? '').trim()) return badRequest('اكتب العنوان');
    if (!String(b.contact_person_name ?? '').trim()) return badRequest('اكتب اسم المستلم');
    if (!phone) return badRequest('رقم جوال المستلم غير صحيح');
    await addAddress({
      address_type: ['Home', 'Workplace', 'Other'].includes(b.address_type) ? b.address_type : 'Home',
      address: String(b.address).trim().slice(0, 250),
      contact_person_name: String(b.contact_person_name).trim().slice(0, 80),
      contact_person_number: phone,
      latitude: String(lat),
      longitude: String(lng),
      road: b.road ? String(b.road).slice(0, 80) : null,
      house: b.house ? String(b.house).slice(0, 40) : null,
      floor: b.floor ? String(b.floor).slice(0, 20) : null,
    });
    return NextResponse.json({ addresses: await listAddresses() });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const id = Number(new URL(req.url).searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) return badRequest('العنوان غير موجود');
    await deleteAddress(id);
    return NextResponse.json({ addresses: await listAddresses() });
  } catch (e) {
    return errorResponse(e);
  }
}
