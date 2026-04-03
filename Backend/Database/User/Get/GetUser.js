import supabase from "../../../Middleware/supabase.js";

export const getUserByIdOrEmail = async ({ id, email }) => {
  if (!id && !email) {
    throw new Error("Provide user id or email");
  }
    
  let query = supabase
    .from("users")
    .select("*");

  if (id) {
    query = query.eq("id", id);
  } else {
    query = query.eq("email", email);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    throw new Error("User not found");
  }
  return data;
};


export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch users");
  }

  return {
    count: data.length,
    users: data,
  };
}; 

