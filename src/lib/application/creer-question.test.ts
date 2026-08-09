import { describe, expect, it } from 'vitest';
import { creerQuestion, type DonneesFormulaire } from './creer-question';
import { QuestionInvalideError } from '../domain/questions/fabrique';

function donneesValides(): DonneesFormulaire {
	return {
		titre: 'PTH standard',
		type: 'ouverte',
		question: "Quelle est l'antibioprophylaxie recommandée pour une PTH ?",
		reponse: 'Céfazoline',
		auteur: 'Dr Martin',
		references: [{ titre: 'RFE SFAR', url: 'https://sfar.org/antibioprophylaxie' }],
		tags: ['orthopédie']
	};
}

const horlogeFixe = () => new Date('2026-08-09T12:00:00.000Z');

describe('creerQuestion', () => {
	it('crée une question en statut brouillon avec un id généré', () => {
		const q = creerQuestion(donneesValides(), horlogeFixe);
		expect(q.statut).toBe('draft');
		expect(q.id).toBeTruthy();
		expect(q.creeLe).toBe('2026-08-09T12:00:00.000Z');
	});

	it('normalise les espaces superflus', () => {
		const q = creerQuestion({ ...donneesValides(), titre: '  PTH standard  ' }, horlogeFixe);
		expect(q.titre).toBe('PTH standard');
	});

	it('normalise la réponse QCM en majuscule', () => {
		const q = creerQuestion(
			{ ...donneesValides(), type: 'qcm', choix: ['Céfazoline', 'Vancomycine'], reponse: 'b' },
			horlogeFixe
		);
		expect(q.type === 'qcm' && q.reponse).toBe('B');
	});

	it('génère des ids distincts (contributions concurrentes)', () => {
		const a = creerQuestion(donneesValides(), horlogeFixe);
		const b = creerQuestion(donneesValides(), horlogeFixe);
		expect(a.id).not.toBe(b.id);
	});

	it('refuse une question invalide', () => {
		expect(() => creerQuestion({ ...donneesValides(), references: [] }, horlogeFixe)).toThrow(
			QuestionInvalideError
		);
	});
});
