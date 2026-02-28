import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ArrowLeft, Trash2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function Confidentialite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const deleted = searchParams.get('deleted') === '1';
  const deleteError = searchParams.get('delete_error');

  const [deletionEmail, setDeletionEmail] = useState('');
  const [deletionStatus, setDeletionStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [deletionErrorMsg, setDeletionErrorMsg] = useState('');

  async function handleRequestDeletion(e: React.FormEvent) {
    e.preventDefault();
    setDeletionStatus('sending');
    setDeletionErrorMsg('');
    try {
      const res = await fetch('/api/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deletionEmail }),
      });
      if (res.status === 429) {
        setDeletionErrorMsg('Trop de tentatives. Réessayez dans une heure.');
        setDeletionStatus('error');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeletionErrorMsg(data.error || 'Erreur serveur');
        setDeletionStatus('error');
        return;
      }
      setDeletionStatus('sent');
    } catch {
      setDeletionErrorMsg('Impossible de contacter le serveur. Vérifiez votre connexion.');
      setDeletionStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <div className="bg-edl-700 rounded p-1.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-navy-900 text-lg tracking-tight">EDL<span className="text-edl-700">&</span>DIAGNOSTIC</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-navy-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-400 mb-10">En vigueur au 1er janvier 2026 — Conforme au Règlement (UE) 2016/679 (RGPD)</p>

        {/* Bannière confirmation suppression */}
        {deleted && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-8">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 text-sm">Vos données ont été supprimées.</p>
              <p className="text-xs text-green-700 mt-0.5">Tous vos ERPs et données associées ont été effacés de nos serveurs. Pensez également à vider le localStorage de votre navigateur si nécessaire.</p>
            </div>
          </div>
        )}
        {deleteError === 'expired' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Lien expiré ou déjà utilisé.</p>
              <p className="text-xs text-amber-700 mt-0.5">Le lien de confirmation est valable 1 heure et à usage unique. Soumettez à nouveau le formulaire ci-dessous pour recevoir un nouveau lien.</p>
            </div>
          </div>
        )}
        {(deleteError === 'invalid' || deleteError === 'server') && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-8">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">Une erreur s'est produite.</p>
              <p className="text-xs text-red-700 mt-0.5">Réessayez ou contactez-nous à <strong>contact@edl-diagnostic-erp.fr</strong>.</p>
            </div>
          </div>
        )}

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">1. Responsable du traitement</h2>
            <ul className="space-y-1 pl-4">
              <li><strong>Société :</strong> EDL &amp; DIAGNOSTIC SAS</li>
              <li><strong>RCS :</strong> Brest n° 832 877 179</li>
              <li><strong>Siège :</strong> 60 Allée de Provence, 29280 Plouzané, France</li>
              <li><strong>Contact DPO :</strong> contact@edl-diagnostic-erp.fr</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">2. Données collectées et traitées</h2>
            <p className="mb-3">Dans le cadre du service de génération d'ERP, les données suivantes sont traitées :</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Catégorie</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Données</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Finalité</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Obligatoire</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border border-gray-200 font-medium">Adresse du bien</td>
                    <td className="p-2.5 border border-gray-200">Adresse complète, coordonnées GPS, code INSEE, références cadastrales</td>
                    <td className="p-2.5 border border-gray-200">Interrogation des bases Géorisques, IGN, BAN pour générer l'ERP</td>
                    <td className="p-2.5 border border-gray-200">Oui</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 border border-gray-200 font-medium">Paiement</td>
                    <td className="p-2.5 border border-gray-200">Données de carte bancaire (traitées et stockées exclusivement par Stripe — non accessibles par EDL &amp; DIAGNOSTIC SAS)</td>
                    <td className="p-2.5 border border-gray-200">Traitement du paiement sécurisé (19,99 € TTC)</td>
                    <td className="p-2.5 border border-gray-200">Oui</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-gray-200 font-medium">Adresse email</td>
                    <td className="p-2.5 border border-gray-200">Saisie librement par l'utilisateur sur la page de confirmation</td>
                    <td className="p-2.5 border border-gray-200">Envoi du lien de re-téléchargement du document ERP (180 jours)</td>
                    <td className="p-2.5 border border-gray-200">Non — optionnel</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 border border-gray-200 font-medium">Document ERP généré</td>
                    <td className="p-2.5 border border-gray-200">Contenu complet du document (adresse, risques détectés, références cadastrales, date, référence unique)</td>
                    <td className="p-2.5 border border-gray-200">Stockage temporaire côté serveur (si email fourni) et dans le navigateur (localStorage) pour accès depuis l'appareil</td>
                    <td className="p-2.5 border border-gray-200">Oui (fonctionnement)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-gray-200 font-medium">Données de navigation</td>
                    <td className="p-2.5 border border-gray-200">Logs serveur Vercel (adresse IP, user-agent, pages consultées)</td>
                    <td className="p-2.5 border border-gray-200">Sécurité, débogage technique, statistiques agrégées</td>
                    <td className="p-2.5 border border-gray-200">Oui (technique)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">Aucun compte utilisateur n'est créé. Aucune donnée d'identité civile (nom, prénom, adresse postale de l'acheteur) n'est collectée par le Site.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">3. Base légale des traitements</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong>Exécution du contrat (art. 6.1.b RGPD) :</strong> traitement de l'adresse du bien et génération de l'ERP, prise en charge du paiement</li>
              <li><strong>Intérêt légitime (art. 6.1.f RGPD) :</strong> logs de navigation à des fins de sécurité et de maintenance technique</li>
              <li><strong>Consentement (art. 6.1.a RGPD) :</strong> envoi du document par email (uniquement si l'utilisateur saisit volontairement son adresse email)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">4. Durées de conservation</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong>Document ERP (serveur) :</strong> 180 jours après génération, si un email a été fourni — suppression automatique à l'échéance</li>
              <li><strong>Document ERP (navigateur) :</strong> stocké dans le localStorage de l'appareil de l'utilisateur ; aucune limitation côté serveur — l'utilisateur peut effacer ces données via les paramètres de son navigateur</li>
              <li><strong>Adresse email :</strong> 180 jours, associée à la référence de commande, puis suppression</li>
              <li><strong>Données de paiement :</strong> non conservées par EDL &amp; DIAGNOSTIC SAS — gérées par Stripe selon leur propre politique de conservation (7 ans pour les obligations comptables)</li>
              <li><strong>Logs de navigation :</strong> 12 mois maximum (obligation légale LCEN)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">5. Sous-traitants et destinataires</h2>
            <p>Les données sont transmises uniquement aux sous-traitants techniques suivants, qui agissent sur instruction d'EDL &amp; DIAGNOSTIC SAS et dans le strict cadre de leur mission :</p>
            <ul className="mt-2 space-y-2 pl-4 list-disc">
              <li><strong>Stripe, Inc.</strong> (San Francisco, USA) — traitement des paiements par carte bancaire. Transfert encadré par les clauses contractuelles types de la Commission européenne. Politique : stripe.com/fr/privacy</li>
              <li><strong>Resend, Inc.</strong> (USA) — envoi des emails transactionnels (lien de re-téléchargement). Transfert encadré par les clauses contractuelles types.</li>
              <li><strong>Vercel, Inc.</strong> (San Francisco, USA) — hébergement du Site et des fonctions serverless, stockage temporaire des documents ERP (KV store). Transfert encadré par les clauses contractuelles types. Politique : vercel.com/legal/privacy-policy</li>
              <li><strong>Géorisques / BRGM, BAN, IGN</strong> — API publiques de l'État français consultées lors de la génération de l'ERP. L'adresse du bien est transmise à ces services pour obtenir les données de risques. Ces entités sont soumises à leurs propres politiques de confidentialité.</li>
            </ul>
            <p className="mt-3 font-medium text-navy-900">Aucune donnée n'est vendue, louée ou cédée à des tiers à des fins publicitaires ou commerciales.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">6. Stockage local (localStorage)</h2>
            <p>Le Site utilise le <strong>localStorage</strong> de votre navigateur (et non des cookies) pour stocker localement sur votre appareil l'historique des ERP générés (jusqu'à 20 documents). Ce stockage est purement local, n'est pas transmis à nos serveurs et ne nécessite pas de consentement au titre de la directive ePrivacy.</p>
            <p className="mt-2">Vous pouvez supprimer ces données à tout moment depuis les paramètres de votre navigateur ("Vider les données du site").</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">7. Cookies</h2>
            <p>Le Site n'utilise <strong>aucun cookie publicitaire, analytique ou de traçage tiers</strong>. Les seuls cookies déposés sont ceux strictement nécessaires au fonctionnement de la session de paiement Stripe (cookie de session sécurisée, durée limitée à la transaction).</p>
            <p className="mt-2">Aucun bandeau de consentement aux cookies n'est requis pour les cookies strictement nécessaires.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">8. Vos droits (RGPD)</h2>
            <p>Conformément aux articles 15 à 21 du RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li><strong>Accès :</strong> obtenir une copie des données vous concernant traitées par EDL &amp; DIAGNOSTIC SAS</li>
              <li><strong>Rectification :</strong> faire corriger des données inexactes ou incomplètes</li>
              <li><strong>Effacement :</strong> demander la suppression de vos données ("droit à l'oubli"), dans les limites des obligations légales de conservation</li>
              <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine</li>
              <li><strong>Opposition :</strong> vous opposer à un traitement fondé sur l'intérêt légitime</li>
              <li><strong>Limitation :</strong> demander la suspension temporaire d'un traitement contesté</li>
              <li><strong>Retrait du consentement :</strong> retirer à tout moment votre consentement à la réception d'emails, sans affecter la validité du traitement antérieur</li>
            </ul>
            <p className="mt-3 mb-5">Pour les droits d'accès, rectification, portabilité et opposition, contactez : <strong>contact@edl-diagnostic-erp.fr</strong> — Réponse garantie sous 30 jours.</p>

            {/* Formulaire droit à l'effacement */}
            <div className="border border-gray-200 rounded-xl p-5 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="h-4 w-4 text-red-500 shrink-0" />
                <p className="font-semibold text-gray-900 text-sm">Supprimer toutes mes données</p>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Entrez l'adresse email utilisée lors de votre commande. Vous recevrez un email de confirmation avec un lien valable <strong>1 heure</strong>. Un clic sur ce lien supprimera définitivement tous vos ERPs et données associées de nos serveurs.
              </p>

              {deletionStatus === 'sent' ? (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Email envoyé — vérifiez votre boîte mail.</p>
                    <p className="text-xs text-green-700 mt-0.5">Si un compte existe pour cette adresse, vous recevrez un lien de confirmation dans quelques instants. Pensez à vérifier vos spams.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestDeletion} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="votre@email.fr"
                    value={deletionEmail}
                    onChange={e => setDeletionEmail(e.target.value)}
                    disabled={deletionStatus === 'sending'}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={deletionStatus === 'sending' || !deletionEmail}
                    className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                  >
                    {deletionStatus === 'sending'
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Envoi…</>
                      : <><Trash2 className="h-3.5 w-3.5" /> Demander la suppression</>
                    }
                  </button>
                </form>
              )}

              {deletionStatus === 'error' && (
                <p className="text-xs text-red-600 mt-2">{deletionErrorMsg}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">9. Sécurité</h2>
            <p>EDL &amp; DIAGNOSTIC SAS met en place les mesures techniques et organisationnelles suivantes :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>Chiffrement HTTPS (TLS 1.2+) sur l'ensemble des échanges</li>
              <li>Aucun stockage de données bancaires sur nos serveurs (délégation intégrale à Stripe, certifié PCI DSS niveau 1)</li>
              <li>Accès aux données restreint aux seuls services tiers strictement nécessaires</li>
              <li>Hébergement sur infrastructure Vercel avec isolation des données par environnement</li>
              <li>Documents ERP stockés temporairement avec référence aléatoire (UUID), sans lien avec l'identité de l'acheteur en l'absence d'email</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">10. Réclamation auprès de la CNIL</h2>
            <p>Si vous estimez que vos droits ne sont pas respectés après avoir contacté EDL &amp; DIAGNOSTIC SAS, vous pouvez introduire une réclamation auprès de l'autorité de contrôle française :</p>
            <ul className="mt-2 space-y-1 pl-4">
              <li><strong>CNIL</strong> — Commission Nationale de l'Informatique et des Libertés</li>
              <li>3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
              <li>www.cnil.fr — Formulaire en ligne disponible sur le site</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">11. Modification de la politique</h2>
            <p>La présente politique peut être mise à jour pour refléter les évolutions du service ou de la réglementation. La date de dernière mise à jour est indiquée en haut de page. En cas de modification substantielle, les utilisateurs ayant fourni leur email seront informés.</p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 px-4 mt-16">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400">
          <p>© 2026 EDL&amp;DIAGNOSTIC · <button onClick={() => navigate('/mentions-legales')} className="hover:text-white underline">Mentions légales</button> · <button onClick={() => navigate('/cgu')} className="hover:text-white underline">CGU / CGV</button></p>
        </div>
      </footer>
    </div>
  );
}
