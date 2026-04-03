// middleware/adminOrSelf.js
import { getAuthUser } from "./AuthUser.js"; 
import { FindRole } from "./AuthUser.js";

export const adminOnlyOrSelf = async (req, res, next) => {
  try {
    const currentUser = await getAuthUser(req);
    const userData = await FindRole(currentUser.id);

    if (userData.status !== "active") {
      return res.status(403).json({
        error: "User inactive",
      });
    }

    const { id, email } = req.query;

    // 🔹 If admin → allow everything
    if (userData.role === "admin") {
      req.user = currentUser;
      return next();
    }

    // 🔹 If not admin → allow only own data
    if (
      (id && id === currentUser.id) ||
      (email && email === currentUser.email)
    ) {
      req.user = currentUser;
      return next();
    }

    return res.status(403).json({
      error: "Access denied",
    });

  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};