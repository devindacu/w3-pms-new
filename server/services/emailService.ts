import nodemailer from 'nodemailer'

export interface SMTPSettings {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromName: string
  fromEmail: string
  replyTo: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

/**
 * Create a nodemailer transporter from SMTP settings.
 */
export function createTransporter(settings: SMTPSettings) {
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.password,
    },
    tls: {
      // In development, allow self-signed/untrusted certs so localhost SMTP servers work.
      // In production, always validate the certificate chain to prevent MITM attacks.
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })
}

/**
 * Verify SMTP connection using the provided settings.
 * Returns null on success, or an error message string on failure.
 */
export async function verifyConnection(settings: SMTPSettings): Promise<string | null> {
  try {
    const transporter = createTransporter(settings)
    await transporter.verify()
    return null
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return msg
  }
}

/**
 * Send an email using stored SMTP settings.
 */
export async function sendEmail(settings: SMTPSettings, options: SendEmailOptions): Promise<void> {
  const transporter = createTransporter(settings)
  await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.fromEmail}>`,
    replyTo: settings.replyTo || settings.fromEmail,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
    bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
  })
}
