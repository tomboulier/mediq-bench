import type { Reference } from '../references/reference';
import type { StatutRelecture } from '../relecture/statut';

/**
 * Une question clinique du dataset.
 * Clés en français (spec 02, §6). Union discriminée sur `type` :
 * - ouverte : réponse en texte libre (matching exact au benchmark)
 * - qcm : réponse = lettre du choix correct
 */
export type TypeQuestion = 'ouverte' | 'qcm';

interface CommunQuestion {
	id: string;
	titre: string;
	question: string;
	auteur: string;
	creeLe: string; // date ISO 8601
	statut: StatutRelecture;
	references: Reference[];
	tags: string[];
}

export interface QuestionOuverte extends CommunQuestion {
	type: 'ouverte';
	reponse: string;
}

export interface QuestionQcm extends CommunQuestion {
	type: 'qcm';
	choix: string[];
	reponse: string; // lettre du choix correct (A, B, C…)
}

export type Question = QuestionOuverte | QuestionQcm;
