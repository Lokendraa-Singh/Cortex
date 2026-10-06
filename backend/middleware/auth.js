const jwt = require("jsonwebtoken");

// har protected route se pehle yeh chalega - token check karke user ko aage jaane dega
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email } - isi se pata chalta hai request kiski hai
    next();
  } catch (err) {
    // token expire ho gaya ya tamper hua - dono case me yahi aayega
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

module.exports = protect;
