const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-secret-key-change-in-production';
}


const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   SECURITY MIDDLEWARE
====================== */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const hpp = require('hpp');

// Import custom middleware
const { adminOnly, authOnly, authenticateToken } = require('./middleware/rbac');
const {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateCategory,
  validateOrder,
  validateId
} = require('./middleware/validators');

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// HTTP Parameter Pollution protection
app.use(hpp());

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Detailed logging in production
} else {
  app.use(morgan('dev')); // Concise logging in development
}

/* ======================
   MIDDLEWARE
====================== */
// CORS Configuration - Restrict to specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://store-b-frontend.vercel.app',
  'https://store-b-admin.vercel.app',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ======================
   DATABASE POOL
====================== */
const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql-73b2b04-mazenalfar01.h.aivencloud.com',
  port: Number(process.env.DB_PORT || 23199),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
};

let pool;

async function getDatabaseConnection() {
  console.log(`🔄 Attempting to connect to DB (${DB_CONFIG.host})...`);
  const dbPool = mysql.createPool(DB_CONFIG);
  try {
    const connection = await dbPool.getConnection();
    connection.release();
    console.log(`✅ Connected to DB: ${DB_CONFIG.database}`);
    return dbPool;
  } catch (err) {
    console.error(`❌ DB connection failed: ${err.message}`);
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
   HEALTH CHECK
====================== */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/* ======================
   AUTH ROUTES
====================== */
app.post('/api/auth/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const [existing] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashed = await bcrypt.hash(password, 12); // Increased salt rounds for security
    await pool.query(
      'INSERT INTO Users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashed, phone]
    );

    res.json({
      success: true,
      message: 'Registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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

app.get('/api/products/featured', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM Products WHERE isFeatured = true');
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', adminOnly, upload.single('image'), validateProduct, async (req, res) => {
  try {
    const { title, description, price, category, stock, discount, rating, isFeatured } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    const image = `uploads/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO Products (title, description, price, category, stock, image, discount, rating, isFeatured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, category, stock || 0, image, discount || 0, rating || 4.5, isFeatured || false]
    );

    const [products] = await pool.query('SELECT * FROM Products WHERE id = ?', [result.insertId]);
    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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

app.post('/api/categories', adminOnly, validateCategory, async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    const [categories] = await pool.query('SELECT * FROM Categories WHERE id = ?', [result.insertId]);
    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/* ======================
   ORDERS
====================== */
app.post('/api/orders', authOnly, validateOrder, async (req, res) => {
  try {
    const { customerName, total, status, items } = req.body;
    const UserId = req.user.id; // Use authenticated user's ID

    const [result] = await pool.query(
      'INSERT INTO Orders (customerName, total, status, items, UserId) VALUES (?, ?, ?, ?, ?)',
      [customerName, total, status || 'Pending', JSON.stringify(items), UserId]
    );

    const [orders] = await pool.query('SELECT * FROM Orders WHERE id = ?', [result.insertId]);
    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM Orders';
    let params = [];

    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin') {
      query += ' WHERE UserId = ?';
      params.push(req.user.id);
    }

    const [orders] = await pool.query(query, params);
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.put('/api/orders/:id', adminOnly, validateId, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    await pool.query('UPDATE Orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/* ======================
   STATS
====================== */
app.get('/api/stats', adminOnly, async (req, res) => {
  try {
    const [products] = await pool.query('SELECT COUNT(*) as count FROM Products');
    const [orders] = await pool.query('SELECT COUNT(*) as count, SUM(total) as revenue FROM Orders');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM Users WHERE role = "customer"');

    res.json({
      success: true,
      data: {
        products: products[0].count,
        orders: orders[0].count,
        revenue: orders[0].revenue || 0,
        customers: users[0].count,
        growth: { products: 0, orders: 0, revenue: 0, overall: 0 }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/* ======================
   PRODUCT UPDATE/DELETE
====================== */
app.put('/api/products/:id', adminOnly, validateId, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, stock, discount, rating, isFeatured } = req.body;
    let query = 'UPDATE Products SET title=?, description=?, price=?, category=?, stock=?, discount=?, rating=?, isFeatured=?';
    let params = [title, description, price, category, stock, discount, rating, isFeatured];

    if (req.file) {
      const image = `uploads/${req.file.filename}`;
      query += ', image=?';
      params.push(image);
    }

    query += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/products/:id', adminOnly, validateId, async (req, res) => {
  try {
    await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/* ======================
   CATEGORY UPDATE/DELETE
====================== */
app.put('/api/categories/:id', adminOnly, validateId, validateCategory, async (req, res) => {
  try {
    const { name, description } = req.body;
    await pool.query('UPDATE Categories SET name=?, description=? WHERE id=?', [name, description, req.params.id]);
    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/categories/:id', adminOnly, validateId, async (req, res) => {
  try {
    await pool.query('DELETE FROM Categories WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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
