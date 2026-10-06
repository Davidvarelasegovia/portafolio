import { adaptarVercel } from "../../server/adaptador-vercel.js";
import cambiarPassword from "../../netlify/functions/admin-cambiar-password.js";

export default adaptarVercel(cambiarPassword);
