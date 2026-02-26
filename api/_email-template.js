// Template email partagé — utilisé par stripe-webhook.js et send-erp-email.js
// Préfixe _ : Vercel ne l'expose pas comme endpoint

export function buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount, dateRealisation, dateExpiration }) {
  const catnatBg    = catnatCount > 0 ? '#fff7ed' : '#f0fdf4';
  const catnatBorder= catnatCount > 0 ? '#fed7aa' : '#bbf7d0';
  const catnatColor = catnatCount > 0 ? '#92400e' : '#166534';
  const catnatIcon  = catnatCount > 0 ? '⚠️' : '✅';
  const catnatText  = catnatCount > 0
    ? `<strong>${catnatCount} arrêté(s) de catastrophe naturelle</strong> recensé(s) sur cette commune — à mentionner dans la section III de l'ERP.`
    : 'Aucun arrêté de catastrophe naturelle recensé sur cette commune.';

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Votre ERP — EDL&amp;DIAGNOSTIC</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- ══ HEADER ══ -->
          <tr>
            <td style="background-color:#1a3a5c;border-radius:12px 12px 0 0;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:3px;text-transform:uppercase;">Service officiel</p>
                    <p style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.3px;">EDL<span style="color:#e63946;">&amp;</span>DIAGNOSTIC</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;color:rgba(255,255,255,0.5);font-size:10px;text-align:right;line-height:1.4;">État des Risques<br>et Pollutions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ CONFIRMATION ══ -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#dcfce7;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;">✅</div>
                    <p style="margin:12px 0 4px;font-size:22px;font-weight:900;color:#111827;">Votre ERP est prêt !</p>
                    <p style="margin:0;font-size:14px;color:#6b7280;">Conforme à l'arrêté du 27 septembre 2022</p>
                  </td>
                </tr>
              </table>

              <!-- Bien concerné -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Bien concerné</p>
                    <p style="margin:0;font-size:16px;font-weight:800;color:#0f172a;">${bien.adresse_complete}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">${bien.code_postal} ${bien.commune} &nbsp;·&nbsp; Code INSEE : ${bien.code_insee}</p>
                  </td>
                </tr>
              </table>

              <!-- Dates -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td width="48%" style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;text-align:center;">
                    <p style="margin:0;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">Établi le</p>
                    <p style="margin:6px 0 0;font-size:15px;font-weight:800;color:#15803d;">${dateRealisation}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:16px;text-align:center;">
                    <p style="margin:0;font-size:10px;color:#ea580c;text-transform:uppercase;letter-spacing:1px;">Expire le</p>
                    <p style="margin:6px 0 0;font-size:15px;font-weight:800;color:#c2410c;">${dateExpiration}</p>
                  </td>
                </tr>
              </table>

              <!-- CatNat -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:${catnatBg};border:1px solid ${catnatBorder};border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:${catnatColor};">${catnatIcon}&nbsp; ${catnatText}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${redownloadUrl}" style="display:inline-block;background-color:#b20f11;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:16px 40px;border-radius:10px;letter-spacing:0.2px;">
                      📄&nbsp; Télécharger mon ERP (PDF)
                    </a>
                    <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;">Ce lien est permanent — vous pouvez l'utiliser à tout moment.</p>
                  </td>
                </tr>
              </table>

              <!-- Séparateur -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid #f1f5f9;font-size:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Prochaines étapes -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Que faire avec ce document ?</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:24px;font-size:14px;color:#b20f11;font-weight:900;vertical-align:top;">→</td>
                              <td style="font-size:13px;color:#4b5563;padding-left:6px;line-height:1.5;">Annexez-le au <strong>compromis de vente ou au contrat de bail</strong> (art. L125-5 Code de l'environnement)</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:24px;font-size:14px;color:#b20f11;font-weight:900;vertical-align:top;">→</td>
                              <td style="font-size:13px;color:#4b5563;padding-left:6px;line-height:1.5;">Ce document est <strong>valable 6 mois</strong> — pensez à le renouveler avant expiration</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:24px;font-size:14px;color:#b20f11;font-weight:900;vertical-align:top;">→</td>
                              <td style="font-size:13px;color:#4b5563;padding-left:6px;line-height:1.5;">Conservez cet email — le lien vous permet de <strong>retélécharger le PDF à tout moment</strong></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ FOOTER ══ -->
          <tr>
            <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
                      Réf. <span style="font-family:monospace;color:#64748b;">${metadata.reference}</span><br>
                      Une question ? <a href="mailto:contact@edletdiagnostic.fr" style="color:#b20f11;text-decoration:none;">contact@edletdiagnostic.fr</a><br>
                      © ${new Date().getFullYear()} EDL&amp;DIAGNOSTIC · <a href="https://edletdiagnostic.fr" style="color:#94a3b8;text-decoration:none;">edletdiagnostic.fr</a>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <a href="${redownloadUrl}" style="font-size:11px;color:#b20f11;text-decoration:none;font-weight:700;">Accéder à mon ERP →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
