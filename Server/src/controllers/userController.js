const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const path = require('path');

// Login user and return JWT token using username & password
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ where: { name: username } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user is deleted
    if (user.is_deleted === 1) return res.status(403).json({ message: "Account has been deactivated" });
      
    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin creates a new user with profile image
const createUser = async (req, res) => {
  try {
   
    // Extract Authorization token
    const token = req.headers['authorization']?.split(' ')[1];    

    // If no token is provided, assume this is the first admin user creation
    if (!token) {   

      const { email, password, name, phone, role } = req.body;
      if (!email || !password || !name || !phone || !role) {
        console.error("Validation Error: Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
      }

      if (role !== 'admin') {
        console.error("Validation Error: First user must be an admin");
        return res.status(400).json({ message: "The first user must be assigned the admin role." });
      }

      const profilePic = req.file ? req.file.path : null;
     
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        profile_pic: profilePic
      });
      return res.status(201).json(user);
    }

    // If a token is provided, verify it and ensure the user is an admin
    console.log("Verifying Token...");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token Decoded Successfully:", decoded);
    } catch (err) {
      console.error("Invalid Token:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (decoded.role !== 'admin') {
      console.error("Authorization Error: Only admins can create users");
      return res.status(403).json({ message: "Only admins can create new users." });
    }

    console.log("Authorized: Admin Creating a New User");

    // Proceed to create a user for other roles (kitchen, waiter, receptionist)
    const { email, password, name, phone, role } = req.body;
    if (!email || !password || !name || !phone || !role) {
      console.error("Validation Error: Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!['admin', 'kitchen', 'waiter', 'receptionist'].includes(role)) {
      console.error("Validation Error: Invalid role");
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const profilePic = req.file ? req.file.path : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
      profile_pic: profilePic
    });

    return res.status(201).json(newUser);

  } catch (error) {
    console.error("Internal Server Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        is_deleted: 0  // Exclude deleted users
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWaiters = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        is_deleted: 0,
        role: "waiter"
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.profile_pic = user.profile_pic ? `/uploads/${path.basename(user.profile_pic)}` : null; // Return file URL
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user by ID (Admin only)
const updateUser = async (req, res) => {
  try {
    
    const { password, profile_pic, ...updateData } = req.body;

    // If password is provided, hash it before updating
    if (password) {      
      updateData.password = await bcrypt.hash(password, 10);
    }

    const [updated] = await User.update(updateData, {
      where: { id: req.params.id }
    });

    if (!updated) {
      console.log("User not found in database for ID:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User updated successfully!");
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a user by ID (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ is_deleted: 1 }); // Directly updating

    res.status(200).json({ message: 'User has been soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser, getUsers, getUser, getWaiters, createUser, updateUser, deleteUser };
