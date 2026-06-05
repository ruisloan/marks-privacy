"use strict";

/*
 * Copy Note Text — Obsidian plugin
 * Adds a "copy" icon to the note's action bar (top-right, next to the reading
 * view and the more-options "..." menu). Clicking it instantly copies the
 * note's entire text to the clipboard.
 *
 * This file is the plain JavaScript build (CommonJS), ready to be used by
 * Obsidian without any compilation. The TypeScript source is in main.ts.
 */

const obsidian = require("obsidian");

// We use Obsidian's native "copy" icon (lucide), so it looks identical to the
// other icons in the action bar.
const ICON_ID = "copy";
const ACTION_FLAG = "__copyNoteActionAdded";

class CopyNotePlugin extends obsidian.Plugin {
  async onload() {
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
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!view) return false;
        if (!checking) this.copyNote(view);
        return true;
      },
    });
  }

  // Adds the copy icon to the active Markdown view, avoiding duplicates.
  addCopyButton() {
    const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
    if (!view || view[ACTION_FLAG]) return;

    view.addAction(ICON_ID, "Copy entire note text", () =>
      this.copyNote(view)
    );
    view[ACTION_FLAG] = true;
  }

  // Copies the note's entire (markdown) content to the clipboard.
  async copyNote(view) {
    const content = view.getViewData();

    if (!content) {
      new obsidian.Notice("The note is empty.");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      new obsidian.Notice("Note copied to clipboard ✓");
    } catch (err) {
      console.error("Copy Note Text: failed to copy", err);
      new obsidian.Notice("Could not copy the note.");
    }
  }
}

module.exports = CopyNotePlugin;
