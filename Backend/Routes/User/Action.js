import express from "express";
import supabase from "../../Middleware/supabase.js";
import { createAuthUser } from "../../Database/User/Post/CreateUser.js";
import { adminOnly } from "../../Middleware/Admin.js";
import { deleteUserByAdmin } from "../../Database/User/Delete/DeleteUser.js";


const router = express.Router();

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