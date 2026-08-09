import { describe, expect, it } from 'vitest';
import { GitHubPrSubmitter } from './pr-submitter';
import type { Question } from '../../domain/questions/question';

const submitter = new GitHubPrSubmitter({
	owner: 'tomboulier',
	repo: 'mediq-bench',
	branche: 'dev'
});

const question: Question = {
	id: 'q-abc-123',
	titre: 'PTH standard',
	type: 'ouverte',
	question: 'Texte ?',
	reponse: 'Céfazoline',
	auteur: 'Dr Test',
	creeLe: '2026-08-09T00:00:00.000Z',
	statut: 'draft',
	references: [{ titre: 'RFE', url: 'https://sfar.org/rfe' }],
	tags: ['orthopédie']
};

describe('GitHubPrSubmitter', () => {
	it('construit une URL vers l’éditeur GitHub sur la branche dev', () => {
		const url = submitter.urlSoumission('antibioprophylaxie', question);
		expect(url.startsWith('https://github.com/tomboulier/mediq-bench/new/dev?')).toBe(true);
	});

	it('propose un fichier par question sous data/propositions/<rfe>/', () => {
		const url = new URL(submitter.urlSoumission('antibioprophylaxie', question));
		expect(url.searchParams.get('filename')).toBe(
			'data/propositions/antibioprophylaxie/q-abc-123.json'
		);
	});

	it('pré-remplit le contenu JSON de la question', () => {
		const url = new URL(submitter.urlSoumission('antibioprophylaxie', question));
		const contenu = JSON.parse(url.searchParams.get('value')!);
		expect(contenu.id).toBe('q-abc-123');
		expect(contenu.titre).toBe('PTH standard');
	});
});
