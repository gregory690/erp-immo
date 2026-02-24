// Vercel Function — send-erp-email
// Reçoit { email, erpDocument } depuis le client après paiement réussi.
// 1. Sauvegarde le document ERP dans Vercel KV (pour re-téléchargement)
// 2. Envoie un email récapitulatif via Resend
//
// Variables d'environnement requises :
//   RESEND_API_KEY                  → dashboard.resend.com → API Keys
//   RESEND_FROM_EMAIL               → ex: erp@edletdiagnostic.fr (domaine vérifié dans Resend)
//   KV_REST_API_URL + KV_REST_API_TOKEN → configurés automatiquement par Vercel KV
//   VERCEL_PROJECT_PRODUCTION_URL   → injecté automatiquement par Vercel en production

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, erpDocument } = req.body || {};

  if (!email || !erpDocument?.metadata?.reference) {
    return res.status(400).json({ error: 'Email et document ERP requis' });
  }

  const reference = erpDocument.metadata.reference;
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.URL || 'http://localhost:3000';
  const redownloadUrl = `${baseUrl}/apercu?ref=${encodeURIComponent(reference)}`;

  // ─── 1. Sauvegarde dans Vercel KV ───────────────────────────────────────────
  try {
    const { kv } = require('@vercel/kv');
    await kv.set(reference, JSON.stringify(erpDocument), {
      ex: 60 * 60 * 24 * 180, // expire après 180 jours
    });
  } catch (err) {
    // Non bloquant — on continue avec l'email même si la sauvegarde échoue
    console.error('Vercel KV save error:', err.message);
  }

  // ─── 2. Envoi email via Resend ───────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.warn('RESEND_API_KEY non configurée — document sauvegardé, email non envoyé');
    return res.status(200).json({ success: true, warning: 'email_not_sent_no_api_key' });
  }

  const { Resend } = require('resend');
  const resend = new Resend(resendKey);

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'erp@edletdiagnostic.fr';
  const catnatCount = erpDocument.catnat?.length ?? 0;
  const bien = erpDocument.bien;
  const metadata = erpDocument.metadata;

  const dateRealisation = new Date(metadata.date_realisation).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const dateExpiration = new Date(metadata.validite_jusqu_au).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  try {
    await resend.emails.send({
      from: `EDL&DIAGNOSTIC <${fromEmail}>`,
      to: email,
      subject: `Votre ERP est prêt — ${bien.adresse_complete}`,
      html: buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err.message);
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
};

// ─── Template email HTML ──────────────────────────────────────────────────────
function buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration }) {
  const catnatMsg = catnatCount > 0
    ? `⚠️ <strong>${catnatCount} arrêté(s) de catastrophe naturelle</strong> recensé(s) sur cette commune.`
    : '✅ Aucun arrêté de catastrophe naturelle recensé.';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre ERP — EDL&amp;DIAGNOSTIC</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#b20f11;border-radius:10px 10px 0 0;padding:28px 24px;text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Service EDL&amp;DIAGNOSTIC</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:900;">État des Risques et Pollutions</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Conforme à l'arrêté du 27 septembre 2022</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px 24px;">
      <p style="margin:0 0 20px;font-size:15px;color:#111827;">
        Votre document ERP a été généré avec succès. Vous pouvez le télécharger à tout moment via le lien ci-dessous.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Bien concerné</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${bien.adresse_complete}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#374151;">${bien.code_postal} ${bien.commune} · Code INSEE : ${bien.code_insee}</p>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:20px;">
        <tr>
          <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center;width:50%;">
            <p style="margin:0;font-size:11px;color:#166534;text-transform:uppercase;">Établi le</p>
            <p style="margin:5px 0 0;font-size:14px;font-weight:700;color:#15803d;">${dateRealisation}</p>
          </td>
          <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px;text-align:center;width:50%;">
            <p style="margin:0;font-size:11px;color:#9a3412;text-transform:uppercase;">Expire le</p>
            <p style="margin:5px 0 0;font-size:14px;font-weight:700;color:#c2410c;">${dateExpiration}</p>
          </td>
        </tr>
      </table>
      <div style="background:#fefce8;border:1px solid #fef08a;border-radius:8px;padding:14px;margin-bottom:24px;font-size:14px;color:#713f12;">
        ${catnatMsg}
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${redownloadUrl}" style="display:inline-block;background:#b20f11;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
          Télécharger mon ERP (PDF)
        </a>
        <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Lien valable à tout moment — conservez cet email précieusement.</p>
      </div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;font-size:13px;color:#991b1b;margin-bottom:20px;">
        <strong>Rappel :</strong> Ce document doit être annexé au compromis de vente ou au contrat de bail (art. L125-5 Code de l'Environnement). Il est valable <strong>6 mois</strong>.
      </div>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0;">
      <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
        Réf. ${metadata.reference}<br>
        EDL&amp;DIAGNOSTIC · <a href="${redownloadUrl}" style="color:#b20f11;">Mon espace ERP</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
