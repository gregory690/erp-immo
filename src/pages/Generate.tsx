import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { AddressSearch } from '../components/form/AddressSearch';
import { AddressConfirmation } from '../components/form/AddressConfirmation';
import { ServiceSelector } from '../components/form/ServiceSelector';
import { RiskSummaryTable } from '../components/report/RiskSummaryTable';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { getParcellesFromCoords, extractReferenceCadastrale } from '../services/cadastre.service';
import { buildRiskSummary, getGlobalRiskLevel } from '../utils/risk-aggregator';
import { createCheckoutSession } from '../services/stripe.service';

import type { BANFeature } from '../types/ban.types';
import type { ERPMode } from '../types/erp.types';
import type { ReferenceCadastrale } from '../services/cadastre.service';

interface AddressState {
  feature: BANFeature;
  lat: number;
  lng: number;
}

const STEPS = [
  { id: 1, label: 'Adresse', description: 'Recherche du bien' },
  { id: 2, label: 'Localisation', description: 'Confirmation sur carte' },
  { id: 3, label: 'Risques', description: 'Calcul des expositions' },
  { id: 4, label: 'Service', description: 'Choix de la formule' },
];

const RISK_LABELS: Record<string, string> = {
  ppr: 'PPR — Plans de prévention',
  catnat: 'Catastrophes naturelles',
  sis: 'Secteurs d\'information des sols',
  sismique: 'Zonage sismique',
  radon: 'Potentiel radon',
  argiles: 'Retrait-gonflement argiles',
  basias: 'Anciens sites industriels',
  basol: 'Sites et sols pollués',
};

