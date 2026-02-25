import { useState } from 'react';
import { Download, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { generatePDFFromElement, generateERPFilename, printERPDocument } from '../../services/pdf.service';
import { formatERPReference } from '../../utils/erp-validator';
import type { ERPDocument, ERPRisques } from '../../types/erp.types';

interface ERPPreviewProps {
  document: ERPDocument;
  onNew?: () => void;
  demoMode?: boolean;
  emailSent?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Check({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-gray-800 text-[9px] font-black leading-none flex-shrink-0">
      {checked ? 'X' : '\u00A0'}
    </span>
  );
}

function OuiNon({ value }: { value: boolean }) {
  return (
    <span className="inline-flex items-center gap-3 text-[10px]">
      <span className="flex items-center gap-0.5"><Check checked={value} />&nbsp;Oui</span>
      <span className="flex items-center gap-0.5"><Check checked={!value} />&nbsp;Non</span>
    </span>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-300 border-b border-gray-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-900">
      {children}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-800 mb-1">
      <SectionHeader>{title}</SectionHeader>
      <div className="px-2 py-0.5 space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value, children }: { label: React.ReactNode; value?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[10px] text-gray-800 min-h-[16px]">
      <span className="flex-1 leading-relaxed">{label}</span>
      <div className="shrink-0 pt-0.5">{children ?? (value !== undefined && <OuiNon value={value} />)}</div>
    </div>
  );
}

function SubRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-gray-600 pl-3 leading-relaxed">{children}</div>
  );
}

function ZoneBox({ label, sub, checked }: { label: string; sub: string; checked: boolean }) {
  return (
    <span className="inline-flex flex-col items-center text-[9px] mr-3">
      <span className="flex items-center gap-0.5 font-medium">{label} <Check checked={checked} /></span>
      <span className="text-gray-500">{sub}</span>
    </span>
  );
}

