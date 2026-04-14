import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// Global in-memory map for OTPs during Dev
const globalAny: any = global;
if (!globalAny.otpStore) {
  globalAny.otpStore = new Map();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    // Verificar si el email existe
    let user: any = await prisma.cliente.findFirst({ where: { email } });
    let isCliente = true;
    if (!user) {
      user = await prisma.empleado.findFirst({ where: { email } });
      isCliente = false;
    }

    if (!user) {
      return NextResponse.json({ error: "No existe una cuenta con este correo electrónico." }, { status: 404 });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar OTP (válido por 10 min)
    globalAny.otpStore.set(`reset_${email}`, { otp, expires: Date.now() + 10 * 60000 });

    // Configurar nodemailer para usar un servidor SMTP real
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const nombre = (user as any).nombres;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; text-align: center; }
          .content h2 { color: #1f2937; font-size: 22px; margin-bottom: 20px; }
          .content p { color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 30px; }
          .otp-box { background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #7C3AED; margin-bottom: 30px; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>bancoUM</h1>
          </div>
          <div class="content">
            <h2>Recuperación de contraseña</h2>
            <p>Hola <strong>${nombre.split(' ')[0]}</strong>,<br><br>Has solicitado restablecer tu contraseña. Ingresa el siguiente código de seguridad en la plataforma para poder cambiarla.</p>
            <div class="otp-box">${otp}</div>
            <p>Este código vence en 10 minutos. Si no has solicitado esto, por favor ignora este correo.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} bancoUM. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"bancoUM Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Tu código para restablecer contraseña - bancoUM",
      html: emailHtml,
    });

    console.log("OTP ENVIADO AL CORREO RECEPTOR");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[OTP_ERROR]", err);
    return NextResponse.json({ error: "Error enviando el correo de recuperación." }, { status: 500 });
  }
}