// middleware/adminOnly.js
import supabase from "./supabase.js";
import { getAuthUser } from "./AuthUser.js";
import { FindRole } from "./AuthUser.js";

export const adminOnly = async (req, res, next) => {
  try {
    const user = await getAuthUser(req);
    const userData = await FindRole(user.id);

    if (userData.status !== "active") {
      return res.status(403).json({
        error: "User inactive",
      });
    }

    if (userData.role !== "admin") {
      return res.status(403).json({
        error: "Only admin can perform this action",
      });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      error: err.message || "Unauthorized",
    });
  }
};