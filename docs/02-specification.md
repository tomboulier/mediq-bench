# Phase 2 : Specification (BMAD Planning)

> Spécifications fonctionnelles et techniques de MediQ-Bench.
> Document évolutif, rempli au fil des interviews BMAD.
> Dernière mise à jour : 2026-07-31

## 1. Data Model

### Métadonnées auteurs

**Décision :** Simple pour le MVP : un nom/prénom. Pas d'ORCID, affiliation ou email pour l'instant.

- [ ] Backlog : étoffer les métadonnées auteurs (ORCID, affiliation, email) : nécessaire pour l'attribution CC-BY détaillée

### Références aux guidelines

**Décision :** Simple pour le MVP : titre de la recommandation + URL. Pas de section, page ou extrait pour l'instant.

- [ ] Backlog : préciser le système de citation (section, page, extrait) si le besoin se fait sentir

### Tags / catégories

**Décision :** Tags contrôlés : liste pré-définie, gérée par les mainteneurs du projet (Thomas et le comité). Pas de tags libres saisis par l'auteur pour le MVP.

### Organisation des fichiers

**Décision :** Un fichier JSON par RFE (Recommandation Formalisée d'Expert). Ex: `antibioprophylaxie.json`, `anticoagulants.json`, etc. Chaque fichier contient toutes les questions relatives à une RFE. L'export unifié (HuggingFace, CodaBench, etc.) consolide tous les fichiers.

### Statuts de relecture (reviewStatus)

**Décision :** Workflow complet : `draft` → `pending_review` → `approved` → `deprecated`. Chaque question passe par ces états au cours de son cycle de vie.

## 2. Workflow utilisateur

### Parcours général

1. Le médecin arrive sur la SPA (interface web)
2. Il remplit un formulaire (question, réponse, référence, son nom)
3. Il clique "Soumettre" → ouvre une Pull Request (PR) sur GitHub (MVP) via l'éditeur pré-rempli
4. La question est créée en statut `draft`
5. Le comité d'experts reçoit une notification, review la PR
6. Si OK → merge sur `dev` → la question passe en `approved`
7. Validation finale → merge de `dev` vers `main`
8. CI/CD déclenche une release automatique avec SemVer bump
9. Publication du dataset versionné

### Git workflow

**Décision :** Branches (agnostique : GitHub et GitLab) :
- `main` : releases officielles, version SemVer publiée
- `dev` : branche d'intégration, les PR des contributeurs arrivent ici
- Les contributeurs travaillent sur des branches dédiées (ex: `feat/antibioprophylaxie-q15`)

**Décision :** Le merge de `dev` vers `main` déclenche via CI/CD :
- Bump SemVer automatique
- Publication du dataset (HuggingFace, CodaBench...)

## 3. Versionning SemVer

**Règles :**
- **Patch** (`1.0.0` → `1.0.1`) : corrections, typos, reformulation sans changement de sens. Corrections de métadonnées existantes (ex: URL de guideline corrigée).
- **Minor** (`1.0.0` → `1.1.0`) : nouvelle question, nouvelle RFE, reformulation (équivaut à une nouvelle version de question), suppression de question.
- **Major** (`1.0.0` → `2.0.0`) : changement du schéma de données (incompatibilité). Ex: ajout d'un champ obligatoire, modification de la structure d'un champ existant.

## 4. Scope MVP (congrès SFAR)

**Objectif :** Partager l'URL de l'outil lors de la présentation du banc d'essai LLM sur les RFE d'antibioprophylaxie, et permettre aux participants de contribuer.

| Fonctionnalité | MVP | Note |
|---|---|---|
| Créer une question (formulaire web) | ✅ Requis | Cœur de l'outil |
| Consulter les questions existantes | ✅ Requis | Parcourir, filtrer |
| Connexion GitHub/GitLab | ✅ Requis | Pour soumettre une PR. MVP sur GitHub perso, migration GitLab SFAR dans un second temps |
| Export du dataset | ❌ Plus tard | Pour les data scientists |
| Review workflow complet | ❌ Plus tard | Pas besoin de fonctionner le jour J

## 5. Review process

**Décision :** Pour le MVP, il n'y a pas de système de review custom : on utilise les fonctionnalités natives de la plateforme (GitHub pour le MVP, GitLab SFAR après migration) :

- **Reviewer unique :** Thomas pour le MVP
- **Gestion des droits :** via les rôles GitHub/GitLab (Maintainer, Contributor…) : pas de système custom
- **Montée en puissance :**
  1. Membre du **groupe numérique SFAR** (co-auteurs de l'abstract, organisateurs du Datathon)
  2. À terme : **Comité des Référentiels Cliniques (CRC)** et experts désignés par RFE
- **Workflow :** une PR est assignée à un reviewer → approve ou request changes → merge sur `dev`
- **Notifications :** la plateforme notifie par email automatiquement

## 6. Contraintes non-fonctionnelles

### Langue

**Décision :** Tout en français pour le MVP : interface, données, clés JSON. Le public cible est la SFAR (Société Française d'Anesthésie et de Réanimation), les questions sont en français pour des francophones. L'anglais (bilingue EN/FR) sera envisagé dans un second temps, pour passer à l'échelle européenne.

### Mobile

**Décision :** Pas d'application mobile dédiée. Un design web responsive (adapté aux écrans mobiles) est un plus si naturel avec les technos choisies, mais pas un requis. Une app mobile dédiée serait trop de travail pour le MVP.
