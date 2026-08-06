import { supabase } from "./supabase.js";
export async function restaurarRespaldo(respaldo){const{data,error}=await supabase.functions.invoke("restaurar-respaldo",{body:{respaldo}});if(error)throw new Error(error.message);if(data?.error)throw new Error(data.error);return data}
