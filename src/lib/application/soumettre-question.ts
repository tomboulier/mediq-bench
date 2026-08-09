import type { Question } from '../domain/questions/question';
import type { QuestionSubmitter } from '../ports/question-submitter';

/**
 * Use case : obtient l'URL de soumission d'une question.
 * L'URL ouvre l'éditeur de la plateforme git, pré-rempli avec le JSON.
 */
export function soumettreQuestion(
	submitter: QuestionSubmitter,
	rfe: string,
	question: Question
): string {
	return submitter.urlSoumission(rfe, question);
}
