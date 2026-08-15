# Revue externe — MediQ-Bench

> Regard extérieur sur le projet mené selon BMAD (docs 01 à 03).
> Revue effectuée le 2026-08-15 sur `main` (7c4a538), branche `claude/bmad-project-review-yhnu4r`.
> Périmètre : documents de phase, code source, données, CI/CD, état réel du dépôt GitHub.

## Méthode

Lecture des trois documents de phase, puis confrontation systématique de chaque
décision actée avec le code livré et l'état observable du dépôt : branches
distantes, historique des runs GitHub Actions, labels existants, contenu des
données. Tests (`npm test`) et build (`npm run build`) rejoués localement.

**État vérifié :** 46 tests passent (8 fichiers), le build produit un site
statique correct avec le base path `/mediq-bench/` bien appliqué, 171 questions
dans `data/antibioprophylaxie.json` (138 ouvertes, 33 QCM).

## Verdict global

Le socle est sain et la démarche documentaire est nettement au-dessus de la
moyenne : décisions tracées avec justification, hexagonale réellement respectée
(le domaine n'importe rien de Svelte, vérifié), langage métier français
cohérent, fichiers courts et lisibles. Le projet tient en 1 500 lignes et fait
ce qu'il annonce sur la partie consultation.

En revanche **la chaîne de bout en bout n'a jamais été exercée une seule fois**.
Le flux spécifié (formulaire → PR → `dev` → relecture → merge `main` → release
SemVer → publication) est décrit dans les trois documents, implémenté par
morceaux, et cassé à trois endroits distincts qu'aucun test ne couvre. À ce
stade une contribution réelle d'un médecin au congrès SFAR n'arriverait pas
jusqu'au site.

Les constats sont classés par ce qu'ils coûtent le jour J.

---

## 1. Bloquants pour le MVP (congrès SFAR)

### 1.1 Une question mergée n'apparaît jamais sur le site

`GitHubPrSubmitter` écrit la proposition dans
`data/propositions/<rfe>/<uuid>.json` (`src/lib/infrastructure/github/pr-submitter.ts:24`),
mais `BundledRepository` ne lit que `data/*.json`
(`src/lib/infrastructure/github/raw-repository.ts:12`). Rien, ni en CI ni dans
l'application, ne recopie une proposition acceptée dans le fichier de la RFE.

Le commentaire du submitter assume ce choix (« consolidation manuelle au MVP »),
mais il contredit frontalement l'architecture §5 : « une nouvelle question
mergée n'est visible qu'après redéploiement, assuré automatiquement ». Le
redéploiement a bien lieu ; la question, elle, reste invisible.

**Impact :** le contributeur ne verra jamais le résultat de sa contribution,
c'est-à-dire précisément la boucle de gratification qui fait revenir les gens
après un congrès.

### 1.2 La branche `dev` est mort-née, le flux Git n'a jamais tourné

- `origin/dev` pointe encore sur le commit initial `9d59e15`, soit **4 commits
  de retard** sur `main`.
- `dev` contient **2 questions** dans `data/antibioprophylaxie.json`, `main` en
  contient 171. La branche cible des contributions n'a pas le jeu de données.
- Les 4 correctifs post-initialisation sont partis en **push direct sur `main`**,
  jamais par `dev`.
- Conséquence directe : **zéro pull request** sur le dépôt, donc
  `validate-pr.yml` (déclenché sur `pull_request` vers `dev`) **n'a jamais été
  exécuté**. Le script `validate_schema.py` n'a jamais tourné en CI.

Le workflow de relecture, cœur de la proposition de valeur face aux outils
existants, n'a pas fait l'objet d'une seule répétition générale.

### 1.3 Le versionnage SemVer ne bouge pas

Trois problèmes qui s'additionnent :

- Les labels `release:patch`, `release:minor`, `release:major` **n'existent pas**
  dans le dépôt (vérifié via l'API). `type_bump()` retombe donc toujours sur
  `patch` (`scripts/bump_version.py:56`), alors que la spec §3 impose `minor`
  pour toute nouvelle question — c'est-à-dire le cas nominal du projet.
- Sur un push direct, `pr_mergee()` renvoie `None` et le bump est purement et
  simplement sauté. C'est ce qui s'est produit **sur les 5 runs de `Release`** :
  `version.json` est resté à `0.1.0`, le tag `v0.1.0` est le seul publié.
- `gh release create ... || echo "release déjà existante"` avale toute erreur, y
  compris celles qu'on voudrait voir.

L'affirmation de l'architecture §5 — « le site reflète toujours la dernière
version officielle du dataset » — est aujourd'hui vide de sens : le site a été
redéployé 5 fois sous la même version. Un data scientist ne peut citer aucune
version utile.

### 1.4 Le filtre par tag est inopérant sur les vraies données

Les **171 questions ont `tags: []`**. La liste des tags proposée à l'utilisateur
est dérivée des tags réellement présents
(`src/routes/rfe/[id]/+page.svelte:22`) : elle est donc vide. Le vocabulaire
contrôlé de `data/meta/tags.json` (7 tags) n'est utilisé que par le formulaire
de création.

« Consulter les questions existantes — parcourir, **filtrer** » est l'une des
deux fonctionnalités MVP requises (spec §4). Elle ne fonctionne pas sur le seul
jeu de données existant.

### 1.5 La contradiction produit centrale n'est tranchée nulle part

L'idéation pose : persona « compétences techniques faibles », principe n°1
« ≤ 3 clics », décision « l'utilisateur ne voit que du contenu médical, pas le
format ».

Le parcours réel : le médecin remplit le formulaire, puis est éjecté vers
l'éditeur web de GitHub, **devant le JSON brut de sa question**, avec obligation
d'avoir un compte GitHub, de comprendre « commit », « branche », « pull
request », et de valider deux écrans supplémentaires.

Aucun des trois documents n'aborde ce point, ni n'estime la proportion de
participants SFAR disposant d'un compte GitHub. C'est le risque numéro un du
jour J, et il est structurel, pas cosmétique : le pattern est hérité d'INDICATE,
dont le public (data engineers OMOP) n'a rien à voir avec des anesthésistes en
congrès.

Trois issues possibles, à arbitrer explicitement :

1. assumer le prérequis compte GitHub, et le dire dans l'UI dès l'accueil (le
   moins coûteux, mais il faut accepter la perte de contributeurs) ;
2. proposer une porte de sortie « télécharger ma question » + dépôt par un
   référent présent au congrès (zéro développement, très efficace en présentiel) ;
3. ouvrir la PR au nom d'un compte de service (nécessite un secret côté serveur,
   donc renonce au principe « zéro backend » ou passe par un intermédiaire type
   Action déclenchée par formulaire).

À noter : la longueur de l'URL pré-remplie n'est pas un problème (≈ 850 caractères
pour une question ouverte, ≈ 1 150 pour un QCM, très loin de la limite GitHub).

---

## 2. Constats sérieux

### 2.1 La validation est dupliquée en deux langages, et désalignée

`src/lib/domain/questions/validation.ts` (TypeScript, navigateur) et
`scripts/schema-question.json` (JSON Schema, CI) expriment les mêmes règles, sauf
que le schéma est plus permissif :

| Règle | Domaine TS | JSON Schema |
|---|---|---|
| Réponse QCM parmi les lettres des `choix` | oui (`validation.ts:37`) | non — accepte tout `^[A-Z]$` |
| Choix non vides | oui | oui |
| Unicité des `id` dans le corpus | non | non |
| Tags issus du vocabulaire contrôlé | non | non |
| URL http(s) | oui | oui |

Le domaine TypeScript n'est jamais exécuté sur les données en CI. Une proposition
avec `reponse: "Z"` et deux choix passe donc la validation de PR. Comme le
domaine est du TypeScript pur et testable hors navigateur (c'est un point mis en
avant à juste titre dans l'archi §2), le plus simple est de faire tourner
`validerQuestion` sur `data/**` dans un test Vitest, et de réduire le rôle du
JSON Schema à ce que Python fait mieux (validation de forme).

### 2.2 Ordre dangereux dans `release.yml`

Le bump, le commit, le tag et le `git push origin main` se font **avant**
`npm test` et `npm run build` (`.github/workflows/release.yml:27-49`). Un test
rouge laisse donc derrière lui un `version.json` bumpé et un tag `vX.Y.Z`
poussés, pour une version qui ne build pas. Il faut inverser : valider d'abord,
publier ensuite.

Point annexe : `.github/workflows/release.yml` promet dans l'archi §6 « la
release GitHub avec le dataset consolidé en artefact ». L'étape publie la release
mais n'attache aucun artefact.

### 2.3 La PR qui déclenche la release n'est validée par rien

`validate-pr.yml` se déclenche uniquement sur `pull_request: branches: [dev]`.
La PR `dev` → `main` — celle qui publie, et celle qui **porte le label de bump** —
n'exécute ni tests, ni schéma, ni build. C'est exactement la PR qu'on voudrait
valider le plus.

### 2.4 Ni lint, ni vérification de types en CI

L'archi §6 annonce « lint + tests unitaires TypeScript ». Il n'y a ni ESLint ni
Prettier configurés, et `npm run check` (svelte-check) existe mais n'est appelé
par aucun workflow. Les erreurs de typage dans les composants Svelte ne sont donc
jamais détectées automatiquement.

### 2.5 Aucun fichier de licence

Le README et `package.json` annoncent EUPL-1.2 pour le code et CC-BY 4.0 pour les
données. Il n'y a **aucun fichier `LICENSE`** dans le dépôt, ni mention de
licence dans les fichiers de données. Pour un projet qui met la science ouverte
en principe fondateur n°4, c'est la première chose qu'un réutilisateur cherche —
et en l'état, juridiquement, le code est « tous droits réservés » par défaut.

Manquent également : `CONTRIBUTING.md`, `CODEOWNERS`, template de PR. Le process
de relecture repose intégralement sur les fonctions natives de GitHub (spec §5) :
ce sont précisément les fichiers qui les font fonctionner (assignation
automatique du reviewer, checklist de relecture, cadrage des attentes).

### 2.6 Le statut `approved` est vidé de son sens dès l'import

Les 171 questions importées sont toutes `statut: approved`, même auteur, même
date `2026-03-18T00:00:00.000Z`, tags vides. Elles n'ont été relues par personne
au sens du processus décrit en spec §5, où `approved` est le résultat d'une
relecture par le comité.

Deux options honnêtes : soit les repasser en `pending_review` et les faire
valider (ce qui est aussi une excellente répétition du workflow avant le
congrès), soit documenter explicitement dans le README que le corpus initial est
importé et réputé validé par son auteur d'origine.

Sujet connexe non traité dans les docs : les questions sont dérivées d'une RFE
SFAR-SPILF. Publier le dérivé en CC-BY suppose que la reformulation est bien une
œuvre propre — une ligne de position là-dessus évitera une discussion pénible le
jour où la SFAR reprend l'outil.

### 2.7 Environ un quart du domaine est du code mort

- `domain/versionnage/semver.ts` (47 lignes + 36 de tests) : **appelé nulle part**.
  Le bump réel est fait par `scripts/bump_version.py`, qui **réimplémente la même
  règle** en Python — et qui, lui, n'a aucun test.
- `domain/relecture/statut.ts` : `transitionAutorisee` et `faireTransition` ne
  sont jamais appelés. Seule la liste `STATUTS_RELECTURE` sert (au filtre). La
  machine à états est modélisée et testée, mais aucune transition n'existe dans
  l'application : elles se font par merge Git, à la main.
- `ports/dataset-exporter.ts` : port sans adaptateur ni appelant.

Ce n'est pas grave en soi — c'est de la modélisation en avance de phase, et le
domaine est le bon endroit pour ça. Mais deux règles SemVer dans deux langages
dont une seule est testée, c'est une divergence qui arrivera. Le plus propre :
faire lire `version.json` et la règle de bump au script Python depuis une source
unique, ou supprimer `semver.ts` tant que le front n'en a pas l'usage.

### 2.8 `ssr = false` rend le site invisible aux moteurs et aux partages

`src/routes/+layout.ts` désactive le SSR globalement, et `/rfe/[id]` désactive le
prérendu. Le site sert donc une page vide à un crawler, à un aperçu de lien
Slack/Twitter, ou à un lecteur d'écran avant hydratation.

Or **tout est statique et connu au build** : les RFE sont énumérables via
`import.meta.glob`, le prérendu de toutes les pages est gratuit
(`entries()` dans `+page.ts`). Pour un commun numérique qu'on veut trouvable et
citable, c'est un choix à revisiter — c'est aussi le genre de détail qui compte
quand on partage l'URL depuis une slide de congrès.

### 2.9 Hygiène et nommage

- **`.pyc` versionnés** : `scripts/__pycache__/bump_version.cpython-313.pyc` et
  `validate_schema.cpython-313.pyc` sont suivis par Git ; `.gitignore` ne
  contient pas `__pycache__`.
- **`raw-repository.ts` contient `BundledRepository`** : le nom de fichier est un
  reliquat de l'option écartée (lecture via `raw.githubusercontent.com`,
  archi §5). Dans un projet qui revendique le *screaming architecture*, un nom
  qui décrit l'implémentation abandonnée est un contresens. `bundled-repository.ts`.
- **`pr-submitter.ts` n'ouvre pas de PR** : il fabrique une URL d'éditeur.
  `github-editor-url.ts` ou `editeur-github.ts` serait plus honnête.
- **Pas de `svelte.config.js`** : la configuration Kit (base path, adapter) est
  passée en ligne dans `vite.config.ts`. Ça fonctionne (build vérifié), mais
  c'est peu conventionnel : la documentation SvelteKit, les outils tiers et les
  futurs contributeurs cherchent ce fichier.
- **Liens externes sans `rel="noopener noreferrer"`** dans `QuestionCard.svelte`.

### 2.10 Aucun test au-dessus de la couche application

46 tests, tous sur le domaine, les use cases et le submitter. **Zéro test de
composant, zéro test de bout en bout.** Le chemin critique du jour J — remplir le
formulaire, obtenir la bonne URL GitHub — n'est testé que par morceaux disjoints,
et c'est exactement là que se logent les bugs de liaison (état Svelte, réponse
QCM devenue hors bornes après suppression d'un choix, popup bloquée par le
navigateur, `rfe` non sélectionnée).

