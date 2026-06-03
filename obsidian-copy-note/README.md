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
