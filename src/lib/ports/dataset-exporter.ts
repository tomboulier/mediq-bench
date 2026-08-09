import type { Question } from '../domain/questions/question';

/**
 * Port d'export du dataset vers un format consommateur.
 * Post-MVP : adaptateurs vers le format du benchmark existant, HuggingFace, CodaBench…
 */
export interface DatasetExporter {
	exporter(questions: Question[]): string;
}
