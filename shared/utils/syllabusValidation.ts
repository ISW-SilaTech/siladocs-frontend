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
  sizeLooksReasonable: boolean;
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

const MIN_REASONABLE_SIZE_BYTES = 5 * 1024; // un sílabo real rara vez pesa menos de 5 KB
const DRAFT_CONFIDENCE_THRESHOLD = 60;

// Combina los 3 filtros solicitados:
//  1) nombre de archivo contiene el código del curso
//  2) el contenido del documento referencia el curso (vía /syllabi/analyze, ya consultado)
//  3) heurística de "esto parece un documento real de sílabo" (tamaño/formato)
// y produce un único porcentaje de confianza para el usuario.
export const evaluateSyllabusHeuristics = (params: {
  fileName: string;
  fileSize: number;
  courseCode: string;
  contentAnalysis?: { isMatch: boolean; confidence: number } | null;
}): SyllabusHeuristicResult => {
  const { fileName, fileSize, courseCode, contentAnalysis } = params;
  const { filenameHasCourseCode } = checkFilenameHasCourseCode(fileName, courseCode);
  const contentHasCourseCode = contentAnalysis?.isMatch ?? false;
  const sizeLooksReasonable = fileSize >= MIN_REASONABLE_SIZE_BYTES;

  const filenameScore = filenameHasCourseCode ? 30 : 0;
  const contentScore = contentHasCourseCode ? 40 * Math.min(1, Math.max(0, contentAnalysis?.confidence ?? 1)) : 0;
  const sizeScore = sizeLooksReasonable ? 30 : 0;
  const aiConfidence = Math.round(filenameScore + contentScore + sizeScore);

  const reasons: string[] = [];
  if (!filenameHasCourseCode) reasons.push('El nombre del archivo no contiene el código del curso.');
  if (!contentHasCourseCode) reasons.push('No se detectó el código del curso dentro del contenido del documento.');
  if (!sizeLooksReasonable) reasons.push('El archivo es demasiado pequeño para ser un sílabo completo.');

  const isDraft = !filenameHasCourseCode || !contentHasCourseCode || aiConfidence < DRAFT_CONFIDENCE_THRESHOLD;

  return { filenameHasCourseCode, contentHasCourseCode, sizeLooksReasonable, aiConfidence, isDraft, reasons };
};
