import type { Question } from '../../domain/questions/question';
import type { QuestionSubmitter } from '../../ports/question-submitter';

export interface ConfigGitHub {
	owner: string;
	repo: string;
	/** Nom du formulaire d'issue (.github/ISSUE_TEMPLATE/…). */
	formulaire: string;
}

/**
 * Adaptateur GitHub : ouvre le formulaire d'issue de la plateforme, pré-rempli.
 *
 * Le contributeur ne voit ni JSON, ni branche, ni commit : une page de
 * formulaire déjà remplie, une case à cocher pour la licence, un bouton. Le
 * workflow `proposition-vers-pr.yml` convertit ensuite l'issue en pull request.
 *
 * Les paramètres d'URL portent les *identifiants* des champs du formulaire
 * (`id:` dans le YAML) : ils doivent rester alignés avec lui. Seuls les champs
 * `input` et `textarea` acceptent d'être pré-remplis, d'où l'absence de liste
 * déroulante dans le formulaire.
 */
export class GitHubIssueSubmitter implements QuestionSubmitter {
	constructor(private readonly config: ConfigGitHub) {}

	urlSoumission(rfe: string, question: Question): string {
		const champs: Record<string, string> = {
			template: this.config.formulaire,
			title: `[Proposition] ${question.titre}`,
			rfe,
			titre: question.titre,
			type: question.type,
			question: question.question,
			reponse: question.reponse,
			references: question.references.map((r) => `${r.titre} | ${r.url}`).join('\n'),
			tags: question.tags.join(', '),
			auteur: question.auteur
		};
		if (question.type === 'qcm') {
			champs.choix = question.choix.join('\n');
		}
		const parametres = new URLSearchParams(champs);
		return `https://github.com/${this.config.owner}/${this.config.repo}/issues/new?${parametres}`;
	}
}
