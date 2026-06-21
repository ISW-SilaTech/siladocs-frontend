// Heurísticas de validación de sílabos ejecutadas 100% en el navegador.
// No reemplazan el análisis de contenido del backend (/syllabi/analyze);
// lo complementan con señales que sí podemos calcular sin una llamada extra.

export interface SyllabusFilenameCheck {
  filenameHasCourseCode: boolean;
  normalizedFileName: string;
  normalizedCourseCode: string;
}

export interface SyllabusHeuristicResult {
  filenameHasCourseCode: boolean;
  contentHasCourseCode: boolean;
  structureLooksReasonable: boolean;
  aiConfidence: number; // 0-100
  isDraft: boolean;
  reasons: string[];
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

// Filtro 1: el código del curso (ej. "MAT101") debe aparecer en el nombre del archivo.
export const checkFilenameHasCourseCode = (fileName: string, courseCode: string): SyllabusFilenameCheck => {
  const normalizedFileName = normalize(fileName);
  const normalizedCourseCode = normalize(courseCode);
  return {
    filenameHasCourseCode: normalizedCourseCode.length > 0 && normalizedFileName.includes(normalizedCourseCode),
    normalizedFileName,
    normalizedCourseCode,
  };
};

// Si todavía no se pudo extraer/analizar la estructura del PDF (p. ej. falló la
// lectura), se usa el tamaño como respaldo: un sílabo real rara vez pesa menos de 5 KB.
const MIN_REASONABLE_SIZE_BYTES = 5 * 1024;
const MIN_REASONABLE_STRUCTURE_SCORE = 40;
const DRAFT_CONFIDENCE_THRESHOLD = 60;

// Combina los 3 filtros solicitados:
//  1) nombre de archivo contiene el código del curso
//  2) el contenido del documento referencia el curso (vía /syllabi/analyze, ya consultado)
//  3) el documento contiene la estructura típica de un sílabo (secciones detectadas
//     por detectSyllabusStructure: sumilla, competencias, unidades, etc.), no su peso en bytes
// y produce un único porcentaje de confianza para el usuario.
export const evaluateSyllabusHeuristics = (params: {
  fileName: string;
  fileSize: number;
  courseCode: string;
  contentAnalysis?: { isMatch: boolean; confidence: number } | null;
  structureScore?: number | null;
}): SyllabusHeuristicResult => {
  const { fileName, fileSize, courseCode, contentAnalysis, structureScore } = params;
  const { filenameHasCourseCode } = checkFilenameHasCourseCode(fileName, courseCode);
  const contentHasCourseCode = contentAnalysis?.isMatch ?? false;
  const structureLooksReasonable = typeof structureScore === 'number'
    ? structureScore >= MIN_REASONABLE_STRUCTURE_SCORE
    : fileSize >= MIN_REASONABLE_SIZE_BYTES;

  const filenameScore = filenameHasCourseCode ? 30 : 0;
  const contentScore = contentHasCourseCode ? 40 * Math.min(1, Math.max(0, contentAnalysis?.confidence ?? 1)) : 0;
  const structureContributionScore = structureLooksReasonable ? 30 : 0;
  const aiConfidence = Math.round(filenameScore + contentScore + structureContributionScore);

  const reasons: string[] = [];
  if (!filenameHasCourseCode) reasons.push('El nombre del archivo no contiene el código del curso.');
  if (!contentHasCourseCode) reasons.push('No se detectó el código del curso dentro del contenido del documento.');
  if (!structureLooksReasonable) reasons.push('El documento no contiene la estructura típica de un sílabo (sumilla, competencias, unidades, etc.).');

  const isDraft = !filenameHasCourseCode || !contentHasCourseCode || aiConfidence < DRAFT_CONFIDENCE_THRESHOLD;

  return { filenameHasCourseCode, contentHasCourseCode, structureLooksReasonable, aiConfidence, isDraft, reasons };
};