Playwright est disponible dans l'environnement : un seul scénario e2e
« formulaire rempli → URL construite » couvrirait le risque principal.

---

## 3. Sur la démarche BMAD elle-même

**Ce qui est très bien fait.** Les trois documents sont écrits pour être lus par
un humain, pas pour cocher une case. Les tableaux « Question / Décision » en fin
de phase sont excellents : chaque décision porte sa justification, ce qui rend la
revue possible six mois plus tard. Les personas sont concrets et ancrés dans un
usage réel (Datathon InterHop, congrès SFAR) et non génériques. L'analyse
d'INDICATE avec ses colonnes « ce qu'on adapte / ce qu'on change » est un bon
réflexe d'ingénierie.

**Ce qui manque, et qui explique les trous ci-dessus.**

1. **Il n'y a pas de phase 4.** Après l'architecture, BMAD attend un découpage en
   epics et stories avec critères d'acceptation. Ici on passe directement du
   document d'architecture au code. Conséquence : « le MVP est prêt » n'est pas
   définissable, et les cinq blocages de la section 1 tombent tous **entre** deux
   documents — la consolidation des propositions n'est ni dans la spec (qui parle
   workflow) ni dans l'archi (qui parle structure). Personne n'en est propriétaire.
2. **Aucune trace de QA.** Aucun document ne dit comment on vérifie qu'une phase
   est livrée. Les 46 tests existent mais ne se rattachent à aucune exigence
   nommée : impossible de dire quelle ligne de la spec §4 est couverte.
