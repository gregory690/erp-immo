import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function CGU() {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-black text-navy-900 mb-2">Conditions Générales d'Utilisation et de Vente</h1>
        <p className="text-sm text-gray-400 mb-10">En vigueur au 1er janvier 2026 — Applicables à tout achat sur erp-immo.vercel.app</p>

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation et de Vente (CGU/CGV) régissent l'accès et l'utilisation du service de génération d'État des Risques et Pollutions (ERP) en ligne, proposé par EDL &amp; DIAGNOSTIC SAS, ainsi que tout achat réalisé sur le site erp-immo.vercel.app (ci-après "le Site").</p>
            <p className="mt-2">Toute utilisation du Site ou tout achat implique l'acceptation pleine, entière et sans réserve des présentes conditions. L'utilisateur est invité à les lire attentivement avant de passer commande.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">2. Description du service</h2>
            <p>EDL &amp; DIAGNOSTIC SAS met à disposition un outil numérique permettant de générer automatiquement un État des Risques et Pollutions (ERP) conforme à l'arrêté ministériel du 27 septembre 2022 (articles L125-5 et R125-26 du Code de l'Environnement).</p>
            <p className="mt-2">Le service fonctionne en quatre étapes :</p>
            <ol className="mt-2 space-y-1 pl-4 list-decimal">
              <li>Saisie de l'adresse du bien immobilier</li>
              <li>Confirmation de la localisation sur carte interactive et récupération automatique des références cadastrales (source : IGN)</li>
              <li>Interrogation automatique des bases de données officielles : Géorisques (BRGM), Base Adresse Nationale (BAN), IGN — pour calculer l'exposition aux risques naturels, technologiques, miniers, sismiques, radon, argiles, sites industriels (BASIAS/BASOL) et catastrophes naturelles</li>
              <li>Paiement sécurisé et mise à disposition immédiate du document au format PDF</li>
            </ol>
            <p className="mt-2">Le document généré est valable <strong>6 mois</strong> à compter de sa date d'établissement. Il est destiné à être complété, daté, paraphé et signé par le vendeur ou bailleur, puis annexé à tout avant-contrat ou contrat de location (art. L125-5 C. Env.).</p>
            <p className="mt-2 text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2"><strong>Important :</strong> ce document est une aide à la rédaction de l'ERP. Il appartient au vendeur ou bailleur de vérifier les informations, de compléter la section "Sinistres indemnisés" et d'apposer sa signature. EDL &amp; DIAGNOSTIC SAS n'est pas un diagnostiqueur immobilier certifié au sens de l'article L271-6 du CCH.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">3. Prix et paiement</h2>
            <p>Le prix du service est de <strong>19,99 € TTC (16,66 € HT, TVA 20%)</strong> par document généré. Ce tarif est affiché clairement avant tout achat et peut être modifié à tout moment ; le prix applicable est celui affiché au moment de la validation de la commande.</p>
            <p className="mt-2">Le paiement est effectué en ligne, exclusivement par carte bancaire (Visa, Mastercard, American Express), via la plateforme sécurisée <strong>Stripe</strong> (protocole 3D Secure, norme PCI DSS). Le paiement est débité immédiatement à la validation.</p>
            <p className="mt-2">Aucun abonnement, aucune reconduction tacite. Chaque document ERP fait l'objet d'un achat unitaire et indépendant. Aucune donnée bancaire n'est stockée par EDL &amp; DIAGNOSTIC SAS.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">4. Livraison du document</h2>
            <p>Le document ERP est disponible <strong>immédiatement</strong> après confirmation du paiement, sous forme de fichier PDF téléchargeable depuis la page de confirmation.</p>
            <p className="mt-2">Un email de confirmation contenant un lien de re-téléchargement est envoyé automatiquement à l'adresse email renseignée lors du paiement (via Stripe). Ce lien reste actif pendant <strong>6 mois</strong> à compter de la date de génération du document.</p>
            <p className="mt-2">Le document est également accessible via la fonction d'impression du navigateur ("Imprimer" ou "Télécharger en PDF"). En cas de problème technique lors du téléchargement, l'utilisateur est invité à contacter : <strong>notifications@edl-diagnostic-erp.fr</strong></p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">5. Droit de rétractation</h2>
            <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation de 14 jours <strong>ne s'applique pas</strong> aux contenus numériques fournis sur support immatériel dont l'exécution a commencé, avec l'accord préalable exprès du consommateur et sa renonciation à son droit de rétractation.</p>
            <p className="mt-2">En procédant au paiement, l'utilisateur reconnaît expressément accepter que le service soit fourni immédiatement après la confirmation de paiement, et renoncer en conséquence à son droit de rétractation.</p>
            <p className="mt-2">Toutefois, en cas de <strong>défaut avéré du service</strong> (document non généré, données manifestement erronées imputables au service), EDL &amp; DIAGNOSTIC SAS s'engage à examiner toute réclamation sous 48 heures ouvrées et à proposer, selon les cas, une correction ou un remboursement. Réclamations : <strong>notifications@edl-diagnostic-erp.fr</strong></p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">6. Obligations de l'utilisateur</h2>
            <p>L'utilisateur s'engage à :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>Fournir une adresse de bien exacte et complète afin d'obtenir un document correspondant au bien concerné</li>
              <li>Vérifier que l'adresse et la localisation sur carte sont correctes avant de passer à l'étape suivante</li>
              <li>Utiliser le document généré uniquement dans le cadre légal prévu (vente ou location d'un bien immobilier situé en France)</li>
              <li>Compléter le document (section sinistres, date, signature) avant de le remettre à un notaire, locataire ou acheteur</li>
              <li>Ne pas reproduire, revendre ou exploiter commercialement le service sans autorisation écrite préalable d'EDL &amp; DIAGNOSTIC SAS</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">7. Responsabilité et limites</h2>
            <p>Le service s'appuie exclusivement sur des données publiques officielles (Géorisques, BAN, IGN) mises à disposition par l'État français. EDL &amp; DIAGNOSTIC SAS ne saurait être tenu responsable :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>D'une erreur, d'un délai de mise à jour ou d'une indisponibilité des bases de données officielles</li>
              <li>D'une mauvaise utilisation du document par l'utilisateur (absence de signature, adresse incorrecte saisie par l'utilisateur, etc.)</li>
              <li>Du refus d'un notaire ou d'un tiers d'accepter le document, dès lors que celui-ci est conforme à l'arrêté du 27/09/2022</li>
              <li>D'une interruption temporaire du service pour maintenance ou cause extérieure (panne réseau, indisponibilité d'une API officielle)</li>
              <li>De l'évolution réglementaire postérieure à la date d'établissement du document</li>
            </ul>
            <p className="mt-2">La responsabilité d'EDL &amp; DIAGNOSTIC SAS est, en tout état de cause, limitée au montant payé pour la commande concernée.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">8. Propriété intellectuelle</h2>
            <p>Le Site, son interface, son code source, ses textes et son architecture sont la propriété exclusive d'EDL &amp; DIAGNOSTIC SAS et protégés par le droit d'auteur. Le document ERP généré, en tant que contenu issu de données publiques, est remis à l'utilisateur pour un usage strictement personnel et non commercial.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">9. Médiation des litiges</h2>
            <p>En cas de litige non résolu amiablement, l'utilisateur peut recourir gratuitement à un médiateur de la consommation. Réclamation préalable obligatoire : <strong>notifications@edl-diagnostic-erp.fr</strong></p>
            <p className="mt-2">Plateforme européenne de règlement en ligne des litiges (RLL) : <strong>https://ec.europa.eu/consumers/odr</strong></p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">10. Droit applicable et juridiction</h2>
            <p>Les présentes CGU/CGV sont soumises au droit français. En cas de litige persistant après tentative de médiation, les tribunaux compétents sont ceux du ressort du siège social d'EDL &amp; DIAGNOSTIC SAS (Brest, Finistère).</p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 px-4 mt-16">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400">
          <p>© 2026 EDL&amp;DIAGNOSTIC · <button onClick={() => navigate('/mentions-legales')} className="hover:text-white underline">Mentions légales</button> · <button onClick={() => navigate('/confidentialite')} className="hover:text-white underline">Politique de confidentialité</button></p>
        </div>
      </footer>
    </div>
  );
}
