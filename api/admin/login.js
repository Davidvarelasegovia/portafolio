import { adaptarVercel } from "../../server/adaptador-vercel.js";
import login from "../../netlify/functions/admin-login.js";

export default adaptarVercel(login);
