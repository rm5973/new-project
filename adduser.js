// addUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB Atlas connection URI
const MONGO_URI = 'mongodb+srv://dexter:dexter@cluster0.h7bii.mongodb.net/EmployeeManagement?retryWrites=true&w=majority';

// User credentials to insert
const userEmail = 'admin@gmail.com';
const userPassword = 'admin';

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas', err);
});

// Define User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create User model
const User = mongoose.model('User', UserSchema, 'users');

// Insert user function
const insertUser = async () => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      console.log('User already exists');
      mongoose.disconnect();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create the new user
    const user = new User({ email: userEmail, password: hashedPassword });
    await user.save();

    console.log('User added successfully');
  } catch (err) {
    console.error('Error adding user', err);
  } finally {
    mongoose.disconnect();
  }
};

// Call the insertUser function
insertUser();
