import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE === 'true', // true para porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EnviarEmailParams {
  para: string
  assunto: string
  html: string
}

export async function enviarEmail({ para, assunto, html }: EnviarEmailParams) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? '"Sonagás" <no-reply@sonagas.co.ao>',
    to: para,
    subject: assunto,
    html,
  })
}

export function templateCodigoRecuperacao(codigo: string, nome: string) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#FAFAF8;">
    <p style="color:#1A1A1A; font-size:13px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; margin:0 0 24px;">
      Sonagás · Grupo Sonangol
    </p>
    <h1 style="color:#1A1A1A; font-size:22px; font-weight:700; margin:0 0 12px;">
      Olá, ${nome}
    </h1>
    <p style="color:#1A1A1A99; font-size:14px; line-height:1.6; margin:0 0 24px;">
      Recebemos um pedido de recuperação de senha para a sua conta. Use o código abaixo para continuar. Este código expira em 10 minutos.
    </p>
    <div style="background:#1A1A1A; color:#FFC20E; font-size:32px; font-weight:700; letter-spacing:0.3em; text-align:center; padding:20px; border-radius:8px; margin:0 0 24px;">
      ${codigo}
    </div>
    <p style="color:#1A1A1A66; font-size:12px; line-height:1.6; margin:0;">
      Se não foi você quem solicitou, ignore este email — a sua senha permanece inalterada.
    </p>
  </div>
  `
}
