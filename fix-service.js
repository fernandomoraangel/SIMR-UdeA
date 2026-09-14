const fs = require("fs");
const file = "C:/Users/ferna/Documents/Desarrollo/SIMR-UdeA/simr-front/src/app/features/admin/auditoria/auditoria.service.ts";
let content = fs.readFileSync(file, "utf8");

// Add search to AuditQuery interface
content = content.replace(
  'export interface AuditQuery {\n  action?: string;\n  userId?: string;\n  roleId?: string;\n  targetType?: string;\n  limit?: number;\n  skip?: number;\n}',
  'export interface AuditQuery {\n  action?: string;\n  userId?: string;\n  roleId?: string;\n  targetType?: string;\n  search?: string;\n  limit?: number;\n  skip?: number;\n}'
);

// Add search to HttpParams in list()
content = content.replace(
  'params = params.set("skip", String(query.skip ?? 0));',
  "params = params.set(\"skip\", String(query.skip ?? 0));\n    if (query.search) params = params.set(\"search\", query.search);"
);

fs.writeFileSync(file, content, "utf8");
console.log("auditoria.service.ts updated with search support");
