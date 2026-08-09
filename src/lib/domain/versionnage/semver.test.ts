import { describe, expect, it } from 'vitest';
import { bumper, formaterVersion, parserVersion } from './semver';

describe('parserVersion', () => {
	it('décompose une version SemVer valide', () => {
		expect(parserVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
	});

	it('rejette une version incomplète', () => {
		expect(() => parserVersion('1.2')).toThrow(/invalide/);
	});

	it('rejette du texte libre', () => {
		expect(() => parserVersion('version finale')).toThrow(/invalide/);
	});
});

describe('formaterVersion', () => {
	it('recompose une version', () => {
		expect(formaterVersion({ major: 2, minor: 0, patch: 0 })).toBe('2.0.0');
	});
});

describe('bumper', () => {
	it('patch : incrémente le correctif', () => {
		expect(bumper('1.2.3', 'patch')).toBe('1.2.4');
	});

	it('minor : incrémente le mineur et remet le correctif à zéro', () => {
		expect(bumper('1.2.3', 'minor')).toBe('1.3.0');
	});

	it('major : incrémente le majeur et remet mineur et correctif à zéro', () => {
		expect(bumper('1.2.3', 'major')).toBe('2.0.0');
	});
});
