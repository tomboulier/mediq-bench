#!/usr/bin/env python3
"""Calcule le bump SemVer d'une release à partir du label de la PR mergée.

Le type de bump est déterminé par le label de la PR mergée dans `main` :
`release:patch`, `release:minor` ou `release:major` (défaut : patch).

Variables d'environnement (fournies par GitHub Actions) :
- GH_TOKEN : token d'API (GITHUB_TOKEN)
- GITHUB_REPOSITORY : owner/repo
- GITHUB_SHA : SHA du commit de merge
- GITHUB_OUTPUT : fichier de sortie des steps

Écrit la nouvelle version dans version.json, ajoute une entrée au
CHANGELOG.md, et expose `new_version` en sortie de step.
"""

import json
import os
import sys
import urllib.request
from datetime import date
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
REGEX_SEMVER = __import__("re").compile(r"^(\d+)\.(\d+)\.(\d+)$")


def pr_mergee() -> dict | None:
    """Retourne la PR associée au commit de merge courant."""
    repo = os.environ["GITHUB_REPOSITORY"]
    sha = os.environ["GITHUB_SHA"]
    requete = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/commits/{sha}/pulls",
        headers={
            "Authorization": f"Bearer {os.environ['GH_TOKEN']}",
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(requete) as reponse:
        prs = json.load(reponse)
    if not prs:
        # Push direct sans PR (ex: initialisation du repo) : pas de bump
        return None
    return prs[0]


def type_bump(pr: dict) -> str:
    labels = {label["name"] for label in pr.get("labels", [])}
    for type_ in ("patch", "minor", "major"):
        if f"release:{type_}" in labels:
            return type_
    print("Aucun label release:* sur la PR, bump patch par défaut")
    return "patch"


def bumper(version: str, type_: str) -> str:
    correspondance = REGEX_SEMVER.match(version)
    if not correspondance:
        sys.exit(f"Version SemVer invalide dans version.json : {version}")
    major, minor, patch = (int(g) for g in correspondance.groups())
    if type_ == "major":
        return f"{major + 1}.0.0"
    if type_ == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"


def main() -> int:
    pr = pr_mergee()
    fichier_version = RACINE / "version.json"
    version_actuelle = json.loads(fichier_version.read_text(encoding="utf-8"))["version"]

    if pr is None:
        print(f"Aucune PR associée : publication de v{version_actuelle} sans bump")
        nouvelle = version_actuelle
    else:
        nouvelle = bumper(version_actuelle, type_bump(pr))
        fichier_version.write_text(
            json.dumps({"version": nouvelle}, indent="\t") + "\n", encoding="utf-8"
        )
        changelog = RACINE / "CHANGELOG.md"
        contenu = changelog.read_text(encoding="utf-8") if changelog.exists() else "# Changelog\n"
        entree = f"\n## v{nouvelle} ({date.today().isoformat()})\n\n- {pr['title']} (#{pr['number']})\n"
        changelog.write_text(contenu.rstrip() + "\n" + entree, encoding="utf-8")
        print(f"v{version_actuelle} -> v{nouvelle} : {pr['title']}")

    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as sortie:
        sortie.write(f"new_version={nouvelle}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
