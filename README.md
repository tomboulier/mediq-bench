# MediQ-Bench

Banc d'essai collaboratif de questions-réponses cliniques : un module convivial pour rédiger, versionner et relire des jeux de questions-réponses par des médecins, avec versionnage sémantique et intégration git/GitHub.

Projet issu de [antibioprophylaxie-LLM-benchmark](https://github.com/tomboulier/antibioprophylaxie-LLM-benchmark), banc d'essai évaluant des LLM sur les RFE SFAR d'antibioprophylaxie en chirurgie. Inspiré par le [INDICATE Data Dictionary](https://github.com/indicate-eu/data-dictionary) : son interface, son workflow de relecture, et son versionnage natif dans git.

Site : https://tomboulier.github.io/mediq-bench/

## Pourquoi ?

Les cliniciens veulent contribuer à des bancs d'essai pour évaluer les LLM en médecine. Mais les outils actuels sont :
- CLI uniquement
- Sans workflow de relecture
- Sans versionnage explicite
- Pas pensés pour des non-informaticiens

MediQ-Bench veut combler ce trou : une interface simple où un médecin remplit un formulaire, et le résultat est un fichier JSON versionné dans git, prêt pour les pipelines d'évaluation.

---
*Documentation des réflexions dans `docs/` : structurée selon le framework BMAD. Données CC-BY 4.0, code EUPL-1.2.*
