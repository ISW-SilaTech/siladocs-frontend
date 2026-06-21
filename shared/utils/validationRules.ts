// Reglas de validación configurables por coordinadores/administradores para el
// primer filtro de estructura de sílabos (ver syllabusStructure.ts). Se
// persisten en localStorage porque el backend aún no expone un endpoint
// para esta configuración; el shape ya está listo para migrar a una API.

export interface ValidationRule {
  id: string;
  name: string;
  keywords: string[];
  required: boolean;
  weight: number; // 0-100, puntos que aporta a la barra de "Precisión del validador"
}

const STORAGE_KEY = 'silabos:validationRules';

export const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  { id: 'sumilla', name: 'Sumilla', keywords: ['sumilla', 'descripcion del curso', 'descripción del curso'], required: true, weight: 17 },
  { id: 'competencias', name: 'Competencias / Objetivos', keywords: ['competencias', 'objetivos del curso', 'resultados de aprendizaje'], required: true, weight: 17 },
  { id: 'unidades', name: 'Unidades / Contenidos', keywords: ['unidad', 'unidades', 'contenidos tematicos', 'contenidos temáticos'], required: true, weight: 17 },
  { id: 'metodologia', name: 'Metodología', keywords: ['metodologia', 'metodología', 'estrategias de ensenanza', 'estrategias de enseñanza'], required: true, weight: 16 },
  { id: 'evaluacion', name: 'Sistema de Evaluación', keywords: ['evaluacion', 'evaluación', 'sistema de evaluacion', 'sistema de evaluación'], required: true, weight: 16 },
  { id: 'bibliografia', name: 'Bibliografía', keywords: ['bibliografia', 'bibliografía', 'referencias bibliograficas', 'referencias bibliográficas'], required: true, weight: 17 },
];

export const newRuleId = (): string =>
  `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const getValidationRules = (): ValidationRule[] => {
  if (typeof window === 'undefined') return DEFAULT_VALIDATION_RULES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VALIDATION_RULES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VALIDATION_RULES;
    return parsed;
  } catch {
    return DEFAULT_VALIDATION_RULES;
  }
};

export const saveValidationRules = (rules: ValidationRule[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

export const requiredWeightTotal = (rules: ValidationRule[]): number =>
  rules.filter((r) => r.required).reduce((sum, r) => sum + (Number(r.weight) || 0), 0);
