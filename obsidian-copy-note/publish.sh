#!/usr/bin/env bash
#
# Publica este plugin num repositório GitHub dedicado e cria a tag de release.
#
# COMO USAR:
#   1. Cria um repositório PÚBLICO e VAZIO no GitHub (sem README), por exemplo:
#        https://github.com/new  ->  nome: obsidian-copy-note-text
#   2. A partir desta pasta (obsidian-copy-note/), corre:
#        ./publish.sh <o-teu-utilizador> <nome-do-repo>
#      Exemplo:
#        ./publish.sh ruisloan obsidian-copy-note-text
#
# O script copia o conteúdo desta pasta para a RAIZ do novo repositório
# (requisito do Obsidian: manifest.json tem de estar na raiz), faz o primeiro
# commit, faz push e cria a tag 1.0.0 — o GitHub Action gera a release (draft)
# com os ficheiros main.js, manifest.json e versions.json.

set -euo pipefail

USER="${1:?Indica o teu utilizador do GitHub: ./publish.sh <user> <repo>}"
REPO="${2:?Indica o nome do repositorio: ./publish.sh <user> <repo>}"
VERSION="$(grep -oE '"version"[^,]*' manifest.json | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

SRC="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"

echo "==> A preparar o repositório em $TMP (versão $VERSION)"
cp -r "$SRC"/. "$TMP"/
cd "$TMP"
rm -f publish.sh                     # não precisa de ir para o repo do plugin
rm -rf .git node_modules

git init -q
git checkout -q -b main
git add .
git commit -q -m "Initial release: Copy Note Text v$VERSION"
git remote add origin "https://github.com/$USER/$REPO.git"

echo "==> A enviar para https://github.com/$USER/$REPO"
git push -u origin main

git tag "$VERSION"
git push origin "$VERSION"

echo
echo "✓ Concluído."
echo "  1. Vai a https://github.com/$USER/$REPO/releases e PUBLICA a release draft."
echo "  2. Submete o plugin ao diretório oficial (ver README, secção 'Submeter')."
