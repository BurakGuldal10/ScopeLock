import { Resend } from 'resend';
import { SignoffDetails } from '@/app/actions/client-signoff';

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = resendApiKey && !resendApiKey.includes('your_api_key');
const resend = isResendConfigured ? new Resend(resendApiKey) : null;

export async function sendApprovalNotifications(signoff: SignoffDetails): Promise<{
  agencyEmailSent: boolean;
  clientEmailSent: boolean;
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pdfDownloadUrl = `${appUrl}/api/pdf/${signoff.token}`;
  const signoffViewUrl = `${appUrl}/view/${signoff.token}`;

  const feeText = Number(signoff.additional_fee) > 0
    ? `$${signoff.additional_fee} USD`
    : 'Ek Ücret Yok';

  // 1. Email to Agency ("Müşteri onayladı, başlayabilirsin!")
  const agencyEmailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #10b981; color: white; padding: 12px 18px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; margin-bottom: 20px;">
        🎉 MÜŞTERİ ONAYLADI, İŞE BAŞLAYABİLİRSİNİZ!
      </div>
      
      <h2 style="color: #0f172a; margin-top: 0;">Kapsam Onay Bildirimi</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.5;">
        Sayın <strong>${signoff.agency?.name || 'Ajans Yetkilisi'}</strong>, müşteriniz <strong>${signoff.project?.client_name}</strong> onay talebinizi resmen imzalayarak onayladı.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Proje:</td>
            <td style="font-weight: 600; color: #0f172a; text-align: right;">${signoff.project?.name}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Talep Başlığı:</td>
            <td style="font-weight: 600; color: #0f172a; text-align: right;">${signoff.title}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Onaylanan Ek Ücret:</td>
            <td style="font-weight: bold; color: #10b981; text-align: right;">${feeText}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Onay Zamanı:</td>
            <td style="font-weight: 600; color: #0f172a; text-align: right;">${new Date().toLocaleString('tr-TR')}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${pdfDownloadUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          📄 İmzalı Resmi Onay PDF'ini İndir
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-bottom: 0;">
        ScopeLock Güvenli Dijital Kapsam Sistemi ile otomatik gönderilmiştir.
      </p>
    </div>
  `;

  // 2. Email to Client
  const clientEmailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #4f46e5; color: white; padding: 12px 18px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; margin-bottom: 20px;">
        ✓ KAPSAM ONAYINIZ BAŞARIYLA ALINDI
      </div>
      
      <h2 style="color: #0f172a; margin-top: 0;">Sayın ${signoff.project?.client_name},</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.5;">
        <strong>${signoff.agency?.name}</strong> tarafından sunulan <strong>"${signoff.title}"</strong> başlıklı kapsam onayınız zaman damgası ve IP kaydıyla resmi olarak kayıt altına alınmıştır.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${pdfDownloadUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          📄 Resmi Onay Belgenizi (PDF) İndirin
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-bottom: 0;">
        ScopeLock - Zaman damgalı dijital mutabakat sistemi.
      </p>
    </div>
  `;

  let agencyEmailSent = false;
  let clientEmailSent = false;

  if (resend) {
    try {
      // Send to agency
      if (signoff.agency?.email) {
        await resend.emails.send({
          from: 'ScopeLock <onboarding@resend.dev>',
          to: signoff.agency.email,
          subject: `🎉 [Müşteri Onayladı] ${signoff.project?.name} - ${signoff.title}`,
          html: agencyEmailHtml,
        });
        agencyEmailSent = true;
      }

      // Send to client
      if (signoff.project?.client_email) {
        await resend.emails.send({
          from: 'ScopeLock <onboarding@resend.dev>',
          to: signoff.project.client_email,
          subject: `✅ [Onay Alındı] ${signoff.title} Kapsam Onay Belgeniz`,
          html: clientEmailHtml,
        });
        clientEmailSent = true;
      }
    } catch (err) {
      console.error('Resend email error (proceeding gracefully):', err);
    }
  } else {
    // Log simulation
    console.log('[Resend Simulation] Email to agency:', signoff.agency?.email);
    console.log('[Resend Simulation] Email to client:', signoff.project?.client_email);
    console.log('[Resend Simulation] PDF Download URL:', pdfDownloadUrl);
    agencyEmailSent = true;
    clientEmailSent = true;
  }

  return { agencyEmailSent, clientEmailSent };
}
