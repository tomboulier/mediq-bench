#!/usr/bin/env python3
"""Convertit une issue « proposition de question » en fichier JSON de proposition.

L'issue est produite par le formulaire GitHub `.github/ISSUE_TEMPLATE/proposition-question.yml`,
lui-même pré-rempli par le formulaire du site. GitHub rend le corps de l'issue sous forme
de sections `### <libellé>` suivies de la valeur saisie.

Le corps de l'issue est du **contenu non fiable** : il arrive par une variable
d'environnement et n'est jamais interpolé dans une commande shell.

Variables d'environnement :
- CORPS_ISSUE   : corps de l'issue (github.event.issue.body)
- NUMERO_ISSUE  : numéro de l'issue, pour la traçabilité
- GITHUB_OUTPUT : fichier de sortie des steps (optionnel, fourni par GitHub Actions)

Écrit `data/propositions/<rfe>/<uuid>.json` et expose `chemin`, `id`, `rfe`, `titre`
en sortie de step. Sort avec un code non nul et un message lisible si la proposition
est incomplète.
"""

import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
ABSENT = "_No response_"

# Libellé de section dans l'issue → clé interne. Doit rester aligné avec le
# formulaire d'issue : GitHub écrit les *libellés*, pas les identifiants de champ.
CHAMPS = {
    "Recommandation concernée": "rfe",
    "Titre court": "titre",
    "Type de question": "type",
    "Question": "question",
    "Choix de réponse (QCM uniquement)": "choix",
    "Réponse attendue": "reponse",
    "Références aux recommandations": "references",
    "Tags": "tags",
    "Votre nom": "auteur",
}


def decouper_sections(corps: str) -> dict[str, str]:
    """Découpe le corps de l'issue en sections `### libellé` → valeur."""
    sections: dict[str, str] = {}
    libelle = None
    lignes: list[str] = []
    for ligne in corps.replace("\r\n", "\n").split("\n"):
        if ligne.startswith("### "):
            if libelle is not None:
                sections[libelle] = "\n".join(lignes).strip()
            libelle = ligne[4:].strip()
            lignes = []
        elif libelle is not None:
            lignes.append(ligne)
    if libelle is not None:
        sections[libelle] = "\n".join(lignes).strip()
    return {
        libelle: ("" if valeur == ABSENT else valeur) for libelle, valeur in sections.items()
    }


def lire_champs(corps: str) -> dict[str, str]:
    sections = decouper_sections(corps)
    manquants = [libelle for libelle in CHAMPS if libelle not in sections]
    if manquants:
        sys.exit(
            "Sections absentes de l'issue : "
            + ", ".join(manquants)
            + ".\nLa proposition a-t-elle bien été créée depuis le formulaire du site ?"
        )
    return {cle: sections[libelle] for libelle, cle in CHAMPS.items()}


def analyser_references(brut: str) -> list[dict[str, str]]:
    references = []
    for ligne in (l.strip() for l in brut.split("\n")):
        if not ligne:
            continue
        titre, separateur, url = ligne.partition("|")
        if not separateur:
            sys.exit(f"Référence mal formée (attendu « Titre | URL ») : {ligne}")
        references.append({"titre": titre.strip(), "url": url.strip()})
    return references


def analyser_tags(brut: str) -> list[str]:
    tags = [tag.strip() for tag in brut.split(",") if tag.strip()]
    vocabulaire = json.loads(
        (RACINE / "data" / "meta" / "tags.json").read_text(encoding="utf-8")
    )
    inconnus = [tag for tag in tags if tag not in vocabulaire]
    if inconnus:
        sys.exit(
            "Tags hors du vocabulaire contrôlé : "
            + ", ".join(inconnus)
            + f"\nTags acceptés : {', '.join(vocabulaire)}"
        )
    return tags


def construire_question(champs: dict[str, str]) -> dict:
    type_ = champs["type"].strip().lower()
    if type_ not in ("ouverte", "qcm"):
        sys.exit(f"Type de question inconnu : « {champs['type']} » (attendu : ouverte ou qcm)")

    question = {
        "id": str(uuid.uuid4()),
        "titre": champs["titre"].strip(),
        "question": champs["question"].strip(),
        "auteur": champs["auteur"].strip(),
        "creeLe": datetime.now(timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z"),
        "statut": "draft",
        "references": analyser_references(champs["references"]),
        "tags": analyser_tags(champs["tags"]),
        "type": type_,
    }

    if type_ == "qcm":
        choix = [c.strip() for c in champs["choix"].split("\n") if c.strip()]
        if len(choix) < 2:
            sys.exit("Un QCM doit proposer au moins deux choix, un par ligne.")
        question["choix"] = choix
        question["reponse"] = champs["reponse"].strip().upper()
    else:
        question["reponse"] = champs["reponse"].strip()

    return question


def nom_de_fichier_sur(rfe: str) -> str:
    """Empêche qu'un nom de recueil saisi librement échappe de data/propositions/."""
    nettoye = re.sub(r"[^a-z0-9-]", "-", rfe.strip().lower()).strip("-")
    if not nettoye:
        sys.exit("Recommandation concernée : valeur vide ou invalide.")
    return nettoye


def main() -> int:
    corps = os.environ.get("CORPS_ISSUE", "")
    if not corps.strip():
        sys.exit("Issue vide : rien à convertir.")

    champs = lire_champs(corps)
    rfe = nom_de_fichier_sur(champs["rfe"])
    question = construire_question(champs)

    dossier = RACINE / "data" / "propositions" / rfe
    dossier.mkdir(parents=True, exist_ok=True)
    chemin = dossier / f"{question['id']}.json"
    chemin.write_text(
        json.dumps(question, indent="\t", ensure_ascii=False) + "\n", encoding="utf-8"
    )

    relatif = chemin.relative_to(RACINE).as_posix()
    print(f"Proposition écrite : {relatif}")

    if sortie := os.environ.get("GITHUB_OUTPUT"):
        # Le titre vient de l'utilisateur : on retire tout saut de ligne, sans quoi
        # il pourrait injecter des sorties de step supplémentaires.
        titre = " ".join(question["titre"].split())[:120]
        with open(sortie, "a", encoding="utf-8") as fichier:
            fichier.write(f"chemin={relatif}\n")
            fichier.write(f"id={question['id']}\n")
            fichier.write(f"rfe={rfe}\n")
            fichier.write(f"titre={titre}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
