import type { Question } from '../domain/questions/question';
import type { StatutRelecture } from '../domain/relecture/statut';
import type { QuestionRepository } from '../ports/question-repository';

/** Filtres de consultation des questions. */
export interface FiltresQuestions {
	tag?: string;
	statut?: StatutRelecture;
}

/** Use case : consulte les questions d'une RFE, avec filtres optionnels. */
export async function consulterQuestions(
	repository: QuestionRepository,
	rfe: string,
	filtres: FiltresQuestions = {}
): Promise<Question[]> {
	let questions = await repository.listerQuestions(rfe);
	if (filtres.tag) {
		questions = questions.filter((q) => q.tags.includes(filtres.tag!));
	}
	if (filtres.statut) {
		questions = questions.filter((q) => q.statut === filtres.statut);
	}
	return questions;
}

/** Use case : liste les RFE disponibles. */
export function listerRfe(repository: QuestionRepository): Promise<string[]> {
	return repository.listerRfe();
}
