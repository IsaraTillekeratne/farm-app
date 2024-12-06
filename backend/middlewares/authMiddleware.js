const jwt = require("jsonwebtoken");
const { Users } = require("../models");

const authenticate = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        return res.status(401).json({ message: "Authentication token missing or invalid." });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database
        const user = await Users.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Invalid token or user does not exist." });
        }

        // Attach user to the request object
        req.user = user;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Invalid token." });
    }
};

// Middleware to check role permissions
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }

        next(); // User has the required role, proceed to the next middleware or route handler
    };
};

module.exports = { authenticate, authorize };
