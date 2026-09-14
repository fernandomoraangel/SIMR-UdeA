const fs = require("fs");
const file = "C:/Users/ferna/Documents/Desarrollo/SIMR-UdeA/simr-back/app/controllers/utils.server.controller.js";
let content = fs.readFileSync(file, "utf8");

if (!content.includes("logAudit")) {
  content = content.replace(
    'const mongoose = require("mongoose");',
    'const mongoose = require("mongoose");\nconst { logAudit } = require("../services/audit.service");'
  );
}

content = content.replace(
  'res.json({ success: true, data: results });\n  } catch (err) {\n    console.error("[db-search error]", err);',
  'res.json({ success: true, data: results });\n    await logAudit(req, "db_search", "db_utils", null, "Busqueda en BD");\n  } catch (err) {\n    console.error("[db-search error]", err);'
);

content = content.replace(
  'res.json({ success: true, modifiedCount });\n  } catch (err) {\n    console.error("[db-replace error]", err);',
  'res.json({ success: true, modifiedCount });\n    await logAudit(req, "db_replace", "db_utils", null, "Reemplazo en BD");\n  } catch (err) {\n    console.error("[db-replace error]", err);'
);

fs.writeFileSync(file, content, "utf8");
console.log("utils controller updated:", content.includes("logAudit"));