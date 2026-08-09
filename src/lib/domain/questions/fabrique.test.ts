import { describe, expect, it } from 'vitest';
import { fabriquerQuestion, QuestionInvalideError } from './fabrique';
import type { QuestionOuverte } from './question';

function questionValide(): QuestionOuverte {
	return {
		id: 'q-001',
		titre: 'PTH standard',
		type: 'ouverte',
		question: "Quelle est l'antibioprophylaxie recommandée pour une prothèse totale de hanche ?",
		reponse: 'Céfazoline',
		auteur: 'Dr Martin',
		creeLe: '2026-08-09T00:00:00.000Z',
		statut: 'draft',
		references: [{ titre: 'RFE SFAR', url: 'https://sfar.org/antibioprophylaxie' }],
		tags: ['orthopédie']
	};
}

describe('fabriquerQuestion', () => {
	it('retourne la question quand elle est valide', () => {
		expect(fabriquerQuestion(questionValide())).toEqual(questionValide());
	});

	it('lève QuestionInvalideError avec la liste des erreurs', () => {
		const q = { ...questionValide(), titre: '', auteur: '' };
		try {
			fabriquerQuestion(q);
			expect.unreachable('aurait dû lever une erreur');
		} catch (e) {
			expect(e).toBeInstanceOf(QuestionInvalideError);
			expect((e as QuestionInvalideError).erreurs).toHaveLength(2);
		}
	});
});
