// Detección de la estructura mínima que la institución exige en un sílabo.
// Corre sobre el texto ya extraído del PDF (ver pdfText.ts) y es el primer
// filtro que el docente ve, antes de elegir curso o de subir el archivo.

export interface RequiredSection {
  key: string;
  label: string;
  // Variantes en las que suele aparecer el encabezado en sílabos reales.
  keywords: string[];
}

export const REQUIRED_SYLLABUS_SECTIONS: RequiredSection[] = [
  { key: 'sumilla', label: 'Sumilla', keywords: ['sumilla', 'descripcion del curso', 'descripción del curso'] },
  { key: 'competencias', label: 'Competencias / Objetivos', keywords: ['competencias', 'objetivos del curso', 'resultados de aprendizaje'] },
  { key: 'unidades', label: 'Unidades / Contenidos', keywords: ['unidad', 'unidades', 'contenidos tematicos', 'contenidos temáticos'] },
  { key: 'metodologia', label: 'Metodología', keywords: ['metodologia', 'metodología', 'estrategias de ensenanza', 'estrategias de enseñanza'] },
  { key: 'evaluacion', label: 'Sistema de Evaluación', keywords: ['evaluacion', 'evaluación', 'sistema de evaluacion', 'sistema de evaluación'] },
  { key: 'bibliografia', label: 'Bibliografía', keywords: ['bibliografia', 'bibliografía', 'referencias bibliograficas', 'referencias bibliográficas'] },
];

export interface DetectedSection extends RequiredSection {
  found: boolean;
  matchedKeyword: string | null;
}

export interface SyllabusStructureResult {
  sections: DetectedSection[];
  foundCount: number;
  totalCount: number;
  structureScore: number; // 0-100
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const detectSyllabusStructure = (rawText: string): SyllabusStructureResult => {
  const normalizedText = normalize(rawText);

  const sections: DetectedSection[] = REQUIRED_SYLLABUS_SECTIONS.map((section) => {
    const matchedKeyword = section.keywords.find((keyword) => normalizedText.includes(normalize(keyword))) ?? null;
    return { ...section, found: matchedKeyword !== null, matchedKeyword };
  });

  const foundCount = sections.filter((s) => s.found).length;
  const totalCount = sections.length;
  const structureScore = Math.round((foundCount / totalCount) * 100);

  return { sections, foundCount, totalCount, structureScore };
};
