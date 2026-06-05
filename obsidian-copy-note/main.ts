import { MarkdownView, Notice, Plugin } from "obsidian";

/*
 * Copy Note Text — Obsidian plugin
 * Adds a "copy" icon to the note's action bar (top-right, next to the reading
 * view and the more-options "..." menu). Clicking it instantly copies the
 * note's entire text to the clipboard.
 */

// We use Obsidian's native "copy" icon (lucide), so it looks identical to the
// other icons in the action bar.
const ICON_ID = "copy";
const ACTION_FLAG = "__copyNoteActionAdded";

export default class CopyNotePlugin extends Plugin {
  async onload(): Promise<void> {
    // Add the button whenever the active view or the layout changes.
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.addCopyButton())
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.addCopyButton())
    );

    // Make sure the button is added to notes already open on startup.
    this.app.workspace.onLayoutReady(() => this.addCopyButton());

    // Equivalent command (searchable in the palette and assignable to a hotkey).
    this.addCommand({
      id: "copy-entire-note",
      name: "Copy entire note text",
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (!checking) void this.copyNote(view);
        return true;
      },
    });
  }

  // Adds the copy icon to the active Markdown view, avoiding duplicates.
  private addCopyButton(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || (view as unknown as Record<string, boolean>)[ACTION_FLAG]) {
      return;
    }

    view.addAction(ICON_ID, "Copy entire note text", () =>
      void this.copyNote(view)
    );
    (view as unknown as Record<string, boolean>)[ACTION_FLAG] = true;
  }

  // Copies the note's entire (markdown) content to the clipboard.
  private async copyNote(view: MarkdownView): Promise<void> {
    const content = view.getViewData();

    if (!content) {
      new Notice("The note is empty.");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      new Notice("Note copied to clipboard ✓");
    } catch (err) {
      console.error("Copy Note Text: failed to copy", err);
      new Notice("Could not copy the note.");
    }
  }
}
