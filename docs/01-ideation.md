# Phase d'Idéation : BMAD Ideation

> Réflexions initiales sur MediQ-Bench. Document évolutif.
> Dernière mise à jour : 2026-07-31

## Contexte

Le projet [antibioprophylaxie-LLM-benchmark](https://github.com/tomboulier/antibioprophylaxie-LLM-benchmark) benchmarke des LLMs sur les RFE SFAR concernant l'antibioprophylaxie en chirurgie. Le dataset de questions-réponses est édité à la main (Markdown → JSON), nécessite de cloner le repo, et n'a pas de workflow de relecture intégré.

**Problème :** Les collègues médecins qui maîtrisent le contenu clinique ne peuvent pas contribuer facilement. Pas d'interface, pas de workflow de relecture, pas de versionnage explicite.

**Vision :** Créer une banque collaborative de questions-réponses cliniques, open science, versionnée, où n'importe quel médecin peut contribuer via une interface web simple.

**Cas d'usage concret :** Partager l'URL de l'outil lors du congrès SFAR (présentation du banc d'essai LLM sur les RFE d'antibioprophylaxie) et inviter les participants à contribuer à la banque de questions. S'inscrit dans la dynamique du Datathon annuel organisé par l'association [InterHop](https://interhop.org/) (communs numériques en santé, logiciel libre).

## User Personas

### 1. Rédacteur·ice (médecin clinicien·ne)
- **Qui :** Médecin spécialiste (anesthésiste, chirurgien·ne, infectiologue…) participant au Datathon ou au congrès SFAR
- **Compétences techniques :** Faibles : sait utiliser un navigateur web, remplir un formulaire
- **Objectif :** Proposer des questions-réponses basées sur son expertise clinique et les guidelines
- **Besoins :** Interface simple, guidée, sans concept technique (git, JSON, PR…)
- **Contexte :** Peut contribuer pendant le Datathon ou à distance

### 2. Évaluateur·ice / Comité d'experts
- **Qui :** Membre du comité scientifique du Datathon, référent·e de spécialité
- **Rôle :** Valide les questions, vérifie la conformité aux guidelines, approuve les montées de version
- **Besoins :** Workflow de relecture type "review de PR" : approuver, demander des modifications, rejeter
- **Déclencheur :** Une nouvelle question ou un lot de questions est soumis → notification → review

### 3. Scientifique des données / Data scientist
- **Qui :** Participant·e au Datathon, chercheur·euse utilisant les données pour évaluer des LLM
- **Rôle :** Consomme le dataset : pas de contribution directe à la création
- **Besoins :** Export propre, versionné, format compatible avec les pipelines d'évaluation
- **Contexte :** Veut pouvoir citer une version précise du dataset (ex: `v2.3.0`)

## Contexte SFAR / InterHop

- **SFAR :** Société Française d'Anesthésie et de Réanimation : émet les RFE (Recommandations Formalisaées d'Experts)
- **InterHop :** Association pour les communs numériques en santé (logiciels libres, serveurs, Datathons)
- **Datathon InterHop :** Hackathon annuel sur données de santé, ouvert aux médecins et data scientists
- **Lien avec le projet :** Le benchmark LLM sur les RFE d'antibioprophylaxie est présenté au congrès SFAR → MediQ-Bench permet aux participants de contribuer à la banque de questions

## Principes fondateurs

1. **User-friendly first** : un médecin non-technicien doit pouvoir créer une question en ≤ 3 clics
2. **Git-native** : le versionning est celui de git, pas une DB externe
3. **SemVer automatique** : chaque release est une PR mergée, version incrémentée automatiquement
4. **Science ouverte** : tout est public, forkable, réutilisable (licence ouverte)
5. **Pas de vendor lock-in** : données en JSON/Markdown, exportables, pas de format propriétaire
6. **Zéro backend** : static SPA déployée sur GitHub Pages, pas de serveur à gérer
7. **Review workflow** : calqué sur le modèle des PR GitHub : brouillon → soumis → approuvé → modifié → publié

## Inspiration : INDICATE Data Dictionary

| Fonctionnalité | Détail |
|---------------|--------|
| Interface static SPA | Vanilla HTML/CSS/JS, aucun framework : déploiement trivial (GitHub Pages) |
| Données en JSON | Un fichier JSON par concept set, directement dans git |
| Versionnage semver | `v1.0.0`, `v1.1.0`, etc. avec snapshot SHA |
| Workflow review | Statuts : draft → pending review → approved → needs revision → deprecated |
| Contribution | "Propose on GitHub" → lien direct vers l'éditeur GitHub pour PR |
| Multilingue | EN/FR natif, extensible |
| Forkable | `config.json` + `reset.py` pour bootstrapper son propre dictionnaire |

### Ce qu'on adapte

- Interface formulaire pour saisir questions + réponses attendues + références
- Un fichier JSON par question (ou par lot)
- Versionnage semver avec snapshot SHA
- Review workflow : draft → pending → approved
- "Propose on GitHub" → ouvre une PR automatique
- Déploiement statique (GitHub Pages)

### Ce qu'on change / ajoute

- Pas de concept OHDSI/OMOP : ici c'est des questions cliniques avec réponses
- Références aux guidelines / recommandations comme métadonnées obligatoires
- Système de tags / catégories (spécialité, type de chirurgie, niveau d'urgence…)
- Export compatible `llm-benchmark` (format déjà existant)
- Workflow de release : PR mergée → SemVer bump automatique

## Décisions de la phase 1

| Question | Décision |
|----------|---------|
| **Format de donnée** | JSON : exploitable directement par le banc d'essai. Le format est un détail d'implémentation (Clean Architecture) |
| **Éditeur** | Formulaire web SPA dans le navigateur : l'utilisateur ne voit que du contenu médical, pas le format |
| **Réponses multiples** | Non : une seule réponse par question (texte pour Open, lettre pour MCQ). Le dataset existant a 138 open + 33 MCQ |
| **Auth** | MVP : connexion GitHub, bouton "Proposer sur GitHub" → ouvre l'éditeur GitHub pour PR. À terme : SSO SFAR.org. Phase dev/expérimentation sur GitHub perso de Thomas, migration GitLab SFAR dans un second temps, si le groupe numérique SFAR valide l'outil → l'outil doit être agnostique de la plateforme (GitHub/GitLab) |
| **Export** | Modularité hexagonale : format canonique MediQ-Bench + adaptateur d'export vers `benchmark.json`. D'autres formats peuvent être ajoutés |
| **Licence** | Données : **CC-BY 4.0** (attribution requise). Code : **EUPL-1.2** (souveraineté, valeurs européennes) |
| **Hébergement** | MVP : GitHub perso. À terme : GitLab (groupe SFAR OUTILS, privé) |

## Prochaines étapes (phase 2 : Specification)

1. Définir le **data model** (schéma canonique d'une question)
2. Cartographier le **workflow utilisateur** (création → MR → review → merge → release)
3. Spécifier le **MVP** pour le congrès SFAR