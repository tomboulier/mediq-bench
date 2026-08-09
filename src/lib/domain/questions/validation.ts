import { validerReference } from '../references/reference';
import type { Question, QuestionQcm } from './question';

/** Valide une question. Retourne la liste des erreurs (vide si valide). */
export function validerQuestion(question: Question): string[] {
	const erreurs: string[] = [];

	if (!question.id.trim()) erreurs.push("L'identifiant est obligatoire");
	if (!question.titre.trim()) erreurs.push('Le titre est obligatoire');
	if (!question.question.trim()) erreurs.push('Le texte de la question est obligatoire');
	if (!question.auteur.trim()) erreurs.push("Le nom de l'auteur est obligatoire");

	if (question.references.length === 0) {
		erreurs.push('Au moins une référence à une recommandation est obligatoire');
	}
	question.references.forEach((reference, index) => {
		validerReference(reference).forEach((e) => erreurs.push(`Référence ${index + 1} : ${e}`));
	});

	if (question.type === 'ouverte') {
		if (!question.reponse.trim()) erreurs.push('La réponse est obligatoire');
	} else {
		validerQcm(question, erreurs);
	}

	return erreurs;
}

function validerQcm(question: QuestionQcm, erreurs: string[]): void {
	if (question.choix.length < 2) {
		erreurs.push('Un QCM doit proposer au moins deux choix');
	}
	if (question.choix.some((choix) => !choix.trim())) {
		erreurs.push('Les choix du QCM ne peuvent pas être vides');
	}
	const lettresValides = question.choix.map((_, index) => String.fromCharCode(65 + index));
	if (!lettresValides.includes(question.reponse)) {
		erreurs.push(`La réponse d'un QCM doit être une lettre parmi : ${lettresValides.join(', ')}`);
	}
}
