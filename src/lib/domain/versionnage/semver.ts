/**
 * Versionnement sémantique du dataset.
 * Règles (spec 02, §3) :
 * - patch : corrections, typos, métadonnées
 * - minor : nouvelle question, nouvelle RFE, reformulation, suppression
 * - major : changement de schéma incompatible
 */
export type TypeBump = 'patch' | 'minor' | 'major';

export interface VersionSemVer {
	major: number;
	minor: number;
	patch: number;
}

const REGEX_SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

/** Parse une chaîne "X.Y.Z". Lève une erreur si le format est invalide. */
export function parserVersion(version: string): VersionSemVer {
	const correspondance = REGEX_SEMVER.exec(version.trim());
	if (!correspondance) {
		throw new Error(`Version SemVer invalide : ${version}`);
	}
	return {
		major: Number(correspondance[1]),
		minor: Number(correspondance[2]),
		patch: Number(correspondance[3])
	};
}

/** Formate une version en chaîne "X.Y.Z". */
export function formaterVersion(version: VersionSemVer): string {
	return `${version.major}.${version.minor}.${version.patch}`;
}

/** Calcule la version suivante selon le type de bump. */
export function bumper(version: string, type: TypeBump): string {
	const v = parserVersion(version);
	switch (type) {
		case 'major':
			return formaterVersion({ major: v.major + 1, minor: 0, patch: 0 });
		case 'minor':
			return formaterVersion({ major: v.major, minor: v.minor + 1, patch: 0 });
		case 'patch':
			return formaterVersion({ major: v.major, minor: v.minor, patch: v.patch + 1 });
	}
}
