import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Question } from './question';
import { validerQuestion } from './validation';

/**
 * Applique les règles métier du domaine aux données réellement versionnées.
 * Le schéma JSON (scripts/schema-question.json) valide la forme ; ce test valide
 * ce que le schéma ne sait pas exprimer — notamment qu'une réponse de QCM est
 * bien l'une des lettres proposées — et évite que les deux validations divergent.
 */

const RACINE_DONNEES = join(process.cwd(), 'data');

function fichiersRfe(): string[] {
	return readdirSync(RACINE_DONNEES)
		.filter((nom) => nom.endsWith('.json'))
		.map((nom) => join(RACINE_DONNEES, nom));
}

function fichiersPropositions(): string[] {
	const dossier = join(RACINE_DONNEES, 'propositions');
	try {
		if (!statSync(dossier).isDirectory()) return [];
	} catch {
		return [];
	}
	return readdirSync(dossier, { recursive: true, encoding: 'utf-8' })
		.filter((nom) => nom.endsWith('.json'))
		.map((nom) => join(dossier, nom));
}

function lire(chemin: string): unknown {
	return JSON.parse(readFileSync(chemin, 'utf-8'));
}

describe('données versionnées', () => {
	it.each(fichiersRfe())('%s respecte les règles du domaine', (chemin) => {
		const questions = lire(chemin) as Question[];
		expect(Array.isArray(questions)).toBe(true);
		for (const question of questions) {
			expect(validerQuestion(question), `${chemin} — ${question.id}`).toEqual([]);
		}
	});

	it.each(fichiersRfe())('%s n’a pas d’identifiant en double', (chemin) => {
		const ids = (lire(chemin) as Question[]).map((q) => q.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	const propositions = fichiersPropositions();
	it.skipIf(propositions.length === 0).each(propositions)(
		'%s respecte les règles du domaine',
		(chemin) => {
			expect(validerQuestion(lire(chemin) as Question)).toEqual([]);
		}
	);
});
