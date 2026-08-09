import type { Question } from '../domain/questions/question';

/** Port de soumission d'une nouvelle question (vers la plateforme git). */
export interface QuestionSubmitter {
	/** Construit l'URL de soumission pré-remplie pour une question. */
	urlSoumission(rfe: string, question: Question): string;
}
