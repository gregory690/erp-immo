import { useState } from 'react';
import { Download, Printer, Clock, MapPin, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { RiskSummaryTable } from './RiskSummaryTable';
import { CatNatHistory } from './CatNatHistory';
import { PrescriptionsSection } from './PrescriptionsSection';
import { buildRiskSummary } from '../../utils/risk-aggregator';
import { formatERPReference } from '../../utils/erp-validator';
import { generatePDFFromElement, generateERPFilename, printERPDocument } from '../../services/pdf.service';
import type { ERPDocument } from '../../types/erp.types';

interface ERPPreviewProps {
  document: ERPDocument;
  onNew?: () => void;
  demoMode?: boolean;
  emailSent?: boolean;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function ERPPreview({ document: erp, onNew, demoMode = false, emailSent = false }: ERPPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [showNewERPWarning, setShowNewERPWarning] = useState(false);
  const riskSummary = buildRiskSummary(erp.risques, erp.catnat);
  const exposedCount = riskSummary.filter(r => r.expose).length;
  const totalCount = riskSummary.length;

  async function handleDownload() {
    setDownloading(true);
    try {
      await generatePDFFromElement('erp-document-preview', generateERPFilename(erp));
      setHasDownloaded(true);
    } finally {
      setDownloading(false);
    }
  }

  function handleNewERP() {
    if (!hasDownloaded && !emailSent) {
      setShowNewERPWarning(true);
      return;
    }
    onNew?.();
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">ERP généré avec succès</span>
          </div>
          <div className="flex items-start gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 no-print">
            <span className="text-sm">⚠️ <strong>Ce document doit être daté, signé et paraphé par le vendeur ou bailleur</strong> avant annexion au contrat (art. L125-5 C. Env.).</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={printERPDocument}>
            <Printer className="h-4 w-4 mr-1" />
            Imprimer
          </Button>
          <Button
            size="sm"
            className="bg-edl-700 hover:bg-edl-800"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-1" />
            {downloading ? 'Génération...' : 'Télécharger PDF'}
          </Button>
          {onNew && (
            <Button variant="outline" size="sm" onClick={handleNewERP}>
              Nouvel ERP
            </Button>
          )}
        </div>
      </div>

      {/* Avertissement si le user clique "Nouvel ERP" sans avoir sauvegardé */}
      {showNewERPWarning && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 no-print">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-900 text-sm mb-1">
              Vous n'avez pas encore sauvegardé votre ERP !
            </p>
            <p className="text-sm text-red-800 mb-3">
              Téléchargez le PDF ou entrez votre email ci-dessus avant de continuer — sinon vous perdrez définitivement ce document.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="bg-edl-700 hover:bg-edl-800 text-white"
                onClick={() => { setShowNewERPWarning(false); handleDownload(); }}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Télécharger d'abord
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => { setShowNewERPWarning(false); onNew?.(); }}
              >
                Continuer sans sauvegarder
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-500"
                onClick={() => setShowNewERPWarning(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ERP Document */}
      <div
        id="erp-document-preview"
        className="erp-document bg-white border border-border rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-navy-900 text-white px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-navy-200 mb-1">
                Ministère de la Transition Écologique
              </p>
              <h1 className="text-xl font-bold">
                ÉTAT DES RISQUES ET POLLUTIONS
              </h1>
              <p className="text-sm text-navy-200 mt-1">
                Conformément à l'arrêté du 27 septembre 2022
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-navy-300">Référence</p>
              <p className="font-mono text-sm font-semibold">
                {formatERPReference(erp.metadata.reference)}
              </p>
            </div>
          </div>

          {/* Validity banner */}
          <div className="mt-4 bg-white/10 rounded-lg px-4 py-2 flex items-center gap-3">
            <Clock className="h-4 w-4 text-yellow-300" />
            <div className="text-sm">
              <span className="text-white font-medium">Validité 6 mois — </span>
              <span className="text-navy-200">
                Établi le {formatDate(erp.metadata.date_realisation)} · Expire le {formatDate(erp.metadata.validite_jusqu_au)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Section I — Identification du bien */}
          <section>
            <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b-2 border-navy-900 pb-2 mb-4">
              Section I — Identification du bien
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-navy-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Adresse du bien</p>
                    <p className="text-sm font-semibold text-gray-900">{erp.bien.adresse_complete}</p>
                    <p className="text-sm text-gray-700">{erp.bien.code_postal} {erp.bien.commune}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-navy-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Références cadastrales</p>
                    <div className={`flex gap-2 mt-1 ${demoMode ? 'blur-sm select-none pointer-events-none' : ''}`}>
                      <Badge variant="outline" className="font-mono">
                        Section {erp.bien.references_cadastrales.section || 'N/R'}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        N° {erp.bien.references_cadastrales.numero || 'N/R'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-dashed border-border">
                  <span className="text-gray-500">Code INSEE</span>
                  <span className="font-mono font-medium">{erp.bien.code_insee}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-border">
                  <span className="text-gray-500">Latitude</span>
                  <span className={`font-mono ${demoMode ? 'blur-sm select-none' : ''}`}>{erp.bien.coordonnees.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-border">
                  <span className="text-gray-500">Longitude</span>
                  <span className={`font-mono ${demoMode ? 'blur-sm select-none' : ''}`}>{erp.bien.coordonnees.lng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-border">
                  <span className="text-gray-500">Version réglementaire</span>
                  <span className="text-xs">Arrêté 27/09/2022</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section II — Synthèse des risques */}
          <section>
            <div className="flex items-center justify-between border-b-2 border-navy-900 pb-2 mb-4">
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide">
                Section II — Synthèse des risques
              </h2>
              <Badge
                variant={exposedCount === 0 ? 'success' : exposedCount > 3 ? 'danger' : 'warning'}
                className="text-xs"
              >
                {exposedCount}/{totalCount} risques détectés
              </Badge>
            </div>

            <Tabs defaultValue="tableau" className="no-print">
              <TabsList className="mb-4 h-auto flex-wrap w-full justify-start gap-1">
                <TabsTrigger value="tableau">Tableau de synthèse</TabsTrigger>
                <TabsTrigger value="catnat">
                  CatNat ({erp.catnat.length})
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  Prescriptions ({erp.prescriptions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tableau">
                <RiskSummaryTable items={riskSummary} />
              </TabsContent>

              <TabsContent value="catnat">
                <CatNatHistory arretes={erp.catnat} />
              </TabsContent>

              <TabsContent value="prescriptions">
                <PrescriptionsSection prescriptions={erp.prescriptions} />
              </TabsContent>
            </Tabs>

            {/* Print version — always visible */}
            <div className="print-only hidden">
              <RiskSummaryTable items={riskSummary} />
            </div>
          </section>

          {/* Section III — Historique sinistres */}
          <section>
            <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b-2 border-navy-900 pb-2 mb-4">
              Section III — Déclaration des sinistres indemnisés
            </h2>
            <div className="bg-slate-50 rounded-lg p-4 border border-dashed border-slate-300">
              <p className="text-sm text-gray-700 mb-4">
                À compléter par le vendeur/bailleur : Avez-vous connaissance de sinistres indemnisés
                au titre des catastrophes naturelles ou technologiques pour ce bien ?
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="sinistres" value="non" className="h-4 w-4" defaultChecked />
                  <span className="text-sm">
                    À ma connaissance, ce bien n'a pas subi de sinistre ayant donné lieu à indemnisation.
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="sinistres" value="oui" className="h-4 w-4" />
                  <span className="text-sm">
                    Des sinistres ont été déclarés (détailler ci-dessous)
                  </span>
                </label>
              </div>
              <div className="mt-3 h-16 border border-dashed border-gray-300 rounded bg-white" />
            </div>
          </section>

          {/* Section V — Signature */}
          <section className="relative">
            <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b-2 border-navy-900 pb-2 mb-4">
              Section V — Déclaration et signature
            </h2>
            {demoMode && (
              <div className="absolute inset-0 top-10 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 font-medium italic">Section complétée et signée par le vendeur / bailleur</p>
              </div>
            )}
            <p className="text-sm text-gray-700 mb-4">
              Je soussigné(e) certifie avoir complété le présent formulaire en tenant compte des
              informations disponibles sur <strong>www.georisques.gouv.fr</strong> et des informations
              communales disponibles à la date d'établissement.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nom / Prénom</p>
                  <div className="h-8 border-b border-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Qualité</p>
                  <div className="h-8 border-b border-gray-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Fait à — le {formatDate(erp.metadata.date_realisation)}
                  </p>
                  <div className="h-8 border-b border-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Signature</p>
                  <div className="h-16 border border-dashed border-gray-300 rounded" />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <footer className="text-xs text-gray-500 space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
              <p className="font-semibold mb-1">Responsabilité du vendeur / bailleur</p>
              <p>
                Ce document constitue une aide à la rédaction de l'État des Risques et Pollutions (ERP). Il
                incombe au vendeur ou bailleur de vérifier les informations, de compléter les sections manquantes
                (sinistres déclarés, section V), de <strong>dater, parapher et signer</strong> le présent
                formulaire avant de l'annexer au compromis de vente ou au contrat de bail, conformément à
                l'article L125-5 du Code de l'Environnement.
              </p>
            </div>
            <div className="text-center text-gray-400 space-y-0.5 pt-1">
              <p>Document généré via EDL&amp;DIAGNOSTIC ERP — Source officielle : georisques.gouv.fr</p>
              <p>Référence : {formatERPReference(erp.metadata.reference)} — Conforme à l'arrêté du 27 septembre 2022</p>
              <p>Données issues de Géorisques, BRGM, BAN et IGN — Valable 6 mois à compter de la date d'établissement</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