function formatDateFr(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : new Date(d);
  if (isNaN(date.getTime())) return typeof d === 'string' ? d : '';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCatNatDate(s: string): string {
  if (!s) return '—';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function detectPPRNRisks(risques: ERPRisques) {
  const pprs = risques.ppr_naturels.filter(p => p.exists);
  const t = pprs.map(p => `${p.nom ?? ''} ${p.type_risque ?? ''}`).join(' ').toLowerCase();
  const inond = /inond/.test(t);
  const crue = /crue/.test(t);
  const nappe = /nappe/.test(t);
  const aval = /avalanche/.test(t);
  const cycl = /cyclone/.test(t);
  const mvt = /mouvement|glissement|effondrement/.test(t);
  const sech = /sécheresse|retrait.gonfl/.test(t);
  const feux = /feux|incendie|forêt/.test(t);
  const seis = /séisme|sismique/.test(t);
  const volc = /volcan/.test(t);
  const autres = pprs.length > 0 && !inond && !crue && !nappe && !aval && !cycl && !mvt && !sech && !feux && !seis && !volc;
  return { inond, crue, nappe, aval, cycl, mvt, sech, feux, seis, volc, autres };
}

function detectPPRTEffects(risques: ERPRisques) {
  const t = risques.ppr_technologiques.filter(p => p.exists).map(p => `${p.nom ?? ''} ${p.type_risque ?? ''}`).join(' ').toLowerCase();
  return {
    toxique: /toxique/.test(t),
    thermique: /thermique/.test(t),
    surpression: /surpression/.test(t),
  };
}

// ─── Page 1 : Résumé ─────────────────────────────────────────────────────────

function SummaryPage({ erp, demoMode }: { erp: ERPDocument; demoMode: boolean }) {
  const { bien, risques, catnat } = erp;
  const hasPPRN = risques.ppr_naturels.some(p => p.exists);
  const hasPPRM = risques.ppr_miniers.some(p => p.exists);
  const hasPPRT = risques.ppr_technologiques.some(p => p.exists);
  const totalPages = catnat.length > 0 ? 4 : 3;

  return (
    <div className="p-6 sm:p-8 font-sans text-sm">
      {/* En-tête */}
      <div className="flex items-start justify-between pb-3 mb-4 border-b-2 border-gray-900">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">EDL &amp; DIAGNOSTIC</p>
          <h1 className="text-lg font-black text-gray-900 uppercase leading-tight">État des Risques et Pollutions</h1>
          <h2 className="text-base font-bold text-gray-700 uppercase leading-tight">État des Nuisances Sonores Aériennes</h2>
          <p className="text-[10px] text-gray-400 mt-1">Conforme à l'arrêté du 27 septembre 2022</p>
        </div>
        <div className="text-right text-[10px] text-gray-500 space-y-0.5">
          <p className="font-mono font-bold text-gray-700 text-xs">{formatERPReference(erp.metadata.reference)}</p>
          <p>Établi le {formatDateFr(erp.metadata.date_realisation)}</p>
          <p className="font-semibold text-orange-600">Valide jusqu'au {formatDateFr(erp.metadata.validite_jusqu_au)}</p>
        </div>
      </div>

      {/* Adresse + cadastre */}
      <div className="text-center mb-5">
        <p className="text-base font-bold text-gray-900">{bien.adresse_complete}</p>
        <p className={`text-sm text-gray-600 ${demoMode ? 'blur-sm select-none' : ''}`}>
          Section&nbsp;{bien.references_cadastrales.section || 'N/R'} &nbsp;—&nbsp; N°&nbsp;{bien.references_cadastrales.numero || 'N/R'}
        </p>
      </div>

      {/* Table Information de commande */}
      <div className="border border-gray-800 mb-4 text-[11px]">
        <div className="bg-gray-200 text-center py-1 font-bold text-[11px] uppercase border-b border-gray-800 tracking-wide">
          Information de commande
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          <div className="p-2 space-y-1">
            <p><strong>Date de réalisation :</strong> {formatDateFr(erp.metadata.date_realisation)}</p>
            <p><strong>Valide jusqu'au :</strong> {formatDateFr(erp.metadata.validite_jusqu_au)}</p>
            <p><strong>Adresse :</strong> {bien.adresse_complete}</p>
            <p><strong>Cadastre :</strong></p>
            <div className={`flex gap-1 ${demoMode ? 'blur-sm select-none' : ''}`}>
              <span className="font-mono bg-gray-800 text-white text-[9px] px-1 py-0.5">{bien.code_insee?.slice(0, 5) || '00000'}</span>
              <span className="font-mono bg-gray-800 text-white text-[9px] px-1 py-0.5">000</span>
              <span className="font-mono bg-gray-800 text-white text-[9px] px-1 py-0.5">{bien.references_cadastrales.section || 'N/R'}</span>
              <span className="font-mono bg-gray-800 text-white text-[9px] px-1 py-0.5">{bien.references_cadastrales.numero || 'N/R'}</span>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <p><strong>Commune :</strong> {bien.commune}</p>
            <p><strong>Code postal :</strong> {bien.code_postal}</p>
            <p><strong>Code INSEE :</strong> {bien.code_insee}</p>
            <p><strong>Lat/Long :</strong> {bien.coordonnees.lat.toFixed(6)}, {bien.coordonnees.lng.toFixed(6)}</p>
          </div>
        </div>
      </div>

      {/* Résumé des risques */}
      <div className="border border-gray-800 text-[10px] mb-4">
        <div className="bg-gray-200 text-center py-1 font-bold text-[11px] uppercase border-b border-gray-800 tracking-wide">
          Résumé de l'état des risques
        </div>
        {/* Réglementaire */}
        <div className="bg-gray-100 text-center text-[9px] uppercase tracking-wide font-semibold py-0.5 border-b border-gray-300">
          Réglementaire
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-300 border-b border-gray-300">
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-800 text-white text-[9px] px-1 py-0.5 font-bold">RADON</span>
            <span>Niveau {risques.radon.zone}</span>
          </div>
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-800 text-white text-[9px] px-1 py-0.5 font-bold">SÉISME</span>
            <span>Niveau {risques.zonage_sismique.niveau}</span>
          </div>
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-800 text-white text-[9px] px-1 py-0.5 font-bold">PEB</span>
            <span>{risques.ensa?.en_zone_peb ? `Zone ${risques.ensa.zone_peb}` : 'Aucun'}</span>
          </div>
        </div>
        {/* Informatif ERPS */}
        <div className="bg-gray-100 text-center text-[9px] uppercase tracking-wide font-semibold py-0.5 border-b border-gray-300">
          Informatif : ERPS
        </div>
        <div className="grid grid-cols-4 divide-x divide-gray-300 border-b border-gray-300">
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-600 text-white text-[9px] px-1 py-0.5 font-bold">BASOL</span>
            <span>{risques.basol.length}</span>
          </div>
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-600 text-white text-[9px] px-1 py-0.5 font-bold">BASIAS</span>
            <span>{risques.basias.length}</span>
          </div>
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-600 text-white text-[9px] px-1 py-0.5 font-bold">SIS</span>
            <span>{risques.sis.expose ? 'Oui' : 'Non'}</span>
          </div>
          <div className="p-1.5 flex items-center gap-1">
            <span className="bg-gray-600 text-white text-[9px] px-1 py-0.5 font-bold">Argiles</span>
            <span className="capitalize">{risques.argiles.niveau}</span>
          </div>
        </div>
        {/* PPR rows */}
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="p-1.5 text-gray-600 w-28 border-r border-gray-300 align-top">Risque naturel</td>
              <td className="p-1.5">
                {hasPPRN
                  ? risques.ppr_naturels.filter(p => p.exists).map((p, i) => (
                    <span key={i} className="block">[{p.etat === 'APPROUVE' ? 'Approuvé' : p.etat === 'PRESCRIT' ? 'Prescrit' : 'Anticipé'}]&nbsp;
                      {p.type_risque ?? ''}&nbsp;{p.nom ?? ''}</span>
                  ))
                  : 'Aucun plan de prévention des risques naturel recensé sur cette commune'
                }
              </td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-1.5 text-gray-600 border-r border-gray-300 align-top">Risque minier</td>
              <td className="p-1.5">
                {hasPPRM
                  ? risques.ppr_miniers.filter(p => p.exists).map(p => p.nom ?? '').join(', ')
                  : 'Aucun plan de prévention des risques minier recensé sur cette commune'
                }
              </td>
            </tr>
            <tr>
              <td className="p-1.5 text-gray-600 border-r border-gray-300 align-top">
                Risque technologique
                {hasPPRT && <span className="block font-bold">Risque industriel</span>}
              </td>
              <td className="p-1.5">
                {hasPPRT
                  ? risques.ppr_technologiques.filter(p => p.exists).map((p, i) => (
                    <span key={i} className="block">[{p.etat === 'APPROUVE' ? 'Approuvé' : 'Prescrit'}]&nbsp;
                      {p.type_risque ?? ''}&nbsp;{p.nom ?? ''}</span>
                  ))
                  : 'Aucun plan de prévention des risques technologiques recensé sur cette commune'
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-[9px] text-gray-400 text-center pt-3 border-t border-gray-200">
        <p>Source officielle : georisques.gouv.fr · BAN · APICarto IGN</p>
        <p className="mt-3 font-semibold text-gray-500">1 / {totalPages}</p>
      </div>
    </div>
  );
}

// ─── Page 2 : Formulaire ERP officiel ─────────────────────────────────────────

function ERPFormPage({ erp }: { erp: ERPDocument }) {
  const { bien, risques, catnat } = erp;

  const pprn = risques.ppr_naturels;
  const hasPPRN = pprn.some(p => p.exists);
  const pprnPrescrit = pprn.some(p => p.exists && p.etat === 'PRESCRIT');
  const pprnAnticipe = pprn.some(p => p.exists && p.etat === 'ANTICIPE');
  const pprnApprouve = pprn.some(p => p.exists && p.etat === 'APPROUVE');
  const pprnPrescriptions = pprn.some(p => p.prescriptions);
  const pprnRisks = detectPPRNRisks(risques);

  const pprm = risques.ppr_miniers;
  const hasPPRM = pprm.some(p => p.exists);
  const pprmPrescrit = pprm.some(p => p.exists && p.etat === 'PRESCRIT');
  const pprmAnticipe = pprm.some(p => p.exists && p.etat === 'ANTICIPE');
  const pprmApprouve = pprm.some(p => p.exists && p.etat === 'APPROUVE');

  const pprt = risques.ppr_technologiques;
  const hasPPRT = pprt.some(p => p.exists);
  const pprtPrescritNonApprouve = pprt.some(p => p.exists && p.etat === 'PRESCRIT');
  const pprtApprouve = pprt.some(p => p.exists && p.etat === 'APPROUVE');
  const pprtEffets = detectPPRTEffects(risques);

  const sismNiv = risques.zonage_sismique.niveau;
  const totalPages = catnat.length > 0 ? 4 : 3;

  return (
    <div className="p-3 sm:p-4 font-sans text-gray-900">
      {/* Titre officiel */}
      <div className="text-center mb-1.5">
        <h2 className="text-[13px] font-black uppercase tracking-wide">État des Risques et Pollutions</h2>
        <p className="text-[9px] text-gray-600">Aléas naturels, miniers ou technologiques, sismicité, potentiel radon, sols pollués et nuisances sonores</p>
      </div>

      {/* Arrêté préfectoral */}
      <div className="border border-gray-800 mb-1.5 text-[10px]">
        <div className="bg-gray-200 px-2 py-0.5 text-[9px] font-bold border-b border-gray-800">
          Cet état est établi sur la base des informations mises à disposition par arrêté préfectoral
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-800 p-1">
          <div className="px-2"><span className="text-gray-500">N°</span> <span className="font-mono">NOR : TREP2224286A</span></div>
          <div className="px-2 text-center"><span className="text-gray-500">du</span> <span className="font-mono">27/09/2022</span></div>
          <div className="px-2"><span className="text-gray-500">Mis à jour le</span> <span className="font-mono">01/01/2023</span></div>
        </div>
      </div>

      {/* Adresse */}
      <div className="border border-gray-800 mb-1.5 text-[10px]">
        <div className="grid grid-cols-3 divide-x divide-gray-800">
          <div className="px-2 py-1">
            <span className="text-gray-500 font-semibold">2. Adresse ou parcelles</span>
            <div className="font-medium mt-0.5">{bien.adresse_complete}</div>
          </div>
          <div className="px-2 py-1">
            <span className="text-gray-500 font-semibold">Code postal ou INSEE</span>
            <div className="font-mono font-medium mt-0.5">{bien.code_postal}</div>
          </div>
          <div className="px-2 py-1">
            <span className="text-gray-500 font-semibold">Commune</span>
            <div className="font-medium mt-0.5">{bien.commune}</div>
          </div>
        </div>
      </div>

      {/* ─── PPRN ─── */}
      <Block title="Situation de l'immeuble au regard d'un plan de prévention des risques naturels (PPRN)">
        <Row label={<span>&gt; L'immeuble (ou au moins une parcelle) est situé dans le périmètre d'un PPR <strong>N</strong></span>} value={hasPPRN} />
        {hasPPRN && (
          <SubRow>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-0.5"><Check checked={pprnPrescrit} />&nbsp;Prescrit</span>
              <span className="flex items-center gap-0.5"><Check checked={pprnAnticipe} />&nbsp;Anticipé</span>
              <span className="flex items-center gap-0.5"><Check checked={pprnApprouve} />&nbsp;Approuvé</span>
              <span className="text-gray-500 ml-2">Date : {pprn.find(p => p.exists)?.nom?.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? '___________'}</span>
            </span>
          </SubRow>
        )}
        <SubRow>Si oui, les risques naturels pris en considération sont liés à :</SubRow>
        <div className="pl-3 grid grid-cols-4 gap-0.5 text-[10px]">
          {[
            ['inondation', pprnRisks.inond],
            ['crue torrentielle', pprnRisks.crue],
            ['remontée de nappe', pprnRisks.nappe],
            ['avalanches', pprnRisks.aval],
            ['cyclone', pprnRisks.cycl],
            ['mouvements de terrain', pprnRisks.mvt],
            ['sécheresse géotechnique', pprnRisks.sech],
            ['feux de forêt', pprnRisks.feux],
            ['séisme', pprnRisks.seis],
            ['volcan', pprnRisks.volc],
            ['autres', pprnRisks.autres],
          ].map(([label, checked]) => (
            <span key={String(label)} className="flex items-center gap-0.5">
              <Check checked={!!checked} />&nbsp;{label}
            </span>
          ))}
        </div>
        <Row label="Extraits des documents de référence → Cf: cartographies (www.georisques.gouv.fr)" />
        <Row label="&gt; L'immeuble est concerné par des prescriptions de travaux dans le règlement du PPRN" value={pprnPrescriptions} />
        <SubRow>Si oui, les travaux prescrits ont été réalisés&nbsp;
          <span className="inline-flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Oui</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Non</span>
          </span>
        </SubRow>
      </Block>

      {/* ─── PPRM ─── */}
      <Block title="Situation de l'immeuble au regard d'un plan de prévention des risques miniers (PPRM)">
        <Row label={<span>&gt; L'immeuble est situé dans le périmètre d'un PPR <strong>M</strong></span>} value={hasPPRM} />
        {hasPPRM && (
          <SubRow>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-0.5"><Check checked={pprmPrescrit} />&nbsp;prescrit</span>
              <span className="flex items-center gap-0.5"><Check checked={pprmAnticipe} />&nbsp;anticipé</span>
              <span className="flex items-center gap-0.5"><Check checked={pprmApprouve} />&nbsp;approuvé</span>
            </span>
          </SubRow>
        )}
        <SubRow>Si oui, les risques miniers pris en considération sont liés à :
          <span className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-0.5"><Check checked={hasPPRM} />&nbsp;mouvements de terrain</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;autres</span>
          </span>
        </SubRow>
        <Row label="Extraits des documents de référence → Cf: cartographies (www.georisques.gouv.fr)" />
        <Row label="&gt; L'immeuble est concerné par des prescriptions de travaux dans le règlement du PPRM" value={hasPPRM && pprm.some(p => p.prescriptions)} />
        <SubRow>Si oui, les travaux prescrits ont été réalisés&nbsp;
          <span className="inline-flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Oui</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Non</span>
          </span>
        </SubRow>
      </Block>

      {/* ─── PPRT ─── */}
      <Block title="Situation de l'immeuble au regard d'un plan de prévention des risques technologiques (PPRT)">
        <Row label="&gt; L'immeuble est situé dans le périmètre d'un PPR T prescrit et non encore approuvé" value={pprtPrescritNonApprouve} />
        <SubRow>Si oui, les risques technologiques pris en considération dans l'arrêté de prescription sont liés à :
          <span className="flex items-center gap-4 mt-0.5">
            <span className="flex items-center gap-0.5 font-medium"><Check checked={pprtEffets.toxique} />&nbsp;Effet toxique</span>
            <span className="flex items-center gap-0.5 font-medium"><Check checked={pprtEffets.thermique} />&nbsp;Effet thermique</span>
            <span className="flex items-center gap-0.5 font-medium"><Check checked={pprtEffets.surpression} />&nbsp;Effet de surpression</span>
          </span>
        </SubRow>
        <Row label="&gt; L'immeuble est situé dans le périmètre d'un PPR T approuvé" value={pprtApprouve} />
        <Row label="Extraits des documents de référence → Cf: cartographies (www.georisques.gouv.fr)" />
        <Row label="&gt; L'immeuble est situé en secteur d'expropriation ou de délaissement" value={false} />
        <Row label="L'immeuble est situé en zone de prescription" value={hasPPRT} />
        <div className="text-[9px] text-gray-600 pl-3 leading-relaxed">Si logement — travaux prescrits réalisés&nbsp;
          <span className="inline-flex items-center gap-2 text-[9px]">
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Oui</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Non</span>
          </span>
        </div>
        <div className="text-[9px] text-gray-600 pl-3 leading-relaxed">Si hors logement — information sur les risques (gravité, probabilité, cinétique) jointe à l'acte&nbsp;
          <span className="inline-flex items-center gap-2 text-[9px]">
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Oui</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Non</span>
          </span>
        </div>
      </Block>

      {/* ─── Sismique ─── */}
      <Block title="Situation de l'immeuble au regard du zonage sismique réglementaire">
        <div className="text-[10px] py-0.5">
          L'immeuble se situe dans une commune de sismicité classée en
        </div>
        <div className="flex items-start py-0.5">
          <ZoneBox label="zone 1" sub="Très faible" checked={sismNiv === 1} />
          <ZoneBox label="zone 2" sub="Faible" checked={sismNiv === 2} />
          <ZoneBox label="zone 3" sub="Modérée" checked={sismNiv === 3} />
          <ZoneBox label="zone 4" sub="Moyenne" checked={sismNiv === 4} />
          <ZoneBox label="zone 5" sub="Forte" checked={sismNiv === 5} />
        </div>
      </Block>

      {/* ─── SIS ─── */}
      <Block title="Information relative à la pollution des sols">
        <Row label="&gt; Le terrain est situé en secteur d'information sur les sols (SIS)" value={risques.sis.expose} />
        {risques.sis.expose && (
          <SubRow>Secteurs concernés : {risques.sis.secteurs.map(s => s.nomSite).join(', ')}</SubRow>
        )}
      </Block>

      {/* ─── Radon ─── */}
      <Block title="Situation de l'immeuble au regard du zonage réglementaire à potentiel radon">
        <Row label="&gt; L'immeuble se situe dans une commune à potentiel radon de niveau 3" value={risques.radon.zone === 3} />
        {risques.radon.zone !== 3 && (
          <SubRow>Potentiel radon de la commune : niveau {risques.radon.zone} ({risques.radon.zone === 1 ? 'Faible' : 'Moyen'})</SubRow>
        )}
      </Block>

      {/* ─── Sinistres ─── */}
      <Block title="Information relative aux sinistres indemnisés par l'assurance suite à une catastrophe naturelle, minière ou technologique">
        <Row label="&gt; L'information est mentionnée dans l'acte de vente">
          <span className="inline-flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Oui</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Non</span>
          </span>
        </Row>
      </Block>

      {/* ─── Signature ─── */}
      <div className="border border-gray-800 mt-0 text-[10px]" style={{ pageBreakInside: 'avoid' }}>
        <div className="grid grid-cols-3 divide-x divide-gray-800">
          <div className="p-2">
            <p className="font-semibold text-gray-600">Vendeur ou Bailleur</p>
            <div className="h-7 border-b border-gray-400 mt-3" />
          </div>
          <div className="p-2">
            <p className="font-semibold text-gray-600">Date / Lieu</p>
            <p className="mt-1">{formatDateFr(erp.metadata.date_realisation)} /</p>
            <div className="h-4 border-b border-gray-400 mt-1" />
          </div>
          <div className="p-2">
            <p className="font-semibold text-gray-600">Acquéreur ou Locataire</p>
            <div className="h-7 border-b border-gray-400 mt-3" />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 text-[8px] text-gray-400 text-center border-t border-gray-200">
        <p>Modèle État des risques, pollutions et sols en application des articles L.125-5, L.125-6 et L.125-7 du Code de l'environnement — Arrêté du 27 septembre 2022</p>
        <p className="mt-1 font-semibold text-gray-500">2 / {totalPages}</p>
      </div>
    </div>
  );
}

// ─── Page 3 : ENSA ────────────────────────────────────────────────────────────

function ENSAPage({ erp }: { erp: ERPDocument }) {
  const { bien, risques, catnat } = erp;
  const ensa = risques.ensa ?? { en_zone_peb: false, prescriptions_insonorisation: false };
  const totalPages = catnat.length > 0 ? 4 : 3;

  return (
    <div className="p-4 sm:p-6 font-sans text-gray-900">
      {/* Titre officiel */}
      <div className="text-center mb-3">
        <h2 className="text-[13px] font-black uppercase tracking-wide">État des Nuisances Sonores Aériennes</h2>
        <p className="text-[9px] text-gray-600 mt-0.5">
          Les zones de bruit des plans d'exposition au bruit constituent des servitudes d'urbanisme (art. L. 112-3 du code de l'urbanisme) et doivent à ce titre être notifiées à l'occasion de toute cession, location ou construction immobilière
        </p>
      </div>

      {/* Arrêté */}
      <div className="border border-gray-800 mb-2 text-[10px]">
        <div className="bg-gray-200 px-2 py-0.5 text-[9px] font-bold border-b border-gray-800">
          Cet état est établi sur la base des informations mises à disposition par arrêté préfectoral
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-800 p-1">
          <div className="px-2"><span className="text-gray-500">N°</span> <span className="font-mono">NOR : TREP2224286A</span></div>
          <div className="px-2 text-center"><span className="text-gray-500">du</span> <span className="font-mono">27/09/2022</span></div>
          <div className="px-2"><span className="text-gray-500">Mis à jour le</span> <span className="font-mono">01/01/2023</span></div>
        </div>
      </div>

      {/* Adresse */}
      <div className="border border-gray-800 mb-2 text-[10px]">
        <div className="grid grid-cols-3 divide-x divide-gray-800">
          <div className="px-2 py-1">
            <span className="text-gray-500 font-semibold">2. Adresse</span>
            <div className="font-medium mt-0.5">{bien.adresse_complete}</div>
          </div>
          <div className="px-2 py-1">
            <span className="text-gray-500 font-semibold">Code postal ou INSEE</span>
            <div className="font-mono font-medium mt-0.5">{bien.code_postal}</div>
          </div>
          <div className="px-2 py-1">
            <span className="text-gray-500 font-semibold">Commune</span>
            <div className="font-medium mt-0.5">{bien.commune}</div>
          </div>
        </div>
      </div>

      {/* ─── PEB ─── */}
      <Block title="Situation de l'immeuble au regard d'un ou plusieurs plans d'exposition au bruit (PEB)">
        <Row label="&gt; L'immeuble est situé dans le périmètre d'un PEB" value={ensa.en_zone_peb} />
        {ensa.en_zone_peb && (
          <SubRow>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Révisé</span>
              <span className="flex items-center gap-0.5"><Check checked={true} />&nbsp;Approuvé</span>
              <span className="text-gray-500 ml-2">Date : ___________</span>
            </span>
            <div className="mt-0.5">Si oui, nom de l'aérodrome : {ensa.nom_aerodrome ?? '____________________________________'}</div>
          </SubRow>
        )}
        {!ensa.en_zone_peb && (
          <SubRow>
            <span className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Révisé</span>
              <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Approuvé</span>
              <span className="ml-2">Date : ___________</span>
            </span>
            <div className="mt-0.5 text-gray-500">Si oui, nom de l'aérodrome : ____________________________________</div>
          </SubRow>
        )}
        <Row label="&gt; L'immeuble est concerné par des prescriptions de travaux d'insonorisation" value={ensa.prescriptions_insonorisation} />
        <SubRow>Si oui, les travaux prescrits ont été réalisés&nbsp;
          <span className="inline-flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Oui</span>
            <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;Non</span>
          </span>
        </SubRow>
      </Block>

      {/* ─── Zone de bruit ─── */}
      <Block title="Situation de l'immeuble au regard du plan d'exposition au bruit (PEB)">
        <div className="text-[10px] py-0.5">
          L'immeuble se situe dans une zone de bruit d'un plan d'exposition au bruit définie comme :
        </div>
        <div className="flex items-start py-0.5 flex-wrap gap-y-1">
          <ZoneBox label="NON" sub="Aucun" checked={!ensa.en_zone_peb} />
          <ZoneBox label="zone A¹" sub="Très forte" checked={ensa.zone_peb === 'A'} />
          <ZoneBox label="zone B²" sub="Forte" checked={ensa.zone_peb === 'B'} />
          <ZoneBox label="zone C³" sub="modérée" checked={ensa.zone_peb === 'C'} />
          <ZoneBox label="zone D⁴" sub="Faible" checked={ensa.zone_peb === 'D'} />
        </div>
        <div className="text-[9px] text-gray-500 mt-1 space-y-0.5">
          <p>¹ (intérieur de la courbe d'indice Lden 70)</p>
          <p>² (entre la courbe d'indice Lden 70 et une courbe choisie entre Lden 65 et 62)</p>
          <p>³ (entre la limite extérieure de la zone B et la courbe d'indice Lden choisi entre 57 et 55)</p>
          <p>⁴ (entre la limite extérieure de la zone C et la courbe d'indice Lden 50). Cette zone n'est obligatoire que pour les aérodromes mentionnés au I de l'article 1609 quatervicies A du code général des impôts.</p>
        </div>
      </Block>

      {/* ─── Documents de référence ─── */}
      <Block title="Documents de référence permettant la localisation de l'immeuble au regard des nuisances prises en compte">
        <div className="text-[10px] py-0.5 space-y-1">
          <p>Le plan d'exposition au bruit est consultable sur le site Internet du Géoportail de l'institut national de l'information géographique et forestière (I.G.N) à l'adresse suivante : <strong>https://www.geoportail.gouv.fr/</strong></p>
          <p>Le plan d'exposition au bruit de l'aérodrome de : _________________ peut être consulté à la mairie de la commune de : <strong>{bien.commune}</strong> où est sis l'immeuble.</p>
        </div>
      </Block>

      {/* Signature */}
      <div className="border border-gray-800 mt-1 text-[10px]">
        <div className="grid grid-cols-3 divide-x divide-gray-800">
          <div className="p-2">
            <p className="font-semibold text-gray-600">Vendeur ou Bailleur</p>
            <div className="h-10 border-b border-gray-400 mt-4" />
          </div>
          <div className="p-2">
            <p className="font-semibold text-gray-600">Date / Lieu</p>
            <p className="mt-1">{formatDateFr(erp.metadata.date_realisation)} /</p>
            <div className="h-6 border-b border-gray-400 mt-1" />
          </div>
          <div className="p-2">
            <p className="font-semibold text-gray-600">Acquéreur ou Locataire</p>
            <div className="h-10 border-b border-gray-400 mt-4" />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-3 text-[8px] text-gray-400 text-center border-t border-gray-200">
        <p>Information sur les nuisances sonores aériennes : <strong>https://www.ecologie.gouv.fr/</strong></p>
        <p className="mt-2 font-semibold text-gray-500">3 / {totalPages}</p>
      </div>
    </div>
  );
}

// ─── Page 4 : Déclaration CatNat ──────────────────────────────────────────────

function CatNatPage({ erp }: { erp: ERPDocument }) {
  const { bien, catnat } = erp;

  return (
    <div className="p-4 sm:p-6 font-sans text-gray-900">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[10px] text-gray-600 space-y-0.5">
          <p className="font-bold">Ministère du Développement Durable</p>
          <p>Préfecture : {bien.references_cadastrales.departement ? `Département ${bien.references_cadastrales.departement}` : '—'}</p>
          <p>Commune : {bien.commune}</p>
        </div>
        <div className="text-right text-[10px] text-gray-600">
          <p className="font-black text-[13px] text-gray-900 uppercase">Déclaration de sinistres indemnisés</p>
          <p>en application du IV de l'article L125-5 du Code de l'environnement</p>
        </div>
      </div>

      <div className="border border-gray-800 mb-4 text-[10px]">
        <div className="p-3">
          <p className="font-semibold text-gray-600 mb-1">Adresse de l'immeuble</p>
          <p className="font-bold text-base text-gray-900">{bien.adresse_complete}</p>
          <p className="text-gray-600">{bien.code_postal} {bien.commune}</p>
        </div>
      </div>

      <div className="border border-gray-800 mb-4 text-[10px]">
        <div className="grid grid-cols-2 divide-x divide-gray-800 border-b border-gray-800">
          <div className="px-3 py-2 font-semibold text-gray-700">Arrêtés de reconnaissance de l'état de catastrophes au profit de la commune</div>
          <div className="px-3 py-2 text-gray-700">
            <p className="font-semibold">Sinistres indemnisés dans le cadre d'une reconnaissance de l'état de catastrophe</p>
            <p className="mt-0.5">Cochez les cases OUI ou NON si, à votre connaissance, l'immeuble a fait l'objet d'une indemnisation suite à des dommages consécutifs à chacun des événements</p>
          </div>
        </div>
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-800">
              <th className="text-left p-1.5 border-r border-gray-400 font-semibold w-2/5">Catastrophe naturelle</th>
              <th className="text-center p-1.5 border-r border-gray-400 font-semibold">Début</th>
              <th className="text-center p-1.5 border-r border-gray-400 font-semibold">Fin</th>
              <th className="text-center p-1.5 border-r border-gray-400 font-semibold">Arrêté</th>
              <th className="text-center p-1.5 border-r border-gray-400 font-semibold">Jo du</th>
              <th className="text-center p-1.5 font-semibold">Indemnisation</th>
            </tr>
          </thead>
          <tbody>
            {catnat.map((a, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="p-1.5 border-r border-gray-300">{a.libelle_risque_jo}</td>
                <td className="p-1.5 border-r border-gray-300 text-center font-mono">{formatCatNatDate(a.date_debut_evt)}</td>
                <td className="p-1.5 border-r border-gray-300 text-center font-mono">{formatCatNatDate(a.date_fin_evt)}</td>
                <td className="p-1.5 border-r border-gray-300 text-center font-mono">{formatCatNatDate(a.date_publication_arrete)}</td>
                <td className="p-1.5 border-r border-gray-300 text-center font-mono">{a.date_publication_jo ? formatCatNatDate(a.date_publication_jo) : '—'}</td>
                <td className="p-1.5 text-center">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;OUI</span>
                    <span className="flex items-center gap-0.5"><Check checked={false} />&nbsp;NON</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="border border-gray-800 text-[10px]">
        <div className="grid grid-cols-3 divide-x divide-gray-800">
          <div className="p-3">
            <p className="font-semibold text-gray-600">Etabli le :</p>
            <p className="font-black text-sm mt-1">{formatDateFr(erp.metadata.date_realisation)}</p>
            <p className="mt-3 text-gray-600">Cachet / Signature en cas de prestataire ou mandataire</p>
            <div className="h-16 border border-dashed border-gray-300 mt-1 rounded" />
          </div>
          <div className="p-3">
            <p className="font-semibold text-gray-600">Nom du vendeur ou du bailleur</p>
            <div className="h-8 border-b border-gray-400 mt-4" />
          </div>
          <div className="p-3">
            <p className="font-semibold text-gray-600">Nom de l'acquéreur ou du locataire</p>
            <div className="h-8 border-b border-gray-400 mt-4" />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-3 text-[8px] text-gray-400 text-center border-t border-gray-200">
        <p>Pour en savoir plus, chacun peut consulter en préfecture ou en mairie, le dossier départemental sur les risques majeurs, le document d'information communal sur les risques majeurs et, sur internet, le site portail dédié à la prévention des risques majeurs : <strong>www.georisques.gouv.fr</strong></p>
        <p className="mt-2 font-semibold text-gray-500">4 / 4</p>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ERPPreview({ document: erp, onNew, demoMode = false, emailSent = false }: ERPPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [showNewERPWarning, setShowNewERPWarning] = useState(false);

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
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">ERP généré avec succès</span>
          </div>
          <div className="flex items-start gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
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
            {downloading ? 'Génération…' : 'Télécharger PDF'}
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
            <p className="font-bold text-red-900 text-sm mb-1">Vous n'avez pas encore sauvegardé votre ERP !</p>
            <p className="text-sm text-red-800 mb-3">
              Téléchargez le PDF ou entrez votre email ci-dessus avant de continuer.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="bg-edl-700 hover:bg-edl-800 text-white" onClick={() => { setShowNewERPWarning(false); handleDownload(); }}>
                <Download className="h-3.5 w-3.5 mr-1" /> Télécharger d'abord
              </Button>
              <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => { setShowNewERPWarning(false); onNew?.(); }}>
                Continuer sans sauvegarder
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-500" onClick={() => setShowNewERPWarning(false)}>Annuler</Button>
            </div>
          </div>
        </div>
      )}

      {/* Document ERP — 4 pages */}
      <div
        id="erp-document-preview"
        className="erp-document bg-white border border-border rounded-lg divide-y divide-gray-200"
      >
        {/* Page 1 — Résumé */}
        <SummaryPage erp={erp} demoMode={demoMode} />

        {/* Page 2 — Formulaire officiel ERP */}
        <div style={{ breakBefore: 'page' } as React.CSSProperties}>
          <ERPFormPage erp={erp} />
        </div>

        {/* Page 3 — ENSA */}
        <div style={{ breakBefore: 'page' } as React.CSSProperties}>
          <ENSAPage erp={erp} />
        </div>

        {/* Page 4 — CatNat (si applicable) */}
        {erp.catnat.length > 0 && (
          <div style={{ breakBefore: 'page' } as React.CSSProperties}>
            <CatNatPage erp={erp} />
          </div>
        )}
      </div>
    </div>
  );
}
