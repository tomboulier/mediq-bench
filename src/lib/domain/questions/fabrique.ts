import type { Question } from './question';
import { validerQuestion } from './validation';

/** Erreur levée quand une question ne respecte pas les règles métier. */
export class QuestionInvalideError extends Error {
	constructor(public readonly erreurs: string[]) {
		super(`Question invalide :\n- ${erreurs.join('\n- ')}`);
		this.name = 'QuestionInvalideError';
	}
}

/**
 * Fabrique une question après validation.
 * Point d'entrée unique : toute question du domaine est garantie valide.
 */
export function fabriquerQuestion(question: Question): Question {
	const erreurs = validerQuestion(question);
	if (erreurs.length > 0) {
		throw new QuestionInvalideError(erreurs);
	}
	return question;
}
