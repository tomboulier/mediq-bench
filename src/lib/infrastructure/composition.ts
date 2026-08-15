import type { QuestionRepository } from '../ports/question-repository';
import type { QuestionSubmitter } from '../ports/question-submitter';
import { GitHubIssueSubmitter } from './github/issue-submitter';
import { BundledRepository } from './github/raw-repository';

/**
 * Composition racine : câblage des adaptateurs, sans framework d'injection.
 * Migration GitLab SFAR : écrire les adaptateurs GitLab et modifier ici.
 */
export const repository: QuestionRepository = new BundledRepository();

export const submitter: QuestionSubmitter = new GitHubIssueSubmitter({
	owner: 'tomboulier',
	repo: 'mediq-bench',
	formulaire: 'proposition-question.yml'
});