3. **Les documents ont divergé du code** et ne portent pas la trace de cette
   divergence. L'arborescence de l'archi §3 annonce `export/benchmark-json.ts`,
   `QuestionForm.svelte`, `TagFilter.svelte` : aucun n'existe. Le tableau MVP
   spec §4 exige « Connexion GitHub/GitLab » : il n'y a pas de connexion (et
   c'est un bon choix — mais le document dit autre chose). Un lecteur qui découvre
   le projet par `docs/` découvre un projet légèrement différent de celui qui est
   dans le dépôt.
4. **Le backlog est éparpillé** en cases à cocher au fil de la spec §1, sans
   fichier unique. Il disparaîtra à la prochaine réécriture du document.

En résumé : la démarche a très bien produit de la **décision**, elle n'a pas
produit d'**exécution vérifiable**. C'est le mode d'échec classique d'un
développement assisté par IA — chaque document est cohérent, le code correspond à
chaque document pris isolément, et personne ne parcourt la chaîne complète.

---

## 4. Plan d'action proposé

Ordre de priorité pour arriver au congrès avec quelque chose qui tient.

**Avant tout développement**

1. Trancher la question 1.5 (contributeur sans compte GitHub) — c'est un
   arbitrage produit, pas technique, et tout le reste en dépend.

