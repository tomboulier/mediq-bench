#!/usr/bin/env python3
"""Valide les données MediQ-Bench contre le schéma des questions.

Vérifie :
- chaque fichier RFE (data/*.json, liste de questions)
- chaque proposition soumise (data/propositions/**/*.json, une question par fichier)

Sort avec un code non nul si au moins une question est invalide.
"""

import json
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    sys.exit("Dépendance manquante : pip install jsonschema")

RACINE = Path(__file__).resolve().parent.parent
SCHEMA = json.loads((RACINE / "scripts" / "schema-question.json").read_text(encoding="utf-8"))


def valider(question: dict) -> str | None:
    """Retourne le message d'erreur, ou None si la question est valide."""
    try:
        jsonschema.validate(question, SCHEMA)
        return None
    except jsonschema.ValidationError as e:
        chemin = ".".join(str(p) for p in e.absolute_path)
        return f"{chemin}: {e.message}" if chemin else e.message


def main() -> int:
    erreurs = 0

    for fichier in sorted((RACINE / "data").glob("*.json")):
        for index, question in enumerate(json.loads(fichier.read_text(encoding="utf-8"))):
            if erreur := valider(question):
                print(f"{fichier.name}[{index}] ({question.get('id', '?')}) : {erreur}")
                erreurs += 1

    for fichier in sorted((RACINE / "data" / "propositions").rglob("*.json")):
        if erreur := valider(json.loads(fichier.read_text(encoding="utf-8"))):
            print(f"{fichier.relative_to(RACINE)} : {erreur}")
            erreurs += 1

    if erreurs:
        print(f"\n{erreurs} question(s) invalide(s)")
        return 1
    print("Toutes les questions sont valides")
    return 0


if __name__ == "__main__":
    sys.exit(main())
