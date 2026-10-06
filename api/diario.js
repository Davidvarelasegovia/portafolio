import { adaptarVercel } from "../server/adaptador-vercel.js";
import diario from "../netlify/functions/diario.js";

export default adaptarVercel(diario);
