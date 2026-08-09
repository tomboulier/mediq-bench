import type { QuestionRepository } from '../ports/question-repository';
import type { QuestionSubmitter } from '../ports/question-submitter';
import { GitHubPrSubmitter } from './github/pr-submitter';
import { BundledRepository } from './github/raw-repository';

/**
 * Composition racine : câblage des adaptateurs, sans framework d'injection.
 * Migration GitLab SFAR : écrire les adaptateurs GitLab et modifier ici.
 */
export const repository: QuestionRepository = new BundledRepository();

export const submitter: QuestionSubmitter = new GitHubPrSubmitter({
	owner: 'tomboulier',
	repo: 'mediq-bench',
	branche: 'dev'
});
