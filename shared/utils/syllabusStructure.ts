// Detección de la estructura mínima que la institución exige en un sílabo.
// Corre sobre el texto ya extraído del PDF (ver pdfText.ts) y es el primer
// filtro que el docente ve, antes de elegir curso o de subir el archivo.
//
// Las reglas (secciones, palabras clave, peso, obligatoriedad) son
// configurables por un coordinador en "Configuración de Validación"
// (ver validationRules.ts); si no hay configuración guardada se usan las
// reglas por defecto de la institución.

import { ValidationRule, getValidationRules } from './validationRules';

export interface DetectedSection {
  key: string;
  label: string;
  keywords: string[];
  required: boolean;
  weight: number;
  found: boolean;
  matchedKeyword: string | null;
}

export interface SyllabusStructureResult {
  sections: DetectedSection[];
  foundCount: number;
  totalCount: number;
  structureScore: number; // 0-100, ponderado por el peso de cada regla obligatoria
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const detectSyllabusStructure = (
  rawText: string,
  rules: ValidationRule[] = getValidationRules()
): SyllabusStructureResult => {
  const normalizedText = normalize(rawText);

  const sections: DetectedSection[] = rules.map((rule) => {
    const matchedKeyword = rule.keywords.find((keyword) => normalizedText.includes(normalize(keyword))) ?? null;
    return {
      key: rule.id,
      label: rule.name,
      keywords: rule.keywords,
      required: rule.required,
      weight: rule.weight,
      found: matchedKeyword !== null,
      matchedKeyword,
    };
  });

  const foundCount = sections.filter((s) => s.found).length;
  const totalCount = sections.length;

  const requiredSections = sections.filter((s) => s.required);
  const requiredWeightTotal = requiredSections.reduce((sum, s) => sum + (s.weight || 0), 0);
  const earnedWeight = requiredSections.filter((s) => s.found).reduce((sum, s) => sum + (s.weight || 0), 0);
  const structureScore = requiredWeightTotal > 0
    ? Math.min(100, Math.round((earnedWeight / requiredWeightTotal) * 100))
    : Math.round((foundCount / Math.max(totalCount, 1)) * 100);

  return { sections, foundCount, totalCount, structureScore };
};
