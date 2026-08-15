# Décision : parcours de soumission d'une question

> Décision d'architecture, prise le 2026-08-15 à la suite de la revue externe
> (`docs/revue-externe-2026-08.md`, constat 1.5).
> Statut : **acceptée**, implémentée.

## Contexte

L'idéation pose un persona « compétences techniques faibles » et un principe
« ≤ 3 clics ». La décision de phase 1 précise : « l'utilisateur ne voit que du
contenu médical, pas le format ».

Le parcours implémenté au MVP contredisait ces trois énoncés : le formulaire du
site redirigeait vers l'éditeur de fichiers de GitHub, avec le **JSON brut** de
la question dans un champ de texte, à charge pour le médecin de comprendre
« commit », « branche » et « pull request ». Le pattern venait d'INDICATE, dont
le public — ingénieurs de données OMOP — n'a rien à voir avec des anesthésistes
en congrès.

## Options envisagées

| Option | Compte GitHub requis | JSON visible | Notions Git exposées | Hébergement |
|---|---|---|---|---|
| 1. Éditeur GitHub pré-rempli (état initial) | oui | **oui** | **commit, branche, PR** | aucun |
| 2. Téléchargement du JSON + dépôt par un référent | non | oui | aucune | aucun |
| 3a. Fonction serveur + compte de service | **non** | non | aucune | fonction à héberger |
| 3b. **Formulaire d'issue GitHub + Action** | oui | non | aucune | aucun |

## Décision

**Option 3b.** Le formulaire du site pré-remplit un *formulaire d'issue* GitHub ;
un workflow convertit l'issue en pull request.

Le contributeur voit une page GitHub déjà remplie avec ses réponses en clair,
coche une case de licence, et clique sur un bouton. Ni JSON, ni branche, ni
commit, ni notion de pull request.

### Ce que cette décision ne résout pas

**Un compte GitHub reste nécessaire.** Il n'existe aucun chemin d'écriture non
authentifié vers GitHub : `repository_dispatch`, `workflow_dispatch` et la
création d'issue exigent tous un jeton. Sans fonction hébergée détenant un
secret (option 3a), le compte est un prérequis incontournable.

L'option 3b retire donc deux des trois frictions identifiées (le format, les
notions Git) et laisse la troisième. C'était un arbitrage assumé : elle ne coûte
aucun hébergement, aucun secret, et tout le code reste versionné et relisable
dans le dépôt.

Deux conséquences pratiques :

- le formulaire du site affiche explicitement le prérequis, et propose de
  transmettre la page à un référent pour qui n'a pas de compte — variante
  dégradée de l'option 2, gratuite ;
- si le taux de contribution au congrès se révèle décevant, l'option 3a reste
  ouverte : la fonction hébergée appellerait la même API de création d'issue,
  et **tout le reste de la chaîne construite ici serait réutilisé tel quel**.

### Anti-abus

L'option 3b ne crée aucun point d'entrée public : la porte d'entrée est le compte
GitHub, avec les limitations d'abus natives de la plateforme. Un captcha n'aurait
rien à protéger. Les garde-fous effectifs sont donc :

- le workflow ne se déclenche que sur les issues portant le label `proposition`,
  posé par le formulaire d'issue lui-même ;
- toute proposition invalide (schéma ou règles métier) est refusée **avant**
  l'ouverture de la PR, et commentée sur l'issue ;
- aucune proposition n'est publiée sans merge par un mainteneur.

Si un endpoint public est ajouté un jour (option 3a), un captcha invisible et un
quota par IP deviendront nécessaires : c'est à ce moment-là que la question se
posera.

## Mise en œuvre

