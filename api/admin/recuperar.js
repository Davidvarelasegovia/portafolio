import { adaptarVercel } from "../../server/adaptador-vercel.js";
import recuperar from "../../netlify/functions/admin-recuperar.js";

export default adaptarVercel(recuperar);
