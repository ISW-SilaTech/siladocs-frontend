const STORAGE_KEY = 'silabos:validationScores';

type ScoreCache = Record<number, { score: number; filenameOk: boolean; contentOk: boolean; structureOk: boolean }>;

const read = (): ScoreCache => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const saveValidationScore = (
  syllabusId: number,
  score: number,
  checks: { filenameOk: boolean; contentOk: boolean; structureOk: boolean }
): void => {
  try {
    const cache = read();
    cache[syllabusId] = { score, ...checks };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable — silently ignore
  }
};

export const getValidationScore = (
  syllabusId: number
): { score: number; filenameOk: boolean; contentOk: boolean; structureOk: boolean } | null => {
  const cache = read();
  return cache[syllabusId] ?? null;
};
