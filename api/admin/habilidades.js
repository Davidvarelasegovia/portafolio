import { adaptarVercel } from "../../server/adaptador-vercel.js";
import habilidades from "../../netlify/functions/admin-habilidades.js";

export default adaptarVercel(habilidades);
