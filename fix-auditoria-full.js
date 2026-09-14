const fs = require("fs");
const file = "C:/Users/ferna/Documents/Desarrollo/SIMR-UdeA/simr-front/src/app/features/admin/auditoria/auditoria-lista.component.ts";
let content = fs.readFileSync(file, "utf8");

// 1. Remove broken filtroEntidad from load() call (no UI for it)
content = content.replace(
  "action: this.filtroAccion || undefined,\n        targetType: this.filtroEntidad || undefined,\n        limit: this.pageSize,",
  "action: this.filtroAccion || undefined,\n        search: this.searchTerm || undefined,\n        limit: this.pageSize,"
);

// 2. Remove onSearchChange method and searchTimer (use aplicarFiltro for search too)
content = content.replace(/  onSearchChange\(\): void \{\n    if \(this\.searchTimer\) clearTimeout\(this\.searchTimer\);\n    this\.searchTimer = setTimeout\(\(\) => \{\n      this\.pageIndex = 0;\n      this\.load\(\);\n    \}, 400\);\n  \}\n\n/, "");
content = content.replace(/  private searchTimer: any;\n/, "");

// 3. Fix search input to use aplicarFiltro() instead of onSearchChange()
content = content.replace(
  '(ngModelChange)="onSearchChange()"',
  '(ngModelChange)="aplicarFiltro()"'
);

// 4. Remove entityTypes reference (not used anymore)
content = content.replace(/  entityTypes = ENTITY_TYPES;\n/, "");

fs.writeFileSync(file, content, "utf8");
console.log("auditoria-lista.component.ts cleaned up");
console.log("Has searchTerm:", content.includes("searchTerm"));
console.log("Has onSearchChange:", content.includes("onSearchChange"));
console.log("Has search API param:", content.includes("search: this.searchTerm"));
console.log("Has filtroEntidad used in load:", content.includes("this.filtroEntidad"));