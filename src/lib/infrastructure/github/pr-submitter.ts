import type { Question } from '../../domain/questions/question';
import type { QuestionSubmitter } from '../../ports/question-submitter';

export interface ConfigGitHub {
	owner: string;
	repo: string;
	branche: string;
}

/**
 * Adaptateur GitHub : ouvre l'éditeur web pré-rempli, qui crée une PR.
 * Aucune OAuth côté application : l'utilisateur est déjà connecté à GitHub
 * dans son navigateur (pattern repris d'INDICATE).
 *
 * Chaque proposition est un fichier dédié sous data/propositions/<rfe>/ :
 * la PR a un diff minimal, et la consolidation dans le fichier de la RFE
 * se fait à la relecture (manuellement au MVP, script CI envisageable).
 */
export class GitHubPrSubmitter implements QuestionSubmitter {
	constructor(private readonly config: ConfigGitHub) {}

	urlSoumission(rfe: string, question: Question): string {
		const chemin = `data/propositions/${rfe}/${question.id}.json`;
		const contenu = JSON.stringify(question, null, 2);
		const parametres = new URLSearchParams({ filename: chemin, value: contenu });
		return `https://github.com/${this.config.owner}/${this.config.repo}/new/${this.config.branche}?${parametres}`;
	}
}