```
Formulaire du site                    GitHub
──────────────────                    ──────
/creer
  │ validation par le domaine (TypeScript)
  │
  └─► GitHubIssueSubmitter
        construit l'URL du formulaire d'issue pré-rempli
        │
        └─► issues/new?template=proposition-question.yml&titre=…&question=…
              │ le contributeur vérifie, coche la licence, valide
              │
              └─► issue étiquetée « proposition »
                    │
                    └─► proposition-vers-pr.yml
                          1. proposition_vers_json.py : issue → JSON
                          2. validate_schema.py       : forme
                          3. npm test                 : règles métier
                          4. branche + commit + PR vers dev
                          5. commentaire sur l'issue avec le lien de la PR
```

Fichiers concernés :

| Fichier | Rôle |
|---|---|
| `.github/ISSUE_TEMPLATE/proposition-question.yml` | le formulaire vu par le contributeur |
| `.github/ISSUE_TEMPLATE/config.yml` | renvoie vers le formulaire du site |
| `.github/workflows/proposition-vers-pr.yml` | issue → validation → pull request |
| `scripts/proposition_vers_json.py` | conversion et normalisation |
| `src/lib/infrastructure/github/issue-submitter.ts` | adaptateur du port `QuestionSubmitter` |
| `src/lib/domain/questions/donnees.test.ts` | règles métier appliquées aux données versionnées |

Le port `QuestionSubmitter` n'a pas changé : la soumission reste une URL. Seul
l'adaptateur a été remplacé — `GitHubPrSubmitter` (éditeur de fichiers) est
supprimé au profit de `GitHubIssueSubmitter`.

### Points d'attention

- **Préremplissage** : les paramètres d'URL portent les `id` des champs du
  formulaire d'issue. Seuls `input` et `textarea` acceptent d'être pré-remplis de
  façon fiable, d'où l'absence de liste déroulante dans le formulaire, même là où
  elle serait naturelle (type de question, recueil).
- **Validation dans le workflow, pas seulement dans `validate-pr.yml`** : une PR
  ouverte avec `GITHUB_TOKEN` déclenche bien `pull_request`, mais dans un état
  « approbation requise ». La validation est donc faite avant l'ouverture de la
  PR, ce qui permet aussi de commenter l'erreur sur l'issue du contributeur
  plutôt que de lui laisser une PR rouge.
- **Contenu non fiable** : le corps de l'issue est transmis au script Python par
  variable d'environnement, jamais interpolé dans une commande shell. Le nom du
  recueil est normalisé avant de servir de chemin de fichier, et le titre est
  débarrassé de ses sauts de ligne avant d'être écrit dans `GITHUB_OUTPUT`.
- **Vocabulaire de tags** : le script refuse un tag absent de
  `data/meta/tags.json`, ce qui applique enfin la décision « tags contrôlés » de
  la spec §1 côté CI.

### Effet de bord : la validation métier s'applique aux données

`donnees.test.ts` fait passer tous les fichiers de `data/` — recueils et
propositions — par `validerQuestion`, la fonction du domaine. Cela referme le
constat 2.1 de la revue : le schéma JSON ne sait pas exprimer qu'une réponse de
QCM doit être l'une des lettres proposées, et laissait passer `reponse: "Z"`
avec trois choix. Le test échoue désormais dessus.

## Prérequis avant la mise en service

1. **Remettre `dev` au niveau de `main`.** Le workflow crée la branche de
   proposition depuis `dev` et exécute les scripts qui s'y trouvent. `dev` étant
   resté au commit initial, la chaîne échouerait.
2. **Créer le label `proposition`** dans le dépôt (le formulaire d'issue le pose,
   mais GitHub exige qu'il existe).
3. **Autoriser les Actions à créer des pull requests** :
   Settings → Actions → General → « Allow GitHub Actions to create and approve
   pull requests ».
4. **Faire une répétition générale** : une issue de bout en bout, jusqu'au merge.

## Ce qui reste ouvert

La consolidation d'une proposition acceptée vers le fichier du recueil
(constat 1.1 de la revue) n'est pas traitée ici : une question mergée dans
`data/propositions/` reste invisible sur le site. C'est le prochain maillon à
construire.
