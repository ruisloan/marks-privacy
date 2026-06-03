"use strict";

/*
 * Copy Note Text — Obsidian plugin
 * Adiciona um ícone de "copiar" na barra de ações da nota (canto superior
 * direito, junto ao ícone de leitura e ao menu "..."). Ao clicar, copia
 * automaticamente todo o texto da nota para a área de transferência.
 *
 * Este ficheiro é o build em JavaScript puro (CommonJS), pronto a usar pelo
 * Obsidian sem necessidade de compilação. O código-fonte em TypeScript está
 * em main.ts.
 */

const obsidian = require("obsidian");

// Usamos o ícone "copy" nativo do Obsidian (lucide), com aspeto idêntico ao
// dos restantes ícones da barra de ações.
const ICON_ID = "copy";
const ACTION_FLAG = "__copyNoteActionAdded";

class CopyNotePlugin extends obsidian.Plugin {
  async onload() {
    // Adiciona o botão sempre que a vista ativa muda ou o layout é alterado.
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.addCopyButton())
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.addCopyButton())
    );

    // Garante que o botão é adicionado às notas já abertas ao iniciar.
    this.app.workspace.onLayoutReady(() => this.addCopyButton());

    // Comando equivalente (pesquisável na paleta e atribuível a um atalho).
    this.addCommand({
      id: "copy-entire-note",
      name: "Copiar todo o texto da nota",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!view) return false;
        if (!checking) this.copyNote(view);
        return true;
      },
    });
  }

  // Adiciona o ícone de copiar à vista Markdown ativa, evitando duplicados.
  addCopyButton() {
    const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
    if (!view || view[ACTION_FLAG]) return;

    view.addAction(ICON_ID, "Copiar todo o texto da nota", () =>
      this.copyNote(view)
    );
    view[ACTION_FLAG] = true;
  }

  // Copia todo o conteúdo (markdown) da nota para a área de transferência.
  async copyNote(view) {
    const content = view.getViewData();

    if (!content) {
      new obsidian.Notice("A nota está vazia.");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      new obsidian.Notice("Nota copiada para a área de transferência ✓");
    } catch (err) {
      console.error("Copy Note Text: falha ao copiar", err);
      new obsidian.Notice("Não foi possível copiar a nota.");
    }
  }
}

module.exports = CopyNotePlugin;
