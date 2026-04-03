import supabase from "../../../Middleware/supabase.js";

export async function createAuthUser(email, password, role) {
  if (!email || !password || !role) {
    throw new Error("Missing user fields");
  }

  // Step 1: Create user in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("AUTH ERROR:", error);
    throw error;
  }

  const user = data.user;

  //  Step 2: Insert into users table
  const { error: dbError } = await supabase.from("users").insert([
    {
      id: user.id,
      email: user.email,
      role: role,
      status: "inactive",
      created_at: new Date().toISOString(),
    },
  ]);

  if (dbError) {
    console.error("DB ERROR:", dbError);

    //  Optional rollback (VERY IMPORTANT)
    await supabase.auth.admin.deleteUser(user.id);

    throw dbError;
  }

  return user;
}