import { describe, expect, it } from 'vitest';
import { validerReference } from './reference';

describe('validerReference', () => {
	it('accepte une référence complète', () => {
		const erreurs = validerReference({
			titre: 'RFE SFAR Antibioprophylaxie 2024',
			url: 'https://sfar.org/antibioprophylaxie'
		});
		expect(erreurs).toEqual([]);
	});

	it('exige un titre', () => {
		const erreurs = validerReference({
			titre: '  ',
			url: 'https://sfar.org/antibioprophylaxie'
		});
		expect(erreurs).toContain('Le titre de la référence est obligatoire');
	});

	it('exige une URL', () => {
		const erreurs = validerReference({ titre: 'RFE SFAR', url: '' });
		expect(erreurs).toContain("L'URL de la référence est obligatoire");
	});

	it('rejette une URL malformée', () => {
		const erreurs = validerReference({ titre: 'RFE SFAR', url: 'pas-une-url' });
		expect(erreurs.some((e) => e.includes('URL invalide'))).toBe(true);
	});

	it('rejette un protocole non HTTP(S)', () => {
		const erreurs = validerReference({ titre: 'RFE SFAR', url: 'ftp://exemple.fr/doc.pdf' });
		expect(erreurs.some((e) => e.includes('URL invalide'))).toBe(true);
	});
});
