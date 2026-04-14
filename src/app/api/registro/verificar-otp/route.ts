import { NextResponse } from "next/server";

const globalAny: any = global;

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email o OTP no provisto." }, { status: 400 });
    }

    const map = globalAny.otpStore;
    if (!map || !map.has(email)) {
      return NextResponse.json({ error: "Código expirado o inválido." }, { status: 400 });
    }

    const record = map.get(email);
    if (Date.now() > record.expires) {
      map.delete(email);
      return NextResponse.json({ error: "El código OTP expiró." }, { status: 400 });
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Código incorrecto, verifica de nuevo." }, { status: 400 });
    }

    // Success
    map.delete(email);
    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Error validando OTP." }, { status: 500 });
  }
}
