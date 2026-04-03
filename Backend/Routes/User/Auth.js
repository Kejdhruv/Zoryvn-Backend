import express from "express";
import supabase from "../../Middleware/supabase.js";

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


router.post("/auth/logout", async (req, res) => {
  try {
    const token = req.cookies?.Zoryvn_Token;

    let userId = null;

    // 🔹 Step 1: Get user from token
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data?.user) {
        userId = data.user.id;
      }
    }

    // 🔹 Step 2: Update status → inactive
    if (userId) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ status: "inactive" })
        .eq("id", userId);

      if (updateError) {
        console.error("Status update error:", updateError);
      }
    }

    // 🔹 Step 3: Clear cookie
    res.clearCookie("Zoryvn_Token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/"
    });

    return res.status(200).json({
      message: "Logout successful",
    });

  } catch (err) {
    console.error("Logout error:", err);

    return res.status(500).json({
      error: "Logout failed",
    });
  }
});

export default router;