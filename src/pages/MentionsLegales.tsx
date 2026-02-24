import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function MentionsLegales() {
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
        <h1 className="text-3xl font-black text-navy-900 mb-2">Mentions légales</h1>
        <p className="text-sm text-gray-400 mb-10">Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.</p>

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">1. Éditeur du service</h2>
            <p>Le service ERP en ligne accessible à l'adresse <strong>erp-immo.vercel.app</strong> est édité par :</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong>Raison sociale :</strong> EDL &amp; DIAGNOSTIC SAS</li>
              <li><strong>SIRET :</strong> 832 877 179</li>
              <li><strong>RCS :</strong> Brest n° 832 877 179</li>
              <li><strong>N° TVA intracommunautaire :</strong> FR13832877179</li>
              <li><strong>Siège social :</strong> 60 Allée de Provence, 29280 Plouzané, France</li>

              <li><strong>Email :</strong> contact@edl-diagnostic.fr</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">2. Directeur de la publication</h2>
            <p>Le directeur de la publication est <strong>Monsieur DAVID Florian</strong>, en qualité de représentant légal d'EDL &amp; DIAGNOSTIC SAS.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">3. Hébergement</h2>
            <p>Le service ERP en ligne est hébergé par :</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong>Société :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</li>
              <li><strong>Site web :</strong> https://vercel.com</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">4. Propriété intellectuelle</h2>
            <p>L'ensemble des contenus présents sur ce site (textes, graphismes, logotypes, icônes, images) est la propriété exclusive d'EDL &amp; DIAGNOSTIC SAS ou de ses partenaires. Toute reproduction, distribution, modification ou utilisation à des fins commerciales est interdite sans autorisation préalable écrite.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">5. Sources des données</h2>
            <p>Les données utilisées pour la génération des États des Risques et Pollutions proviennent exclusivement de bases de données publiques officielles :</p>
            <ul className="mt-3 space-y-1 pl-4 list-disc">
              <li>Géorisques — georisques.gouv.fr (BRGM / Ministère de la Transition écologique)</li>
              <li>Base Adresse Nationale — api-adresse.data.gouv.fr</li>
              <li>IGN — Géoportail (APICarto) — apicarto.ign.fr</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">6. Limitation de responsabilité</h2>
            <p>EDL &amp; DIAGNOSTIC SAS s'efforce de fournir des informations exactes et à jour. Cependant, la société ne peut garantir l'exactitude, l'exhaustivité ou l'actualité des données issues de bases tierces. L'utilisateur est seul responsable de l'usage qu'il fait des documents générés. Ce service ne se substitue pas à un conseil juridique professionnel.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">7. Droit applicable</h2>
            <p>Le présent site et ses conditions d'utilisation sont soumis au droit français. En cas de litige, les tribunaux compétents du ressort de Brest seront seuls compétents.</p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 px-4 mt-16">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400">
          <p>© 2026 EDL&amp;DIAGNOSTIC · <button onClick={() => navigate('/cgu')} className="hover:text-white underline">CGU / CGV</button> · <button onClick={() => navigate('/confidentialite')} className="hover:text-white underline">Politique de confidentialité</button></p>
        </div>
      </footer>
    </div>
  );
}