**Puis, dans cet ordre**

2. Fermer la boucle proposition → RFE (1.1) : soit un script de consolidation
   déclenché en CI au merge, soit faire écrire le formulaire directement dans le
   fichier de la RFE (diff plus gros, mais boucle fermée immédiatement).
3. Remettre `dev` au niveau de `main`, activer la protection de branche sur
   `main` (interdire le push direct), et **faire passer une contribution de bout
   en bout en répétition générale** — c'est le test qui manque le plus.
4. Créer les trois labels `release:*` et faire **échouer** la release en leur
   absence, plutôt que retomber silencieusement sur `patch`.
5. Déplacer bump/commit/tag/push **après** tests et build dans `release.yml`.
6. Étendre `validate-pr.yml` aux PR vers `main`.
7. Ajouter `LICENSE` (EUPL-1.2), `LICENSE-DATA` ou équivalent (CC-BY 4.0) et une
   mention d'attribution dans les fichiers de données.
8. Taguer les 171 questions existantes (au minimum par spécialité), sinon le
   filtre reste mort à la démonstration.
9. Faire tourner `validerQuestion` (TS) sur `data/**` dans un test Vitest, pour
   supprimer l'écart avec le JSON Schema.
10. Un scénario e2e Playwright sur le parcours de création.

**Sur la démarche, pour la suite**

11. Ajouter un `docs/04-stories.md` : les fonctionnalités MVP de la spec §4
    découpées en stories avec critères d'acceptation vérifiables, et le lien vers
    le test qui les couvre.
12. Sortir le backlog dans `docs/backlog.md`.
13. Ajouter en tête de chaque document de phase une ligne « dernière
    confrontation au code : <date> », et corriger les quatre divergences
    relevées en 3.3.

---

## Annexe — éléments vérifiés

| Vérification | Résultat |
|---|---|
| `npm test` | 46 tests, 8 fichiers, tous verts |
| `npm run build` | succès, base path `/mediq-bench/` correctement appliqué |
| Branches distantes | `main` (7c4a538), `dev` (9d59e15, 4 commits de retard) |
| Pull requests | aucune |
| Runs `Validation PR` | aucun |
| Runs `Release` | 5, tous sur push direct `main` (3 succès, 2 échecs initiaux) |
| Labels `release:*` | inexistants |
| `version.json` | `0.1.0`, inchangé depuis l'initialisation |
| Données | 171 questions, 138 ouvertes / 33 QCM, 100 % `approved`, 100 % sans tag |
| Longueur URL de soumission | ≈ 850 (ouverte) à 1 150 (QCM) caractères — sans risque |
