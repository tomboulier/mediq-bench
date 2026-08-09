# MediQ-Bench

**Medical Questions Benchmark** — Module user-friendly pour rédiger, versionner, et reviewer des jeux de questions-réponses cliniques par des médecins, avec versionnage sémantique et intégration git/GitHub.

Inspiré par le [INDICATE Data Dictionary](https://github.com/indicate-eu/data-dictionary) — son interface, son workflow de relecture, et son versionnage natif dans git.

## Pourquoi ?

Les cliniciens veulent contribuer à des jeux de données de benchmark pour évaluer les LLMs en médecine. Mais les outils actuels sont :
- CLI uniquement (type `llm-benchmark`)
- Pas de workflow de relecture
- Pas de versionnage explicite
- Pas pensé pour des non-informaticiens

MediQ-Bench veut combler ce trou : une interface simple où un médecin remplit un formulaire, et le résultat est un fichier JSON versionné dans git, prêt à être utilisé par des pipelines de benchmark.

---
*Documentation des réflexions dans `docs/` — structurée selon le framework BMAD.*