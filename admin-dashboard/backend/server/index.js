const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ======================
   DATABASE POOL (WITH FALLBACK)
====================== */
const DB_CONFIG_REMOTE = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
};

const DB_CONFIG_LOCAL = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: process.env.LOCAL_DB_PASSWORD || "your_local_password",
  database: "ecommerce_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
};

let pool;

async function getDatabaseConnection() {
  if (process.env.DB_HOST) {
    console.log(`🔄 Attempting to connect to Remote DB (${process.env.DB_HOST})...`);
    const remotePool = mysql.createPool(DB_CONFIG_REMOTE);
    try {
      const connection = await remotePool.getConnection();
      connection.release();
      console.log(`✅ Connected to Remote DB: ${DB_CONFIG_REMOTE.database}`);
      return remotePool;
    } catch (err) {
      console.error(`❌ Remote DB connection failed: ${err.message}`);
      console.log('⚠️ Switching to Local Fallback...');
      await remotePool.end();
    }
  }

  console.log(`� Attempting to connect to Local DB (127.0.0.1)...`);
  const localPool = mysql.createPool(DB_CONFIG_LOCAL);
  try {
    const connection = await localPool.getConnection();
    connection.release();
    console.log(`✅ Connected to Local DB: ${DB_CONFIG_LOCAL.database}`);
    return localPool;
  } catch (err) {
    console.error(`❌ Local DB connection failed: ${err.message}`);
    throw err;
  }
}

/* ======================
   DATABASE INITIALIZATION
====================== */
async function initDatabase() {
  pool = await getDatabaseConnection();
  const connection = await pool.getConnection();
  try {
    // Create Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        stock INT DEFAULT 0,
        image VARCHAR(255) NOT NULL,
        discount INT DEFAULT 0,
        rating DECIMAL(2, 1) DEFAULT 4.5,
        isFeatured BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        phone VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customerName VARCHAR(255) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(255) DEFAULT 'Pending',
        items TEXT NOT NULL,
        UserId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Database tables initialized');
  } finally {
    connection.release();
  }
}

/* ======================
   MULTER
====================== */
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ======================
   AUTH MIDDLEWARE
====================== */
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

/* ======================
   AUTH ROUTES
====================== */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const [existing] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO Users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashed, phone]
    );

    res.json({ message: 'Registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ======================
   PRODUCTS
====================== */
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM Products');
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, stock, discount, rating, isFeatured } = req.body;
    const image = `uploads/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO Products (title, description, price, category, stock, image, discount, rating, isFeatured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, category, stock || 0, image, discount || 0, rating || 4.5, isFeatured || false]
    );

    const [products] = await pool.query('SELECT * FROM Products WHERE id = ?', [result.insertId]);
    res.json(products[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ======================
   CATEGORIES
====================== */
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM Categories');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    const [categories] = await pool.query('SELECT * FROM Categories WHERE id = ?', [result.insertId]);
    res.json(categories[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ======================
   ORDERS
====================== */
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, total, status, items, UserId } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Orders (customerName, total, status, items, UserId) VALUES (?, ?, ?, ?, ?)',
      [customerName, total, status || 'Pending', JSON.stringify(items), UserId || null]
    );

    const [orders] = await pool.query('SELECT * FROM Orders WHERE id = ?', [result.insertId]);
    res.json(orders[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM Orders');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ======================
   START SERVER
====================== */
initDatabase()
  .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ DB Error:', err);
    process.exit(1);
  });
