import { App, Menu, MenuItem, Modal, Plugin, TAbstractFile } from "obsidian";

/*
 * Color Marker — Obsidian plugin
 * Right-click any folder or note in the file explorer and pick one of 12
 * calendar-style colors to mark it. The item's name is tinted and gets a
 * colored dot, so you can spot it instantly. Colors can be changed or
 * removed at any time and survive restarts, renames and moves.
 */

// 12-color palette inspired by Google Calendar.
const COLORS: { name: string; value: string }[] = [
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

interface ColorMarkerData {
  paths: Record<string, string>;
}

export default class ColorMarkerPlugin extends Plugin {
  colors: Record<string, string> = {};
  private observer: MutationObserver | null = null;
  private observed: WeakSet<HTMLElement> = new WeakSet();
  private raf = 0;

  async onload(): Promise<void> {
    const data = (await this.loadData()) as ColorMarkerData | null;
    this.colors = data?.paths ?? {};

    // "Color marker" entry in the right-click menu of files AND folders.
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu: Menu, file: TAbstractFile) => {
        menu.addItem((item: MenuItem) => {
          item.setTitle("Color marker").setIcon("palette");
          const withSub = item as MenuItem & { setSubmenu?: () => Menu };
          if (typeof withSub.setSubmenu === "function") {
            this.buildColorMenu(withSub.setSubmenu(), file);
          } else {
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
        if (changed) void this.saveColors().then(() => this.applyAll());
      })
    );

    // Clean up colors of deleted items.
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (this.colors[file.path]) {
          delete this.colors[file.path];
          void this.saveColors();
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

  onunload(): void {
    document.querySelectorAll<HTMLElement>("." + MARK_CLASS).forEach((el) => {
      el.classList.remove(MARK_CLASS);
      el.style.removeProperty("--color-marker");
    });
  }

  // Builds the swatch list inside a Menu (used by the submenu).
  buildColorMenu(menu: Menu, file: TAbstractFile): void {
    const current = this.colors[file.path];
    for (const c of COLORS) {
      menu.addItem((item: MenuItem) => {
        const frag = document.createDocumentFragment();
        const dot = document.createElement("span");
        dot.className = "color-marker-swatch";
        dot.style.backgroundColor = c.value;
        frag.appendChild(dot);
        frag.appendChild(document.createTextNode(c.name));
        item.setTitle(frag).onClick(() => void this.setColor(file.path, c.value));
        item.setChecked(current === c.value);
      });
    }
    menu.addSeparator();
    menu.addItem((item: MenuItem) =>
      item
        .setTitle("Remove color")
        .setIcon("x")
        .setDisabled(!current)
        .onClick(() => void this.setColor(file.path, null))
    );
  }

  async setColor(path: string, color: string | null): Promise<void> {
    if (color) this.colors[path] = color;
    else delete this.colors[path];
    await this.saveColors();
    this.applyAll();
  }

  saveColors(): Promise<void> {
    return this.saveData({ paths: this.colors });
  }

  // Re-applies colors whenever the file explorer re-renders its tree.
  private watchExplorers(): void {
    if (!this.observer) {
      this.observer = new MutationObserver(() => this.scheduleApply());
      this.register(() => this.observer?.disconnect());
    }
    for (const leaf of this.app.workspace.getLeavesOfType("file-explorer")) {
      const el = leaf.view?.containerEl;
      if (el && !this.observed.has(el)) {
        this.observer.observe(el, { childList: true, subtree: true });
        this.observed.add(el);
      }
    }
  }

  private scheduleApply(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.applyAll();
    });
  }

  applyAll(): void {
    for (const leaf of this.app.workspace.getLeavesOfType("file-explorer")) {
      const root = leaf.view?.containerEl;
      if (!root) continue;
      root.querySelectorAll<HTMLElement>("[data-path]").forEach((el) => {
        const color = this.colors[el.getAttribute("data-path") ?? ""];
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
class ColorPickerModal extends Modal {
  constructor(
    app: App,
    private plugin: ColorMarkerPlugin,
    private file: TAbstractFile
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText("Color marker");
    const grid = this.contentEl.createDiv({ cls: "color-marker-grid" });
    for (const c of COLORS) {
      const cell = grid.createEl("button", {
        cls: "color-marker-cell",
        attr: { "aria-label": c.name, title: c.name },
      });
      cell.style.backgroundColor = c.value;
      cell.onclick = () => {
        void this.plugin.setColor(this.file.path, c.value);
        this.close();
      };
    }
    const remove = this.contentEl.createEl("button", {
      cls: "color-marker-remove",
      text: "Remove color",
    });
    remove.onclick = () => {
      void this.plugin.setColor(this.file.path, null);
      this.close();
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
