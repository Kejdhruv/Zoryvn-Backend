import express from "express";
import supabase from "../../Middleware/supabase.js";
import { createAuthUser } from "../../Database/User/Post/CreateUser.js";
import { adminOnly } from "../../Middleware/Admin.js";
import { deleteUserByAdmin } from "../../Database/User/Delete/DeleteUser.js";

const router = express.Router();

//User Login 
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // 🔹 Step 1: Auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const { user, session } = data;

    // 🔹 Step 2: Update status → active
    const { error: updateError } = await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", user.id);

    if (updateError) {
      console.error("Status update error:", updateError);
      return res.status(500).json({
        error: "Login succeeded but status update failed"
      });
    }

    // 🔹 Step 3: Set cookie
    res.cookie("Zoryvn_Token", session.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Login failed"
    });
  }
});


// User Creation By Admin
router.post("/createUser", adminOnly, async (req, res) => {
  try {
     
    const { email, password, role } = req.body;

    // Validate
    if (!email || !password || !role ) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const authUser = await createAuthUser(
      email,
      password,
      role 
    );

    if (!authUser) {
      return res.status(400).json({
        error: "User creation failed"
      });
    }

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: authUser.id,
        email: authUser.email,
      }
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      error: err.message || "Signup failed"
    });
  }
});

//Delete a User
router.delete("/users", adminOnly, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    // 🔒 Prevent self delete (recommended)
    if (req.user.id === id) {
      return res.status(400).json({
        error: "You cannot delete yourself",
      });
    }

    await deleteUserByAdmin(id);

    return res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (err) {
    console.error("Delete error:", err);

    return res.status(500).json({
      error: err.message || "Delete failed",
    });
  }
});



export default router; 