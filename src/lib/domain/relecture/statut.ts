/**
 * Cycle de vie d'une question dans le workflow de relecture.
 * Calqué sur le modèle des PR : brouillon → soumis → approuvé → déprécié.
 * Les valeurs restent en anglais (cf. spec 02, décision actée).
 */
export const STATUTS_RELECTURE = ['draft', 'pending_review', 'approved', 'deprecated'] as const;

export type StatutRelecture = (typeof STATUTS_RELECTURE)[number];

const TRANSITIONS: Record<StatutRelecture, readonly StatutRelecture[]> = {
	draft: ['pending_review'],
	pending_review: ['approved', 'draft'],
	approved: ['deprecated'],
	deprecated: []
};

/** Indique si le passage d'un statut à un autre est autorisé. */
export function transitionAutorisee(de: StatutRelecture, vers: StatutRelecture): boolean {
	return TRANSITIONS[de].includes(vers);
}

/** Applique une transition. Lève une erreur si elle est interdite. */
export function faireTransition(de: StatutRelecture, vers: StatutRelecture): StatutRelecture {
	if (!transitionAutorisee(de, vers)) {
		throw new Error(`Transition de relecture interdite : ${de} → ${vers}`);
	}
	return vers;
}
