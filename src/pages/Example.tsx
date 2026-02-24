import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ERPPreview } from '../components/report/ERPPreview';
import type { ERPDocument } from '../types/erp.types';

// Document ERP de démonstration — Nice (06000)
// Données représentatives d'un bien en zone à risques réels
const DEMO_ERP: ERPDocument = {
  metadata: {
    reference: 'demo-0000-0000-0000-000000000001',
    date_realisation: new Date('2024-02-15'),
    validite_jusqu_au: new Date('2024-08-15'),
    version_reglementaire: 'arrete_27092022',
    mode: 'edition',
  },
  bien: {
    adresse_complete: '15 Avenue Jean Médecin, 06000 Nice',
    code_insee: '06088',
    code_postal: '06000',
    commune: 'Nice',
    references_cadastrales: {
      section: 'BW',
      numero: '0124',
      departement: '06',
      feuille: '000BW01',
    },
    coordonnees: {
      lat: 43.704233,
      lng: 7.266891,
    },
  },
  risques: {
    ppr_naturels: [
      {
        exists: true,
        nom: 'PPR Inondation Vallée du Var',
        type_risque: 'Inondation',
        etat: 'APPROUVE',
        zone: 'Ri2 — Zone de risque inondation modérée',
        prescriptions: true,
      },
    ],
    ppr_technologiques: [],
    ppr_miniers: [],
    zonage_sismique: {
      niveau: 3,
      libelle: 'Modéré (zone 3)',
    },
    radon: {
      zone: 2,
      libelle: 'Potentiel radon significatif (catégorie 2)',
    },
    sis: {
      expose: false,
      references: [],
      secteurs: [],
    },
    argiles: {
      niveau: 'faible',
      code: 'B1',
      expose: true,
    },
    basias: [
      {
        identifiant: 'BSSS0600124',
        nom_usuel: 'Garage Collet Automobiles',
        raison_sociale: 'SARL COLLET AUTOMOBILES',
        adresse: '18 Avenue Jean Médecin, 06000 Nice',
        code_insee: '06088',
        commune: 'Nice',
        activite_principale: 'Réparation et commerce de véhicules automobiles',
        distance_metres: 85,
        statut_site: 'Activité terminée',
      },
    ],
    basol: [],
    recul_trait_cote: { applicable: true, expose: false, libelle: "Commune littorale — bien non situé en zone de recul" },
  },
  catnat: [
    {
      libRisqueJo: 'Inondations et coulées de boue',
      datDebutEvt: '1994-11-04',
      datFinEvt: '1994-11-10',
      datPubliArrete: '1994-12-15',
      codeInsee: '06088',
      nomCommune: 'Nice',
    },
    {
      libRisqueJo: 'Inondations, coulées de boue et mouvements de terrain',
      datDebutEvt: '2000-10-11',
      datFinEvt: '2000-10-14',
      datPubliArrete: '2000-12-29',
      codeInsee: '06088',
      nomCommune: 'Nice',
    },
    {
      libRisqueJo: 'Inondations et coulées de boue',
      datDebutEvt: '2015-10-03',
      datFinEvt: '2015-10-05',
      datPubliArrete: '2015-11-20',
      codeInsee: '06088',
      nomCommune: 'Nice',
    },
    {
      libRisqueJo: "Mouvements de terrain différentiels consécutifs à la sécheresse et à la réhydratation des sols",
      datDebutEvt: '2017-01-01',
      datFinEvt: '2017-12-31',
      datPubliArrete: '2021-10-01',
      codeInsee: '06088',
      nomCommune: 'Nice',
    },
  ],
  prescriptions: [
    {
      type: 'Constructibilité limitée',
      description:
        'En zone Ri2, les constructions nouvelles doivent intégrer des mesures de protection contre les inondations. Le premier plancher habitable doit être situé à 50 cm minimum au-dessus du terrain naturel.',
      page_reglement: 12,
    },
    {
      type: 'Diagnostic préalable obligatoire',
      description:
        "Tout projet de construction ou d'aménagement en zone de prescription doit faire l'objet d'une étude hydrogéologique préalable soumise à l'approbation du service instructeur.",
      page_reglement: 18,
    },
  ],
};

export default function Example() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-navy-700" />
            <span className="font-bold text-navy-900 text-sm">Exemple de document ERP</span>
          </div>
          <Button
            size="sm"
            className="bg-edl-700 hover:bg-edl-800"
            onClick={() => navigate('/generer')}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Générer le mien
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Bandeau exemple */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-navy-900 text-white rounded-xl px-5 py-4">
          <div className="flex-1">
            <p className="font-bold text-sm">Document d'exemple — à titre illustratif</p>
            <p className="text-xs text-navy-200 mt-0.5">
              Certains champs sont masqués. Votre ERP contiendra toutes les informations complètes
              relatives à votre bien. Données représentatives d'un bien à Nice (06000).
            </p>
          </div>
          <Button
            className="bg-edl-700 hover:bg-edl-800 shrink-0 font-semibold"
            onClick={() => navigate('/generer')}
          >
            Établir mon ERP — 9,99 €
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* ERP document en mode démo */}
        <ERPPreview document={DEMO_ERP} demoMode={true} />

        {/* CTA bas de page */}
        <div className="bg-edl-700 text-white rounded-xl px-5 py-6 text-center">
          <p className="font-bold text-base mb-1">Votre bien est-il exposé à ces risques ?</p>
          <p className="text-red-100 text-sm mb-4">
            Générez votre ERP en 2 minutes — données officielles, accepté par les notaires et agences.
          </p>
          <Button
            size="lg"
            className="bg-white text-edl-700 hover:bg-gray-100 font-bold"
            onClick={() => navigate('/generer')}
          >
            Établir mon état des risques — 9,99 €
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
