import { adaptarVercel } from "../server/adaptador-vercel.js";
import contador from "../netlify/functions/contador.js";

export default adaptarVercel(contador);
