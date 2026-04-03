import supabase from "./supabase.js";

export const getAuthUser = async (req) => {
  const token = req.cookies?.Zoryvn_Token;
  if (!token) throw new Error("Unauthorized");
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
};

export const FindRole = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("role , status")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};