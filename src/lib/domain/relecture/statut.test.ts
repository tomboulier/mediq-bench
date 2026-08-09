import { describe, expect, it } from 'vitest';
import { faireTransition, transitionAutorisee } from './statut';

describe('cycle de vie de relecture', () => {
	it('un brouillon peut être soumis en relecture', () => {
		expect(transitionAutorisee('draft', 'pending_review')).toBe(true);
	});

	it('une question en relecture peut être approuvée', () => {
		expect(transitionAutorisee('pending_review', 'approved')).toBe(true);
	});

	it('une question en relecture peut retourner en brouillon (demande de modifications)', () => {
		expect(transitionAutorisee('pending_review', 'draft')).toBe(true);
	});

	it('une question approuvée peut être dépréciée', () => {
		expect(transitionAutorisee('approved', 'deprecated')).toBe(true);
	});

	it('un brouillon ne peut pas être approuvé directement', () => {
		expect(transitionAutorisee('draft', 'approved')).toBe(false);
	});

	it('une question dépréciée est en fin de vie', () => {
		expect(transitionAutorisee('deprecated', 'draft')).toBe(false);
		expect(transitionAutorisee('deprecated', 'approved')).toBe(false);
	});

	it('faireTransition retourne le nouveau statut quand la transition est autorisée', () => {
		expect(faireTransition('draft', 'pending_review')).toBe('pending_review');
	});

	it('faireTransition lève une erreur quand la transition est interdite', () => {
		expect(() => faireTransition('draft', 'approved')).toThrow(/interdite/);
	});
});
