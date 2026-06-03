# Copy Note Text — plugin para Obsidian

Adiciona um **ícone de copiar** na barra de ações da nota (canto superior
direito, junto ao ícone de leitura e ao menu `…`). Ao clicar, copia
**automaticamente todo o texto da nota** para a área de transferência.

![onde aparece o ícone](docs/icon-location.png)

## Funcionalidades

- Ícone de copiar nativo na barra de ações de cada nota Markdown.
- Copia todo o conteúdo (markdown) da nota com um único clique.
- Notificação de confirmação ("Nota copiada para a área de transferência ✓").
- Comando equivalente na paleta: **"Copiar todo o texto da nota"**, ao qual
  podes atribuir um atalho de teclado.
- Funciona em desktop e mobile.

## Instalação manual

1. Cria a pasta do plugin no teu cofre (vault):

   ```
   <o-teu-cofre>/.obsidian/plugins/copy-note-text/
   ```

2. Copia para essa pasta os ficheiros:

   - `main.js`
   - `manifest.json`

3. No Obsidian, vai a **Definições → Plugins de terceiros**, ativa os plugins
   da comunidade (se necessário) e ativa **Copy Note Text**.

> O `main.js` já vem compilado e pronto a usar — não é preciso compilar nada
> para a instalação manual.

## Publicar para que qualquer pessoa instale (plugin da comunidade)

Para o plugin aparecer em **Definições → Plugins de terceiros → Procurar** dentro
do Obsidian, tem de estar no seu **próprio repositório público** (com o
`manifest.json` na raiz) e ser aceite no diretório oficial. Passos:

### 1. Criar o repositório dedicado e publicar

1. Cria um repositório **público e vazio** (sem README) em
   <https://github.com/new>, por ex. `obsidian-copy-note-text`.
2. A partir desta pasta, corre o script incluído:

   ```bash
   ./publish.sh <o-teu-utilizador> obsidian-copy-note-text
   ```

   Isto copia os ficheiros para a raiz do novo repo, faz o primeiro commit e
   cria a tag `1.0.0`. O **GitHub Action** (`.github/workflows/release.yml`)
   gera automaticamente uma *release* com os ficheiros `main.js`,
   `manifest.json` e `versions.json`.
3. Vai a `releases` no repositório e **publica** a release (sai de *draft*).

### 2. Submeter ao diretório oficial

1. Faz **fork** de <https://github.com/obsidianmd/obsidian-releases>.
2. Edita `community-plugins.json` e adiciona no fim a entrada (template em
   `community-plugins-entry.json`, substitui o campo `repo`):

   ```json
   {
     "id": "copy-note-text",
     "name": "Copy Note Text",
     "author": "Central Brain Trust",
     "description": "Copia automaticamente todo o texto da nota a partir de um ícone na barra de ações.",
     "repo": "<o-teu-utilizador>/obsidian-copy-note-text"
   }
   ```

3. Abre um **Pull Request**. Um bot valida e depois a equipa do Obsidian revê
   manualmente (pode demorar). Guias oficiais:
   <https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin>.

Depois de aprovado, o plugin fica instalável por qualquer pessoa diretamente
dentro do Obsidian, com atualizações automáticas a cada nova release.

### Alternativa imediata (sem revisão): BRAT

Quem quiser usar já, antes da aprovação oficial, pode instalar o plugin **BRAT**
e adicionar o teu repositório (`<o-teu-utilizador>/obsidian-copy-note-text`).
O BRAT instala e mantém o plugin atualizado a partir das tuas releases.

## Desenvolvimento (opcional)

Se quiseres alterar o código-fonte (`main.ts`):

```bash
npm install
npm run dev     # build em modo watch
npm run build   # build de produção
```

## Como usar

Abre qualquer nota e clica no novo ícone de copiar no canto superior direito.
Todo o texto da nota fica imediatamente na tua área de transferência, pronto
para colar onde quiseres.

## Licença

MIT
