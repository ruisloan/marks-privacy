import { MarkdownView, Notice, Plugin } from "obsidian";

/*
 * Copy Note Text — Obsidian plugin
 * Adiciona um ícone de "copiar" na barra de ações da nota (canto superior
 * direito, junto ao ícone de leitura e ao menu "..."). Ao clicar, copia
 * automaticamente todo o texto da nota para a área de transferência.
 */

// Usamos o ícone "copy" nativo do Obsidian (lucide), com aspeto idêntico ao
// dos restantes ícones da barra de ações.
const ICON_ID = "copy";
const ACTION_FLAG = "__copyNoteActionAdded";

export default class CopyNotePlugin extends Plugin {
  async onload(): Promise<void> {
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
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (!checking) void this.copyNote(view);
        return true;
      },
    });
  }

  // Adiciona o ícone de copiar à vista Markdown ativa, evitando duplicados.
  private addCopyButton(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || (view as unknown as Record<string, boolean>)[ACTION_FLAG]) {
      return;
    }

    view.addAction(ICON_ID, "Copiar todo o texto da nota", () =>
      void this.copyNote(view)
    );
    (view as unknown as Record<string, boolean>)[ACTION_FLAG] = true;
  }

  // Copia todo o conteúdo (markdown) da nota para a área de transferência.
  private async copyNote(view: MarkdownView): Promise<void> {
    const content = view.getViewData();

    if (!content) {
      new Notice("A nota está vazia.");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      new Notice("Nota copiada para a área de transferência ✓");
    } catch (err) {
      console.error("Copy Note Text: falha ao copiar", err);
      new Notice("Não foi possível copiar a nota.");
    }
  }
}
