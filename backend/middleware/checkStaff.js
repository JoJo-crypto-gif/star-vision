// middleware/checkStaff.js
const checkStaff = (supabase) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !roleData) {
      return res.status(403).json({ error: "Role not found" });
    }

    // Only allow staff or admin
    if (!["staff", "admin"].includes(roleData.role)) {
      return res.status(403).json({ error: "Forbidden: Staff or Admin only" });
    }

    req.user = user;
    req.role = roleData.role;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// ✅ export default (so it matches your import)
export default checkStaff;
