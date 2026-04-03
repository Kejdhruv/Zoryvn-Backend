import express from "express";
import supabase from "../../Middleware/supabase.js";
import { createAuthUser } from "../../Database/User/Post/CreateUser.js";



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
    res.cookie("Zoryvn_Token", session.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/"
    });

    console.log("Cookie should be set now");
    console.log("Headers being sent:", res.getHeaders());

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


router.post("/auth/signup", async (req, res) => {
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



export default router; 