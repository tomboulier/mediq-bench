import { describe, expect, it } from 'vitest';
import type { QuestionQcm, QuestionOuverte } from './question';
import { validerQuestion } from './validation';

const referenceValide = {
	titre: 'RFE SFAR Antibioprophylaxie 2024',
	url: 'https://sfar.org/antibioprophylaxie'
};

function questionOuverteValide(): QuestionOuverte {
	return {
		id: 'q-001',
		titre: 'PTH standard',
		type: 'ouverte',
		question: "Quelle est l'antibioprophylaxie recommandée pour une prothèse totale de hanche ?",
		reponse: 'Céfazoline',
		auteur: 'Dr Martin',
		creeLe: '2026-08-09T00:00:00.000Z',
		statut: 'draft',
		references: [referenceValide],
		tags: ['orthopédie']
	};
}

function questionQcmValide(): QuestionQcm {
	return {
		...questionOuverteValide(),
		type: 'qcm',
		choix: ['Céfazoline', 'Amoxicilline', 'Vancomycine'],
		reponse: 'A'
	};
}

describe('validerQuestion — règles communes', () => {
	it('accepte une question ouverte complète', () => {
		expect(validerQuestion(questionOuverteValide())).toEqual([]);
	});

	it('exige un titre', () => {
		const q = { ...questionOuverteValide(), titre: '' };
		expect(validerQuestion(q)).toContain('Le titre est obligatoire');
	});

	it('exige le texte de la question', () => {
		const q = { ...questionOuverteValide(), question: '  ' };
		expect(validerQuestion(q)).toContain('Le texte de la question est obligatoire');
	});

	it("exige le nom de l'auteur", () => {
		const q = { ...questionOuverteValide(), auteur: '' };
		expect(validerQuestion(q)).toContain("Le nom de l'auteur est obligatoire");
	});

	it('exige au moins une référence', () => {
		const q = { ...questionOuverteValide(), references: [] };
		expect(validerQuestion(q)).toContain(
			'Au moins une référence à une recommandation est obligatoire'
		);
	});

	it('remonte les erreurs des références avec leur position', () => {
		const q = {
			...questionOuverteValide(),
			references: [referenceValide, { titre: '', url: 'pas-une-url' }]
		};
		const erreurs = validerQuestion(q);
		expect(erreurs.some((e) => e.startsWith('Référence 2 :'))).toBe(true);
	});
});

describe('validerQuestion — question ouverte', () => {
	it('exige une réponse non vide', () => {
		const q = { ...questionOuverteValide(), reponse: ' ' };
		expect(validerQuestion(q)).toContain('La réponse est obligatoire');
	});
});

describe('validerQuestion — QCM', () => {
	it('accepte un QCM valide', () => {
		expect(validerQuestion(questionQcmValide())).toEqual([]);
	});

	it('exige au moins deux choix', () => {
		const q: QuestionQcm = { ...questionQcmValide(), choix: ['Céfazoline'], reponse: 'A' };
		expect(validerQuestion(q)).toContain('Un QCM doit proposer au moins deux choix');
	});

	it('rejette des choix vides', () => {
		const q = { ...questionQcmValide(), choix: ['Céfazoline', ''] };
		expect(validerQuestion(q)).toContain('Les choix du QCM ne peuvent pas être vides');
	});

	it('la réponse doit être une lettre correspondant à un choix', () => {
		const q = { ...questionQcmValide(), reponse: 'D' };
		expect(validerQuestion(q).some((e) => e.includes('lettre'))).toBe(true);
	});
});
