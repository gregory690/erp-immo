// Template email partagé — utilisé par stripe-webhook.js et send-erp-email.js
// Préfixe _ : Vercel ne l'expose pas comme endpoint
// Design : corporate plat — sans border-radius, typographie claire, palette sobre

export function buildEmailHTML({ bien, metadata, redownloadUrl, catnatCount: _catnatCount, dateRealisation, dateExpiration }) {

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Votre ERP — EDL&amp;DIAGNOSTIC</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <!-- Pré-header invisible -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Votre ERP est prêt — ${bien.adresse_complete}</div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- ══ LOGO ══ -->
          <tr>
            <td style="padding:0 0 16px 4px;">
              <p style="margin:0;font-size:13px;font-weight:800;color:#1a3a5c;letter-spacing:0.5px;">EDL<span style="color:#b20f11;">&amp;</span>DIAGNOSTIC</p>
            </td>
          </tr>

          <!-- ══ CARD PRINCIPALE ══ -->
          <tr>
            <td style="background-color:#ffffff;border-top:3px solid #1a3a5c;">

              <!-- En-tête card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 36px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Confirmation de document</p>
                    <p style="margin:0 0 4px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">Votre ERP est prêt</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">Conforme à l'arrêté du 27 septembre 2022</p>
                  </td>
                </tr>
              </table>

              <!-- Séparateur -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #e5e7eb;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Bien concerné -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:20px 36px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Bien concerné</p>
                    <p style="margin:0 0 2px;font-size:17px;font-weight:800;color:#111827;">${bien.adresse_complete}</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">${bien.code_postal} ${bien.commune} &nbsp;&middot;&nbsp; INSEE : ${bien.code_insee}</p>
                  </td>
                </tr>
              </table>

              <!-- Séparateur -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #f3f4f6;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Dates -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:20px 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="48%" style="border:1px solid #e5e7eb;padding:14px 16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Établi le</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${dateRealisation}</p>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="border:1px solid #e5e7eb;padding:14px 16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Expire le</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${dateExpiration}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#6b7280;">valable 6 mois</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PDF joint -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 36px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#f0fdf4;border-left:3px solid #15803d;padding:12px 16px;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#14532d;">Votre ERP est joint en PDF à cet email.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Séparateur -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #e5e7eb;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 36px;">
                    <a href="${redownloadUrl}" style="display:inline-block;background-color:#1a3a5c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;letter-spacing:0.3px;">
                      Voir / télécharger mon ERP &rarr;
                    </a>
                    <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;">Si le PDF n'apparaît pas en pièce jointe, utilisez ce lien pour le télécharger. Lien permanent — consultable à tout moment.</p>
                  </td>
                </tr>
              </table>

              <!-- Séparateur -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #f3f4f6;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Prochaines étapes -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:20px 36px 32px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1.5px;">Que faire avec ce document ?</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:5px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:20px;font-size:13px;color:#1a3a5c;font-weight:900;vertical-align:top;padding-top:1px;">&rarr;</td>
                              <td style="font-size:13px;color:#4b5563;padding-left:8px;line-height:1.6;">Annexez-le au <strong>compromis de vente ou au contrat de bail</strong> (art. L125-5 Code de l'environnement)</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:20px;font-size:13px;color:#1a3a5c;font-weight:900;vertical-align:top;padding-top:1px;">&rarr;</td>
                              <td style="font-size:13px;color:#4b5563;padding-left:8px;line-height:1.6;">Ce document est <strong>valable 6 mois</strong> — pensez à le renouveler avant expiration</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:20px;font-size:13px;color:#1a3a5c;font-weight:900;vertical-align:top;padding-top:1px;">&rarr;</td>
                              <td style="font-size:13px;color:#4b5563;padding-left:8px;line-height:1.6;">Conservez cet email — le lien vous permet de <strong>retélécharger le PDF à tout moment</strong></td>
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
            <td style="padding:20px 4px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.8;">
                      Réf. <span style="font-family:monospace;color:#6b7280;">${metadata.reference}</span><br>
                      Question ? <a href="mailto:contact@edletdiagnostic.fr" style="color:#1a3a5c;text-decoration:none;">contact@edletdiagnostic.fr</a><br>
                      &copy; ${new Date().getFullYear()} EDL&amp;DIAGNOSTIC &middot; <a href="https://edletdiagnostic.fr" style="color:#9ca3af;text-decoration:none;">edletdiagnostic.fr</a>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <a href="${redownloadUrl}" style="font-size:11px;color:#1a3a5c;text-decoration:none;font-weight:700;white-space:nowrap;">Accéder &rarr;</a>
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
