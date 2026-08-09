import { fabriquerQuestion } from '../domain/questions/fabrique';
import type { Question, TypeQuestion } from '../domain/questions/question';
import type { Reference } from '../domain/references/reference';

/** Données brutes issues du formulaire web. */
export interface DonneesFormulaire {
	titre: string;
	type: TypeQuestion;
	question: string;
	reponse: string; // texte libre (ouverte) ou lettre (qcm)
	choix?: string[]; // qcm uniquement
	auteur: string;
	references: Reference[];
	tags: string[];
}

/**
 * Use case : crée une question à partir des données du formulaire.
 * L'id est un UUID : contrairement à une numérotation séquentielle, il évite
 * les collisions entre contributeurs soumettant des PR en parallèle.
 * La question créée est en statut `draft`, validée par le domaine.
 */
export function creerQuestion(
	donnees: DonneesFormulaire,
	maintenant: () => Date = () => new Date()
): Question {
	const commun = {
		id: crypto.randomUUID(),
		titre: donnees.titre.trim(),
		question: donnees.question.trim(),
		auteur: donnees.auteur.trim(),
		creeLe: maintenant().toISOString(),
		statut: 'draft' as const,
		references: donnees.references,
		tags: donnees.tags
	};
	const question: Question =
		donnees.type === 'qcm'
			? {
					...commun,
					type: 'qcm',
					choix: (donnees.choix ?? []).map((choix) => choix.trim()),
					reponse: donnees.reponse.trim().toUpperCase()
				}
			: { ...commun, type: 'ouverte', reponse: donnees.reponse.trim() };
	return fabriquerQuestion(question);
}
