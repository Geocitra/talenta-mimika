import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = Number(this.configService.get<number>('SMTP_PORT', 465));

    if (host && user && pass) {
      const isSecure = port === 465;
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure, // Port 465 menggunakan koneksi SSL langsung
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(
        `MailService aktif: Terhubung ke ${host}:${port} (SSL: ${isSecure}, User: ${user})`,
      );
    } else {
      this.logger.warn(
        'Konfigurasi SMTP tidak lengkap di .env. MailService beralih ke MODE SIMULASI (Mocking).',
      );
    }
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    if (!this.transporter) {
      // Simulasi: Tampilkan kode OTP langsung di Terminal/Konsol Backend
      this.logger.log(
        `[SIMULASI EMAIL OTP] Kepada: ${to} | Kode OTP Anda: >>> ${otpCode} <<<`,
      );
      return;
    }

    const rawFrom = this.configService.get<string>('SMTP_FROM');
    const user = this.configService.get<string>('SMTP_USER', 'smtpgeocitra@gmail.com');
    const from = rawFrom
      ? (rawFrom.includes('<') ? rawFrom : `"MIMIKA TALENTA" <${rawFrom}>`)
      : `"MIMIKA TALENTA" <${user}>`;

    const mailOptions = {
      from,
      to,
      subject: `[KODE OTP: ${otpCode}] Verifikasi Akun MIMIKA TALENTA`,
      text: `KODE VERIFIKASI MIMIKA TALENTA: ${otpCode}\n\nKode ini berlaku selama 5 menit untuk menyelesaikan proses verifikasi identitas Anda pada Platform Ketenagakerjaan Daerah Kabupaten Mimika.\nJangan berikan kode ini kepada siapa pun.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kode Verifikasi MIMIKA TALENTA</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #18181b;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 15px;">
            <tr>
              <td align="center">
                <!-- KARTU EMAIL UTAMA (ZERO-ROUNDED & FLAT SWISS STYLE) -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border: 1px solid #d4d4d8; border-radius: 0px;">
                  
                  <!-- HEADER INSTANSI -->
                  <tr>
                    <td style="background-color: #09090b; padding: 24px 30px; border-bottom: 2px solid #27272a;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #a1a1aa; margin-bottom: 4px;">
                              Pemerintah Kabupaten Mimika
                            </span>
                            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase; color: #ffffff;">
                              MIMIKA TALENTA
                            </h1>
                            <span style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                              Pusat Ekosistem Ketenagakerjaan Daerah
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- BODY KONTEN -->
                  <tr>
                    <td style="padding: 32px 30px;">
                      <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #09090b; text-transform: uppercase; letter-spacing: 0.02em;">
                        Verifikasi Keamanan Akun
                      </h2>
                      <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #52525b;">
                        Gunakan kode otentikasi di bawah ini untuk mengonfirmasi kepemilikan email Anda. Kode ini diterbitkan secara kriptografis dan hanya berlaku selama <strong>5 menit</strong>.
                      </p>

                      <!-- KOTAK KODE OTP (ZERO-ROUNDED SHARP BOX) -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                        <tr>
                          <td align="center" style="background-color: #fafafa; border: 2px solid #09090b; border-radius: 0px; padding: 20px;">
                            <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #71717a; margin-bottom: 6px;">
                              Kode Rahasia Satu Kali Pakai (OTP)
                            </span>
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #09090b;">
                              ${otpCode}
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- PERINGATAN KEAMANAN -->
                      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0px; padding: 14px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #991b1b;">
                          <strong>Peringatan Keamanan:</strong> Jangan membagikan kode ini kepada pihak mana pun, termasuk staf yang mengatasnamakan Disnakertrans Mimika.
                        </p>
                      </div>

                      <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                        Jika Anda tidak merasa melakukan pendaftaran atau permintaan login di portal MIMIKA TALENTA, abaikan email ini.
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER RESMI -->
                  <tr>
                    <td style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 20px 30px;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #27272a;">
                        Dinas Tenaga Kerja dan Transmigrasi Kabupaten Mimika
                      </p>
                      <p style="margin: 0; font-size: 10px; color: #71717a; line-height: 1.4;">
                        Jl. Cenderawasih SP 2, Timika, Kabupaten Mimika, Papua Tengah 99910<br>
                        Email terkirim otomatis oleh sistem terpadu MIMIKA TALENTA.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email OTP berhasil dikirim ke ${to} via SMTP (MessageId: ${info.messageId})`);
    } catch (error) {
      this.logger.error(`Gagal mengirim email OTP ke ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }
}

