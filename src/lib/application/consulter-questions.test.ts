import { describe, expect, it } from 'vitest';
import { consulterQuestions, listerRfe } from './consulter-questions';
import type { QuestionRepository } from '../ports/question-repository';
import type { Question } from '../domain/questions/question';

function question(id: string, tags: string[], statut: Question['statut']): Question {
	return {
		id,
		titre: `Question ${id}`,
		type: 'ouverte',
		question: 'Texte ?',
		reponse: 'Réponse',
		auteur: 'Dr Test',
		creeLe: '2026-08-09T00:00:00.000Z',
		statut,
		references: [{ titre: 'RFE', url: 'https://sfar.org/rfe' }],
		tags
	};
}

const repoFactice: QuestionRepository = {
	listerRfe: async () => ['antibioprophylaxie', 'anticoagulants'],
	listerQuestions: async (rfe: string) =>
		rfe === 'antibioprophylaxie'
			? [
					question('q1', ['orthopédie'], 'approved'),
					question('q2', ['orthopédie', 'urgence'], 'draft'),
					question('q3', ['digestif'], 'approved')
				]
			: []
};

describe('consulterQuestions', () => {
	it('liste toutes les questions d’une RFE', async () => {
		const questions = await consulterQuestions(repoFactice, 'antibioprophylaxie');
		expect(questions).toHaveLength(3);
	});

	it('filtre par tag', async () => {
		const questions = await consulterQuestions(repoFactice, 'antibioprophylaxie', {
			tag: 'orthopédie'
		});
		expect(questions.map((q) => q.id)).toEqual(['q1', 'q2']);
	});

	it('filtre par statut', async () => {
		const questions = await consulterQuestions(repoFactice, 'antibioprophylaxie', {
			statut: 'approved'
		});
		expect(questions.map((q) => q.id)).toEqual(['q1', 'q3']);
	});

	it('combine tag et statut', async () => {
		const questions = await consulterQuestions(repoFactice, 'antibioprophylaxie', {
			tag: 'orthopédie',
			statut: 'draft'
		});
		expect(questions.map((q) => q.id)).toEqual(['q2']);
	});
});

describe('listerRfe', () => {
	it('retourne les RFE disponibles', async () => {
		expect(await listerRfe(repoFactice)).toEqual(['antibioprophylaxie', 'anticoagulants']);
	});
});
