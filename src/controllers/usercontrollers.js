import pool from "../models/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
// Secret key for JWT
//const JWT_SECRET = "mysecret";

// Register a new user
export const createUser = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res
      .status(400)
      .json({ error: "User name, email, and password are required" });
  }

  try {
    // Check if the email already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [userName, email, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.insertId,
        userName,
        email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Login user and return JWT token
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [userResult] = await pool.query(
      `SELECT u.*, r.name AS roleName 
   FROM users u 
   LEFT JOIN roles r ON u.role_id = r.id 
   WHERE u.email = ?`,
      [email]
    );

    if (userResult.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, userName: user.name, email: user.email,role:user.roleName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        userName: user.name,
        email: user.email,
        role:user.roleName
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Authenticate JWT Token Middleware
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Assign a role to a user using names
export const assignRoleToUser = async (req, res) => {
  const { userName, roleName } = req.body;

  if (!userName || !roleName) {
    return res
      .status(400)
      .json({ error: "User name and Role name are required" });
  }

  try {
    const [userResult] = await pool.query(
      "SELECT id FROM users WHERE name = ?",
      [userName]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult[0].id;

    const [roleResult] = await pool.query(
      "SELECT id FROM roles WHERE name = ?",
      [roleName]
    );

    if (roleResult.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    const roleId = roleResult[0].id;

    await pool.query("UPDATE users SET role_id = ? WHERE id = ?", [
      roleId,
      userId,
    ]);

    res.status(200).json({
      message: `Role '${roleName}' assigned to user '${userName}' successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign role to user" });
  }
};

// Fetch all users and their roles
export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.name AS userName, u.email, r.name AS roleName
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
    `);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
//forgotpassword
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  try {
    // Check if the user exists
    const [users] = await pool.query(
      "SELECT id, name FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ error: "User with this email does not exist" });
    }

    const user = users[0];
    const resetToken = jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    ); // 15 mins validity

    // Configure Nodemailer Transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Replace with your email provider
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Email content
    
    const mailOptions = {
      from: '"RBAC API" <no-reply@rbac-api.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Request</h3>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Use the token below to reset your password:</p>
         <code style="font-size: 1.2em; color: #333;">${resetToken}</code>
        <p>This link is valid for 15 minutes only.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
};
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      decoded.id,
    ]);

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Reset token has expired" });
    }
    res.status(500).json({ error: "Failed to reset password" });
  }
};
// Delete a user
export const deleteUser = async (req, res) => {
  const { email } = req.body; // Expecting the user's email in the request body

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if the user exists
    const [userResult] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await pool.query("DELETE FROM users WHERE email = ?", [email]);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};


// Update user details
export const updateUser = async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.user.id; // From the authenticateToken middleware

  try {
    // Fetch the existing user from the database
    const [userResult] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (userResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = userResult[0];

    // Check if a new email is provided and if it's different from the current email
    if (email && email !== user.email) {
      const [emailExists] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (emailExists.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
      user.email = email; // Update email
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      user.password = hashedPassword; // Update password
    }

    // Update username if provided
    if (username) {
      user.username = username; // Update username
    }

    // Update the user in the database
    await pool.query(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [user.username, user.email, user.password, userId]
    );

    // Respond with the updated user details
    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("updateUser error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
