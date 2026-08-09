/**
 * Référence à une recommandation (guideline).
 * MVP : titre + URL. Voir backlog spec pour citation structurée (section, page, extrait).
 */
export interface Reference {
	titre: string;
	url: string;
}

/** Valide une référence. Retourne la liste des erreurs (vide si valide). */
export function validerReference(reference: Reference): string[] {
	const erreurs: string[] = [];
	if (!reference.titre.trim()) {
		erreurs.push('Le titre de la référence est obligatoire');
	}
	if (!reference.url.trim()) {
		erreurs.push("L'URL de la référence est obligatoire");
	} else if (!estUrlValide(reference.url)) {
		erreurs.push(`URL invalide : ${reference.url}`);
	}
	return erreurs;
}

function estUrlValide(url: string): boolean {
	try {
		const analysee = new URL(url);
		return analysee.protocol === 'http:' || analysee.protocol === 'https:';
	} catch {
		return false;
	}
}