export default function Generate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [addressState, setAddressState] = useState<AddressState | null>(null);
  const [cadastre, setCadastre] = useState<ReferenceCadastrale | null>(null);
  const [cadastreLoading, setCadastreLoading] = useState(false);
  const [cadastreError, setCadastreError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ERPMode | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { loading, progress, document: erpDocument, error, calculate } = useRiskCalculation();

  async function fetchCadastre(lng: number, lat: number) {
    setCadastreLoading(true);
    setCadastreError(null);
    try {
      const response = await getParcellesFromCoords(lng, lat);
      const ref = extractReferenceCadastrale(response);
      setCadastre(ref);
    } catch {
      setCadastreError('Références cadastrales non disponibles automatiquement');
      setCadastre(null);
    } finally {
      setCadastreLoading(false);
    }
  }

  function handleAddressSelected(feature: BANFeature) {
    const [lng, lat] = feature.geometry.coordinates;
    setAddressState({ feature, lat, lng });
  }

  async function goToStep2() {
    if (!addressState) return;
    setStep(2);
    (window as any).plausible?.('Étape 2 — Adresse saisie');
    await fetchCadastre(addressState.lng, addressState.lat);
  }

  function handleCoordsChange(coords: { lat: number; lng: number }) {
    if (!addressState) return;
    setAddressState(prev => prev ? { ...prev, lat: coords.lat, lng: coords.lng } : null);
    fetchCadastre(coords.lng, coords.lat);
  }

  async function goToStep3() {
    if (!addressState) return;
    setStep(3);
    (window as any).plausible?.('Étape 3 — Position confirmée');
    await calculate({
      adresse_complete: addressState.feature.properties.label,
      code_insee: addressState.feature.properties.citycode,
      code_postal: addressState.feature.properties.postcode,
      commune: addressState.feature.properties.city,
      lat: addressState.lat,
      lng: addressState.lng,
      cadastre,
      mode: 'edition', // will be updated in step 4
    });
  }

  async function handleConfirm() {
    if (!addressState || !selectedMode || !erpDocument) return;
    setPaymentError(null);
    setPaymentLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession({
        erp_reference: erpDocument.metadata.reference, // UUID complet — clé KV et URL de retour
        adresse: addressState.feature.properties.label,
        commune: addressState.feature.properties.city,
        erpDocument,
      });
      (window as any).plausible?.('Paiement initié');
      // Redirection vers la page de paiement Stripe
      window.location.href = checkoutUrl;
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : 'Erreur de connexion au service de paiement'
      );
      setPaymentLoading(false);
    }
  }

  const riskSummary = erpDocument ? buildRiskSummary(erpDocument.risques, erpDocument.catnat) : [];
  const globalRisk = erpDocument ? getGlobalRiskLevel(riskSummary) : null;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
          <span className="font-bold text-navy-900 text-sm">
            <span className="hidden sm:inline">EDL&DIAGNOSTIC · </span>Génération ERP
          </span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 pb-28 sm:pb-8">
        {/* Stepper */}
        <div className="max-w-lg mx-auto mb-5 sm:mb-8">
          <div className="grid grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center relative">
                {/* Left connector */}
                {i > 0 && (
                  <div className={`absolute left-0 right-1/2 top-[18px] h-0.5 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
                {/* Right connector */}
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-1/2 right-0 top-[18px] h-0.5 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
                {/* Circle */}
                <div
                  className={`relative z-10 h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                    step > s.id
                      ? 'bg-green-600 text-white shadow-green-200'
                      : step === s.id
                      ? 'bg-navy-900 text-white shadow-navy-200 ring-4 ring-navy-900/10'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                {/* Label */}
                <p className={`mt-1.5 text-[10px] sm:text-xs font-semibold leading-tight text-center ${step === s.id ? 'text-navy-900' : step > s.id ? 'text-green-700' : 'text-gray-400'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Address Search */}
        {step === 1 && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Saisissez l'adresse du bien</CardTitle>
              <CardDescription>
                Entrez l'adresse complète. La recherche se fait automatiquement via la Base Adresse Nationale.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              <AddressSearch
                onAddressSelected={handleAddressSelected}
                placeholder="Ex: 12 rue de la Paix, 75001 Paris"
              />

              {addressState && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      {addressState.feature.properties.label}
                    </p>
                    <p className="text-xs text-green-700">
                      Code INSEE : {addressState.feature.properties.citycode}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">Sélectionné</Badge>
                </div>
              )}

              {/* Desktop CTA */}
              <Button
                onClick={goToStep2}
                disabled={!addressState}
                className="w-full hidden sm:flex bg-edl-700 hover:bg-edl-800"
                size="lg"
              >
                Confirmer l'adresse
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sticky mobile CTA — Step 1 */}
        {step === 1 && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-30 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
            <Button
              onClick={goToStep2}
              disabled={!addressState}
              className="w-full bg-edl-700 hover:bg-edl-800"
              size="lg"
            >
              Confirmer l'adresse
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2 — Map Confirmation */}
        {step === 2 && addressState && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Confirmez la localisation</CardTitle>
              <CardDescription>
                Vérifiez la position du marqueur sur la carte. Faites-le glisser pour affiner la localisation.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              <AddressConfirmation
                lat={addressState.lat}
                lng={addressState.lng}
                adresse={addressState.feature.properties.label}
                commune={addressState.feature.properties.city}
                codePostal={addressState.feature.properties.postcode}
                codeInsee={addressState.feature.properties.citycode}
                cadastre={cadastre ? {
                  section: cadastre.section,
                  numero: cadastre.numero,
                  departement: cadastre.departement,
                  identifiant: cadastre.identifiant,
                } : null}
                cadastreLoading={cadastreLoading}
                cadastreError={cadastreError}
                onCoordsChange={handleCoordsChange}
                onRetryCadastre={() => fetchCadastre(addressState.lng, addressState.lat)}
              />

              {/* Desktop CTA */}
              <div className="hidden sm:flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
                <Button
                  onClick={goToStep3}
                  className="flex-1 bg-edl-700 hover:bg-edl-800 disabled:opacity-60"
                  size="lg"
                  disabled={cadastreLoading}
                >
                  {cadastreLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Chargement…</>
                  ) : (
                    <>Calculer les risques<ChevronRight className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sticky mobile CTA — Step 2 */}
        {step === 2 && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-30 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
              <Button
                onClick={goToStep3}
                className="flex-1 bg-edl-700 hover:bg-edl-800 disabled:opacity-60"
                size="lg"
                disabled={cadastreLoading}
              >
                {cadastreLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Chargement…</>
                ) : (
                  <>Calculer les risques<ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Risk Calculation */}
        {step === 3 && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Calcul des risques en cours…</CardTitle>
              <CardDescription>
                Interrogation des bases de données officielles Géorisques (BRGM)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(RISK_LABELS).map(([key, label]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                        progress[key as keyof typeof progress]
                          ? 'bg-green-50 text-green-800'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {progress[key as keyof typeof progress] ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                      <span className="text-xs">{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Erreur lors du calcul</p>
                    <p className="text-sm text-red-700">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-red-300 text-red-700"
                      onClick={goToStep3}
                    >
                      Réessayer
                    </Button>
                  </div>
                </div>
              )}

              {erpDocument && !loading && (
                <div className="space-y-4 animate-fade-in">
                  <div className={`p-4 rounded-lg border text-center ${
                    globalRisk === 'high' ? 'bg-red-50 border-red-200' :
                    globalRisk === 'medium' ? 'bg-orange-50 border-orange-200' :
                    globalRisk === 'low' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      {riskSummary.filter(r => r.expose).length} risque(s) identifié(s) sur {riskSummary.length} analysés
                    </p>
                    <Badge variant={
                      globalRisk === 'high' ? 'danger' :
                      globalRisk === 'medium' || globalRisk === 'low' ? 'warning' : 'success'
                    }>
                      {globalRisk === 'high' ? '⚠️ Exposition importante' :
                       globalRisk === 'medium' ? '⚠️ Exposition modérée' :
                       globalRisk === 'low' ? 'Exposition faible' : '✅ Peu exposé'}
                    </Badge>
                  </div>

                  <RiskSummaryTable items={riskSummary} />

                  {/* Desktop CTA */}
                  <div className="hidden sm:flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Retour
                    </Button>
                    <Button
                      onClick={() => { setSelectedMode('edition'); setStep(4); }}
                      className="flex-1 bg-edl-700 hover:bg-edl-800"
                      size="lg"
                    >
                      Finaliser mon ERP
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Service Selection */}
        {step === 4 && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Téléchargez votre ERP</CardTitle>
              <CardDescription>
                Paiement sécurisé par Stripe — vous serez redirigé vers la page de paiement.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              <ServiceSelector
                selected={selectedMode}
                onSelect={setSelectedMode}
                onConfirm={handleConfirm}
              />

              {/* Payment loading overlay */}
              {paymentLoading && (
                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Redirection vers Stripe…</p>
                    <p className="text-xs text-blue-700">Création de votre session de paiement sécurisée</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-blue-400 ml-auto" />
                </div>
              )}

              {/* Payment error */}
              {paymentError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Erreur de paiement</p>
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Desktop back */}
              <Button
                variant="ghost"
                className="w-full hidden sm:flex text-sm text-gray-500"
                onClick={() => setStep(3)}
                disabled={paymentLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour aux résultats
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sticky mobile CTA — Step 3 (only when results loaded) */}
        {step === 3 && erpDocument && !loading && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-30 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
              <Button
                onClick={() => { setSelectedMode('edition'); setStep(4); }}
                className="flex-1 bg-edl-700 hover:bg-edl-800"
                size="lg"
              >
                Finaliser mon ERP
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Sticky mobile CTA — Step 4 */}
        {step === 4 && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-30 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
            <Button
              onClick={handleConfirm}
              disabled={!selectedMode || paymentLoading}
              size="lg"
              className="w-full bg-edl-700 hover:bg-edl-800 font-semibold"
            >
              {paymentLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirection…</>
              ) : (
                <>Obtenir mon ERP officiel · 19,99 €</>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs text-gray-400 mt-1 h-8"
              onClick={() => setStep(3)}
              disabled={paymentLoading}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Retour aux résultats
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
