import type { Question } from '../../domain/questions/question';
import type { QuestionRepository } from '../../ports/question-repository';

/**
 * Adaptateur de lecture : les fichiers JSON de data/ sont embarqués dans le
 * bundle au build (décision d'architecture §5). Le site reflète toujours la
 * dernière release publiée, jamais de questions non approuvées.
 */
const fichiers = import.meta.glob('../../../../data/*.json', {
	eager: true,
	import: 'default'
}) as Record<string, Question[]>;

function nomRfe(chemin: string): string {
	return chemin.split('/').pop()!.replace(/\.json$/, '');
}

export class BundledRepository implements QuestionRepository {
	async listerRfe(): Promise<string[]> {
		return Object.keys(fichiers).map(nomRfe).sort();
	}

	async listerQuestions(rfe: string): Promise<Question[]> {
		const entree = Object.entries(fichiers).find(([chemin]) => nomRfe(chemin) === rfe);
		return entree ? entree[1] : [];
	}
}
