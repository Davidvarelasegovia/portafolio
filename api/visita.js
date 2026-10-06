import { adaptarVercel } from "../server/adaptador-vercel.js";
import visita from "../netlify/functions/visita.js";

export default adaptarVercel(visita);
