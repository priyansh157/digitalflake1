const bcrypt = require("bcrypt");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");
const { Console } = require("console");
const jwt = require("jsonwebtoken");
const app = express();
const multer = require("multer");
const fs = require("fs");
//path.resolve()
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const port = 5000;
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "digitalflake",
});

const auth = require('./middelware');

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 8);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, encryptedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ message: "Error creating account" });
      }
      res.send({ success: true, message: "Account Created Successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error creating account" });
  }
});



// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error during login" });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: "User Not Found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({ message: "Wrong Credentials" });
    }

    const token = jwt.sign({ _id: user.email }, 'test');
    res.send({
      token: token,
      message: "User authenticated successfully"
    });
  });
});


app.get('/test', auth, async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error);
  }
})

app.use(cors());

// const categories = [
//   { id: 1, name: 'Mobile', image: '/images/mobile.jpg', status: 'Active' },
//   { id: 2, name: 'Laptop', image: '/images/laptop.jpg', status: 'Active' },
//   { id: 3, name: 'Grocery', image: '/images/grocery.jpg', status: 'Active' },
// ];

// app.get('/categories', (req, res) => {
//   res.json(categories);
// });

// Configure multer for file uploads
const clientUploadDir = path.join(__dirname, '../client/public/uploads');
if (!fs.existsSync(clientUploadDir)) {
  fs.mkdirSync(clientUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({ storage: storage });

app.post('/categories', upload.single('image'), (req, res) => {
  const { name, status } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = "INSERT INTO category (cat_name, cat_image, cat_status) VALUES (?, ?, ?)";

  db.query(sql, [name, image, status], (err, result) => {
    if (err) {
      console.error("Database query error: ", err); // Log the error details
      return res.status(500).send({ message: "Error adding category" });
    }
   
    res.send({ success: true, message: "Category added successfully" });
  });
});

app.get('/categories', (req, res) => {
  const sql = "SELECT * FROM category";
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error retrieving categories" });
    }
    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`listening on port ${port} `);
});