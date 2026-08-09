# Phase 3 : Architecture (BMAD Architecture)

> Architecture technique de MediQ-Bench.
> Document évolutif, rempli au fil des interviews BMAD.
> Dernière mise à jour : 2026-08-09

## 1. Stack technique

| Composant | Choix | Justification |
|---|---|---|
| Framework front | SvelteKit + TypeScript | Courbe d'apprentissage douce (profil Python / Clean Code), composants petits et lisibles, réactivité sans boilerplate |
| Build statique | `@sveltejs/adapter-static` | SPA 100% statique, déployable sur GitHub Pages |
| Routing | Côté client, `404.html` généré au build | GitHub Pages ne gère pas le routing SPA nativement |
| Tests unitaires | Vitest | Standard de l'écosystème Vite / SvelteKit |
| Scripts CI / outils données | Python | Cohérent avec l'écosystème du banc d'essai existant (validation de schéma, export, calcul SemVer) |

## 2. Pas de backend serveur

Principe fondateur n°6 : zéro backend. Conséquence directe : le cœur métier (domaine, use cases) s'exécute **dans le navigateur**, donc en TypeScript. Ce n'est pas une concession à un framework : le domaine est du TypeScript pur, sans aucun import Svelte, testable hors navigateur. L'interface web reste un détail d'implémentation (Clean Architecture), même si elle partage le même langage.

Python n'est pas exclu du projet : il intervient là où il est le plus pertinent, c'est-à-dire la CI et les outils de données :

- validation du schéma JSON des questions (sur chaque PR)
- consolidation et export du dataset (vers le format `benchmark.json` du benchmark existant, post-MVP)
- calcul du bump SemVer lors des releases

## 3. Structure du code : screaming architecture

Le domaine est organisé **par capacités métier**, pas par taxonomie technique : pas de `entities/` ni de `value-objects/`. L'arborescence doit crier de quoi parle le projet (Robert Martin, *Clean Architecture*). Le nommage du domaine est en français, cohérent avec la décision "tout en français" (ubiquitous language).

```
src/
  lib/
    domain/                    # cœur métier, TypeScript pur, zéro dépendance
      questions/               # Question (open | mcq), règles de validation
      references/              # référence à une guideline (titre + URL)
      relecture/               # cycle de vie : draft → pending_review → approved → deprecated
      versionnage/             # règles SemVer du dataset (patch / minor / major)
    application/               # use cases
      creer-question.ts
      consulter-questions.ts
      soumettre-question.ts
    ports/                     # interfaces vues par le cœur
      question-repository.ts   # lecture des questions
      question-submitter.ts    # soumission d'une nouvelle question
      dataset-exporter.ts      # export du dataset (post-MVP)
    infrastructure/            # adaptateurs
      github/
        raw-repository.ts      # lit les JSON packagés au build
        pr-submitter.ts        # construit l'URL de l'éditeur GitHub pré-rempli
      export/
        benchmark-json.ts      # adaptateur vers le format benchmark existant (post-MVP)
      composition.ts           # câblage des adaptateurs, sans framework d'injection
    ui/
      components/              # QuestionCard, QuestionForm, TagFilter, StatusBadge…
  routes/                      # couche présentation (convention SvelteKit)
    +page.svelte               # accueil : liste des RFE
    rfe/[id]/+page.svelte      # questions d'une RFE, filtres par tags / statut
    creer/+page.svelte         # formulaire de création
data/                          # un fichier JSON par RFE (racine du repo)
scripts/                       # Python : validation schéma, export, semver
.github/workflows/
  validate-pr.yml              # validation sur PR vers dev
  release.yml                  # merge dev → main : SemVer, build, déploiement
```

### Composition sans framework DI

Projet de taille modeste : pas de conteneur d'injection de dépendances. Un simple module `composition.ts` instancie les adaptateurs et les expose aux routes. Pour changer de plateforme (GitHub → GitLab SFAR), on écrit les adaptateurs GitLab et on modifie une ligne de composition.

## 4. Soumission sans backend

Aucune OAuth custom au MVP. Le formulaire génère le JSON côté navigateur, puis le bouton "Proposer sur GitHub" ouvre l'éditeur GitHub avec une URL pré-remplie :

```
https://github.com/<owner>/<repo>/new/dev?filename=data/<rfe>.json&value=<json encodé>
```

L'utilisateur est déjà connecté à GitHub dans son navigateur : il vérifie, commit, et la PR part vers `dev`. Pattern repris d'INDICATE, qui élimine toute gestion d'authentification côté application.

## 5. Lecture des données : bundle au build

**Décision :** les fichiers JSON de `data/` sont importés au build et embarqués dans le bundle statique. Conséquences :

- la consultation est instantanée et fonctionne hors-ligne
- une nouvelle question mergée n'est visible qu'après redéploiement, assuré automatiquement par GitHub Actions à chaque merge vers `main`
- cohérent avec la philosophie "release = version SemVer publiée" : le site reflète toujours la dernière version officielle du dataset, jamais de questions non approuvées

L'alternative (fetch runtime depuis `raw.githubusercontent.com`) a été écartée : dépendance réseau à la visite, et risque d'afficher des questions encore en relecture si on lit `dev`.

## 6. CI/CD (GitHub Actions)

### `validate-pr.yml` : sur PR vers `dev`

- validation du schéma JSON (script Python, `jsonschema` ou `pydantic`)
- lint + tests unitaires TypeScript (Vitest)
- build de vérification

### `release.yml` : sur push vers `main` (merge de `dev`)

1. détermination du bump SemVer via le label de la PR mergée : `release:patch`, `release:minor`, `release:major` (explicite et auditable, plutôt qu'une heuristique sur les fichiers modifiés)
2. tag `vX.Y.Z` + mise à jour du changelog
3. build SvelteKit + déploiement GitHub Pages
4. publication de la release GitHub avec le dataset consolidé en artefact

## 7. Correspondance hexagonale

- le domaine ne connaît ni GitHub ni Svelte : il manipule des `Question` et délègue à `QuestionRepository` / `QuestionSubmitter`
- migration GitLab SFAR : écrire `GitLabRawRepository` + `GitLabMrSubmitter`, changer une ligne de composition, le reste ne bouge pas
- ajout d'un format d'export (HuggingFace, CodaBench) : nouvel adaptateur `DatasetExporter`, sans toucher au cœur

## Décisions de la phase 3

| Question | Décision |
|---|---|
| **Framework front** | SvelteKit + TypeScript + adapter-static, GitHub Pages |
| **Langage du cœur** | TypeScript (exécuté dans le navigateur), domaine pur sans import framework |
| **Langage des outils CI/données** | Python, cohérent avec le banc d'essai existant |
| **Organisation du domaine** | Screaming architecture : capacités métier, nommage français |
| **Injection de dépendances** | Module `composition.ts` simple, pas de framework DI |
| **Lecture des données** | Bundle au build + redéploiement auto sur merge vers `main` |
| **Soumission** | Éditeur GitHub pré-rempli, pas d'OAuth custom au MVP |
| **Bump SemVer** | Labels de PR (`release:patch|minor|major`) |

## Prochaines étapes

1. Initialiser le repo (SvelteKit + adapter-static + structure ci-dessus)
2. Implémenter le domaine (questions, relecture, versionnage) avec tests Vitest
3. Formulaire de création + submitter GitHub (MVP)
4. Consultation + filtres (MVP)
5. Workflows CI/CD
