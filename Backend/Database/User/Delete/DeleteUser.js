// services/deleteUser.js
import supabase from "../../../Middleware/supabase.js";

export const deleteUserByAdmin = async (userId) => {
  if (!userId) throw new Error("User ID required");

  // 🔹 Step 1: Delete from users table
  const { error: dbError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (dbError) throw dbError;

  // 🔹 Step 2: Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Auth delete failed:", authError);
    throw authError;
  }

  return true;
};