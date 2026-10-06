import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const l of readFileSync(resolve(raiz, ".env"), "utf8").split(/\r?\n/)) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("="); if (i === -1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
const { getDb } = await import("../netlify/lib/db.js");
const db = await getDb();
const res = await db.collection("habilidades").deleteOne({ _id: "principal" });
console.log(res.deletedCount ? "✅ Documento borrado, se re-sembrara desde el codigo" : "no habia documento");
const { default: habilidades } = await import("../netlify/functions/admin/habilidades.js");
const r = await habilidades(new Request("http://x/api/admin/habilidades"));
const d = await r.json();
console.log("✅ REST ahora:", d.backend.grupos[0].habilidades[0].porcentaje + "%");
const total = Object.values(d).filter(s=>s?.grupos).reduce((n,s)=>n+s.grupos.reduce((m,g)=>m+g.habilidades.length,0),0);
console.log("✅ Total tecnologias:", total);
