const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MongoDB connection
mongoose.connect('mongodb+srv://dexter:dexter@cluster0.h7bii.mongodb.net/EmployeeManagement?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// User model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema, 'users');

// Employee model
const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile_no: String,
  designation: String,
  gender: String,
  course: [String],
  created_date: Date,
  image: String,
});
const Employee = mongoose.model('Employee', employeeSchema, 'employeedetails');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({ message: "Login successful", user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// API route for creating employee
app.post('/api/employees', upload.single('image'), async (req, res) => {
  try {
    const { name, email, mobile_no, designation, gender, course, created_date } = req.body;
    const newEmployee = new Employee({
      name,
      email,
      mobile_no,
      designation,
      gender,
      course,
      created_date: new Date(created_date),
      image: req.file ? req.file.path : '',
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API route for fetching employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API route for updating an employee
app.put('/api/employees/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile_no, designation, gender, course, created_date } = req.body;

    const updatedData = {
      name,
      email,
      mobile_no,
      designation,
      gender,
      course,
      created_date: new Date(created_date),
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API route for deleting an employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Optionally, remove the image file if it exists
    if (deletedEmployee.image) {
      fs.unlink(deletedEmployee.image, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }

    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/employees/:id/delete-courses', async (req, res) => {
  try {
    // Extract employee ID and courses to delete from the request
    const { courses } = req.body;
    
    // Update employee record to remove the specified courses
    await Employee.updateOne(
      { _id: req.params.id },
      { $pull: { course: { $in: courses } } }
    );

    res.status(200).send('Courses deleted successfully');
  } catch (error) {
    res.status(400).json({ error: 'Error deleting courses' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    // Update employee record with the new data
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ error: 'Error updating employee' });
  }
});


// Serve uploaded images
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
