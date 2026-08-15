import { describe, expect, it } from 'vitest';
import { GitHubIssueSubmitter } from './issue-submitter';
import type { Question, QuestionQcm } from '../../domain/questions/question';

const submitter = new GitHubIssueSubmitter({
	owner: 'tomboulier',
	repo: 'mediq-bench',
	formulaire: 'proposition-question.yml'
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
	references: [
		{ titre: 'RFE SFAR', url: 'https://sfar.org/rfe' },
		{ titre: 'SPILF', url: 'https://spilf.fr/reco' }
	],
	tags: ['orthopédie', 'allergie']
};

const qcm: QuestionQcm = {
	...question,
	type: 'qcm',
	choix: ['Céfazoline', 'Vancomycine'],
	reponse: 'A'
};

function parametres(rfe: string, q: Question): URLSearchParams {
	return new URL(submitter.urlSoumission(rfe, q)).searchParams;
}

describe('GitHubIssueSubmitter', () => {
	it('ouvre le formulaire d’issue du dépôt', () => {
		const url = new URL(submitter.urlSoumission('antibioprophylaxie', question));
		expect(url.origin + url.pathname).toBe('https://github.com/tomboulier/mediq-bench/issues/new');
		expect(url.searchParams.get('template')).toBe('proposition-question.yml');
	});

	it('pré-remplit les champs du formulaire', () => {
		const p = parametres('antibioprophylaxie', question);
		expect(p.get('rfe')).toBe('antibioprophylaxie');
		expect(p.get('titre')).toBe('PTH standard');
		expect(p.get('type')).toBe('ouverte');
		expect(p.get('reponse')).toBe('Céfazoline');
		expect(p.get('auteur')).toBe('Dr Test');
		expect(p.get('title')).toBe('[Proposition] PTH standard');
	});

	it('sérialise les références « titre | url », une par ligne', () => {
		expect(parametres('antibioprophylaxie', question).get('references')).toBe(
			'RFE SFAR | https://sfar.org/rfe\nSPILF | https://spilf.fr/reco'
		);
	});

	it('sérialise les tags séparés par des virgules', () => {
		expect(parametres('antibioprophylaxie', question).get('tags')).toBe('orthopédie, allergie');
	});

	it('n’envoie pas de choix pour une question ouverte', () => {
		expect(parametres('antibioprophylaxie', question).has('choix')).toBe(false);
	});

	it('sérialise les choix d’un QCM, un par ligne', () => {
		const p = parametres('antibioprophylaxie', qcm);
		expect(p.get('choix')).toBe('Céfazoline\nVancomycine');
		expect(p.get('reponse')).toBe('A');
	});
});
