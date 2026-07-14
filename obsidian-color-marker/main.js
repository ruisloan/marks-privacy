"use strict";

/*
 * Color Marker — Obsidian plugin
 * Right-click any folder or note in the file explorer and pick one of 12
 * calendar-style colors to mark it. The item's name is tinted and gets a
 * colored dot, so you can spot it instantly. Colors can be changed or
 * removed at any time and survive restarts, renames and moves.
 *
 * This file is the plain JavaScript build (CommonJS), ready to be used by
 * Obsidian without any compilation. The TypeScript source is in main.ts.
 */

const obsidian = require("obsidian");

// 12-color palette inspired by Google Calendar.
const COLORS = [
  { name: "Tomato", value: "#D50000" },
  { name: "Cherry", value: "#D81B60" },
  { name: "Flamingo", value: "#E67C73" },
  { name: "Tangerine", value: "#F4511E" },
  { name: "Banana", value: "#F6BF26" },
  { name: "Sage", value: "#33B679" },
  { name: "Basil", value: "#0B8043" },
  { name: "Peacock", value: "#039BE5" },
  { name: "Blueberry", value: "#3F51B5" },
  { name: "Lavender", value: "#7986CB" },
  { name: "Grape", value: "#8E24AA" },
  { name: "Graphite", value: "#616161" },
];

const MARK_CLASS = "color-marker-item";

class ColorMarkerPlugin extends obsidian.Plugin {
  async onload() {
    const data = await this.loadData();
    // Map of vault path -> hex color.
    this.colors = (data && data.paths) || {};

    // "Color marker" entry in the right-click menu of files AND folders.
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        menu.addItem((item) => {
          item.setTitle("Color marker").setIcon("palette");
          if (typeof item.setSubmenu === "function") {
            // Desktop: proper submenu with the 12 swatches.
            this.buildColorMenu(item.setSubmenu(), file);
          } else {
            // Fallback (older/mobile): open a small swatch modal instead.
            item.onClick(() => new ColorPickerModal(this.app, this, file).open());
          }
        });
      })
    );

    // Keep colors attached to items when they are renamed or moved.
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        let changed = false;
        for (const path of Object.keys(this.colors)) {
          if (path === oldPath || path.startsWith(oldPath + "/")) {
            this.colors[file.path + path.slice(oldPath.length)] = this.colors[path];
            delete this.colors[path];
            changed = true;
          }
        }
        if (changed) this.saveColors().then(() => this.applyAll());
      })
    );

    // Clean up colors of deleted items.
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (this.colors[file.path]) {
          delete this.colors[file.path];
          this.saveColors();
        }
      })
    );

    // Paint the explorer now and whenever it re-renders.
    this.app.workspace.onLayoutReady(() => {
      this.watchExplorers();
      this.applyAll();
    });
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.watchExplorers();
        this.applyAll();
      })
    );
  }

  onunload() {
    document.querySelectorAll("." + MARK_CLASS).forEach((el) => {
      el.classList.remove(MARK_CLASS);
      el.style.removeProperty("--color-marker");
    });
  }

  // Builds the swatch list inside a Menu (used by the submenu).
  buildColorMenu(menu, file) {
    const current = this.colors[file.path];
    for (const c of COLORS) {
      menu.addItem((item) => {
        const frag = document.createDocumentFragment();
        const dot = document.createElement("span");
        dot.className = "color-marker-swatch";
        dot.style.backgroundColor = c.value;
        frag.appendChild(dot);
        frag.appendChild(document.createTextNode(c.name));
        item.setTitle(frag).onClick(() => this.setColor(file.path, c.value));
        if (typeof item.setChecked === "function") {
          item.setChecked(current === c.value);
        }
      });
    }
    menu.addSeparator();
    menu.addItem((item) =>
      item
        .setTitle("Remove color")
        .setIcon("x")
        .setDisabled(!current)
        .onClick(() => this.setColor(file.path, null))
    );
  }

  async setColor(path, color) {
    if (color) this.colors[path] = color;
    else delete this.colors[path];
    await this.saveColors();
    this.applyAll();
  }

  saveColors() {
    return this.saveData({ paths: this.colors });
  }

  // Re-applies colors whenever the file explorer re-renders its tree.
  watchExplorers() {
    if (!this.observer) {
      this.observer = new MutationObserver(() => this.scheduleApply());
      this.register(() => this.observer.disconnect());
      this.observed = new WeakSet();
    }
    for (const leaf of this.app.workspace.getLeavesOfType("file-explorer")) {
      const el = leaf.view && leaf.view.containerEl;
      if (el && !this.observed.has(el)) {
        this.observer.observe(el, { childList: true, subtree: true });
        this.observed.add(el);
      }
    }
  }

  scheduleApply() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      this.applyAll();
    });
  }

  applyAll() {
    for (const leaf of this.app.workspace.getLeavesOfType("file-explorer")) {
      const root = leaf.view && leaf.view.containerEl;
      if (!root) continue;
      root.querySelectorAll("[data-path]").forEach((el) => {
        const color = this.colors[el.getAttribute("data-path")];
        if (color) {
          if (el.style.getPropertyValue("--color-marker") !== color) {
            el.style.setProperty("--color-marker", color);
          }
          el.classList.add(MARK_CLASS);
        } else if (el.classList.contains(MARK_CLASS)) {
          el.classList.remove(MARK_CLASS);
          el.style.removeProperty("--color-marker");
        }
      });
    }
  }
}

// Fallback picker for environments without submenu support.
class ColorPickerModal extends obsidian.Modal {
  constructor(app, plugin, file) {
    super(app);
    this.plugin = plugin;
    this.file = file;
  }

  onOpen() {
    this.titleEl.setText("Color marker");
    const grid = this.contentEl.createDiv({ cls: "color-marker-grid" });
    for (const c of COLORS) {
      const cell = grid.createEl("button", {
        cls: "color-marker-cell",
        attr: { "aria-label": c.name, title: c.name },
      });
      cell.style.backgroundColor = c.value;
      cell.onclick = () => {
        this.plugin.setColor(this.file.path, c.value);
        this.close();
      };
    }
    const remove = this.contentEl.createEl("button", {
      cls: "color-marker-remove",
      text: "Remove color",
    });
    remove.onclick = () => {
      this.plugin.setColor(this.file.path, null);
      this.close();
    };
  }

  onClose() {
    this.contentEl.empty();
  }
}

module.exports = ColorMarkerPlugin;
