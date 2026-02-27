import { useState, useCallback } from 'react';
import { fetchAllRisks } from '../services/georisques.service';
import { buildERPDocument } from '../services/erp-calculator.service';
import type { ERPDocument, ERPMode } from '../types/erp.types';
import type { ReferenceCadastrale } from '../services/cadastre.service';

export interface RiskCalculationInput {
  adresse_complete: string;
  code_insee: string;
  code_postal: string;
  commune: string;
  lat: number;
  lng: number;
  cadastre: ReferenceCadastrale | null;
  mode: ERPMode;
}

export interface RiskCalculationState {
  loading: boolean;
  progress: {
    ppr: boolean;
    catnat: boolean;
    sis: boolean;
    sismique: boolean;
    radon: boolean;
    argiles: boolean;
    basias: boolean;
    basol: boolean;
  };
  document: ERPDocument | null;
  error: string | null;
}

const INITIAL_PROGRESS = {
  ppr: false,
  catnat: false,
  sis: false,
  sismique: false,
  radon: false,
  argiles: false,
  basias: false,
  basol: false,
};

export function useRiskCalculation() {
  const [state, setState] = useState<RiskCalculationState>({
    loading: false,
    progress: INITIAL_PROGRESS,
    document: null,
    error: null,
  });

  const calculate = useCallback(async (input: RiskCalculationInput) => {
    setState({
      loading: true,
      progress: INITIAL_PROGRESS,
      document: null,
      error: null,
    });

    // Simulate progressive loading states while Promise.allSettled runs
    const progressInterval = setInterval(() => {
      setState(prev => {
        const keys = Object.keys(prev.progress) as (keyof typeof INITIAL_PROGRESS)[];
        const nextKey = keys.find(k => !prev.progress[k]);
        if (!nextKey) {
          clearInterval(progressInterval);
          return prev;
        }
        return {
          ...prev,
          progress: { ...prev.progress, [nextKey]: true },
        };
      });
    }, 400);

    try {
      const results = await fetchAllRisks(input.lng, input.lat, input.code_insee);

      clearInterval(progressInterval);

      // Si l'endpoint principal Géorisques est indisponible, on bloque la génération
      // pour éviter de livrer un ERP vide (non conforme légalement)
      if (!results.resultats) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Le service Géorisques (georisques.gouv.fr) est temporairement indisponible. Les données de risques n\'ont pas pu être récupérées. Veuillez réessayer dans quelques minutes — vos informations ne sont pas perdues.',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        progress: {
          ppr: true,
          catnat: true,
          sis: true,
          sismique: true,
          radon: true,
          argiles: true,
          basias: true,
          basol: true,
        },
      }));

      const document = buildERPDocument({
        adresse_complete: input.adresse_complete,
        code_insee: input.code_insee,
        code_postal: input.code_postal,
        commune: input.commune,
        lat: input.lat,
        lng: input.lng,
        section: input.cadastre?.section ?? '',
        numero: input.cadastre?.numero ?? '',
        departement: input.cadastre?.departement,
        mode: input.mode,
        resultats: results.resultats,
        catnat: results.catnat,
        sis: results.sis,
        sismique: results.sismique,
        radon: results.radon,
        argiles: results.argiles,
        basias: results.basias,
        basol: results.basol,
      });

      // Persist to localStorage
      const history = getERPHistory();
      history.unshift(document);
      localStorage.setItem('erp_history', JSON.stringify(history.slice(0, 20)));

      setState({ loading: false, progress: { ppr: true, catnat: true, sis: true, sismique: true, radon: true, argiles: true, basias: true, basol: true }, document, error: null });
    } catch (err) {
      clearInterval(progressInterval);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erreur lors du calcul des risques',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, progress: INITIAL_PROGRESS, document: null, error: null });
  }, []);

  return { ...state, calculate, reset };
}

export function getERPHistory(): ERPDocument[] {
  try {
    const raw = localStorage.getItem('erp_history');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
