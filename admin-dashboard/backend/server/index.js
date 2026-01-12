const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

// Product Model
const Product = sequelize.define('Product', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 4.5
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Order Model
const Order = sequelize.define('Order', {
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    items: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Category Model
const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: './images/aiimg/img6.jpg'
    }
});

// User Model
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer'),
        defaultValue: 'customer'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for existing users, but enforce in API for new ones
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
});

// Relationships
User.hasMany(Order);
Order.belongsTo(User);

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// API Routes

// Auth Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'customer' // Default role
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        // Use a proper secret in production. Here defaulting to a simple string if env var not set
        const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';
        const token = jwt.sign(
            { id: user.id, role: user.role },
            jwtSecret,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            role: user.role,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        const productsWithFullImagePath = products.map(product => ({
            ...product.toJSON(),
            image: `http://localhost:${PORT}/${product.image}`
        }));
        res.json(productsWithFullImagePath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get featured products
app.get('/api/products/featured', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { isFeatured: true }
        });
        const productsWithFullImagePath = products.map(product => ({
            ...product.toJSON(),
            image: `http://localhost:${PORT}/${product.image}`
        }));
        res.json(productsWithFullImagePath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({
            ...product.toJSON(),
            image: `http://localhost:${PORT}/${product.image}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product with image upload
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const { title, description, price, stock, category, discount, rating, isFeatured } = req.body;

        const product = await Product.create({
            title,
            description,
            price: parseFloat(price),
            stock: parseInt(stock) || 0,
            category,
            image: `uploads/${req.file.filename}`,
            discount: parseInt(discount) || 0,
            rating: parseFloat(rating) || 4.5,
            isFeatured: isFeatured === 'true' || isFeatured === true
        });

        res.status(201).json({
            ...product.toJSON(),
            image: `http://localhost:${PORT}/${product.image}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { title, description, price, stock, category, discount, rating, isFeatured } = req.body;

        const updateData = {
            title: title || product.title,
            description: description || product.description,
            price: price ? parseFloat(price) : product.price,
            stock: stock !== undefined ? parseInt(stock) : product.stock,
            category: category || product.category,
            discount: discount !== undefined ? parseInt(discount) : product.discount,
            rating: rating ? parseFloat(rating) : product.rating
        };

        // Update isFeatured if provided
        if (isFeatured !== undefined) {
            updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
        }

        // Update image if new one is uploaded
        if (req.file) {
            updateData.image = `uploads/${req.file.filename}`;
        }

        await product.update(updateData);

        res.json({
            ...product.toJSON(),
            image: `http://localhost:${PORT}/${product.image}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
    try {
        // Get current month data
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Total counts
        const products = await Product.count();
        const orders = await Order.count();
        const ordersData = await Order.findAll();
        const revenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // Current month data
        const currentMonthProducts = await Product.count({
            where: {
                createdAt: { [sequelize.Sequelize.Op.gte]: currentMonthStart }
            }
        });
        const currentMonthOrders = await Order.count({
            where: {
                createdAt: { [sequelize.Sequelize.Op.gte]: currentMonthStart }
            }
        });
        const currentMonthOrdersData = await Order.findAll({
            where: {
                createdAt: { [sequelize.Sequelize.Op.gte]: currentMonthStart }
            }
        });
        const currentMonthRevenue = currentMonthOrdersData.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // Previous month data
        const previousMonthProducts = await Product.count({
            where: {
                createdAt: {
                    [sequelize.Sequelize.Op.gte]: previousMonthStart,
                    [sequelize.Sequelize.Op.lte]: previousMonthEnd
                }
            }
        });
        const previousMonthOrders = await Order.count({
            where: {
                createdAt: {
                    [sequelize.Sequelize.Op.gte]: previousMonthStart,
                    [sequelize.Sequelize.Op.lte]: previousMonthEnd
                }
            }
        });
        const previousMonthOrdersData = await Order.findAll({
            where: {
                createdAt: {
                    [sequelize.Sequelize.Op.gte]: previousMonthStart,
                    [sequelize.Sequelize.Op.lte]: previousMonthEnd
                }
            }
        });
        const previousMonthRevenue = previousMonthOrdersData.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(1);
        };

        const productsGrowth = calculateGrowth(currentMonthProducts, previousMonthProducts);
        const ordersGrowth = calculateGrowth(currentMonthOrders, previousMonthOrders);
        const revenueGrowth = calculateGrowth(currentMonthRevenue, previousMonthRevenue);

        // Overall growth (average of all metrics)
        const overallGrowth = ((parseFloat(productsGrowth) + parseFloat(ordersGrowth) + parseFloat(revenueGrowth)) / 3).toFixed(1);

        res.json({
            products,
            orders,
            revenue,
            growth: {
                products: productsGrowth,
                orders: ordersGrowth,
                revenue: revenueGrowth,
                overall: overallGrowth
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, total, items, userId } = req.body;

        const orderData = {
            customerName,
            total: parseFloat(total),
            items: JSON.stringify(items),
            status: 'Pending'
        };

        if (userId) {
            orderData.UserId = userId;
        }

        const order = await Order.create(orderData);

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const { status } = req.body;
        await order.update({ status });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// User Profile Routes

// Get current user's profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'phone', 'role', 'profileImage', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userProfile = user.toJSON();
        if (userProfile.profileImage) {
            userProfile.profileImage = `http://localhost:${PORT}/${userProfile.profileImage}`;
        }

        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (req.body.phone) updateData.phone = req.body.phone;

        await user.update(updateData);

        const updatedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage ? `http://localhost:${PORT}/${user.profileImage}` : null
        };

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload profile image
app.post('/api/user/profile/image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Profile image is required' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const imagePath = `uploads/${req.file.filename}`;
        await user.update({ profileImage: imagePath });

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: `http://localhost:${PORT}/${imagePath}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's order history
app.get('/api/user/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        const ordersWithParsedItems = orders.map(order => ({
            ...order.toJSON(),
            items: JSON.parse(order.items)
        }));

        res.json(ordersWithParsedItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Category Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single category
app.get('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create category
app.post('/api/categories', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const categoryData = {
            name,
            description: description || ''
        };

        // Add image path if file was uploaded
        if (req.file) {
            categoryData.image = `uploads/${req.file.filename}`;
        }

        const category = await Category.create(categoryData);

        res.status(201).json(category);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Update category
app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const { name, description } = req.body;

        const updateData = {
            name: name || category.name,
            description: description !== undefined ? description : category.description
        };

        // Update image if new one is uploaded
        if (req.file) {
            updateData.image = `uploads/${req.file.filename}`;
        }

        await category.update(updateData);

        res.json(category);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize database and start server
sequelize.sync({ alter: true }).then(async () => {
    // Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'Mazenelfar2006@gmail.com';
    const adminPass = process.env.ADMIN_PASS || 'Zen198165967#';

    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
        const hashedPass = await bcrypt.hash(adminPass, 10);
        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPass,
            role: 'admin'
        });
        console.log('Admin user seeded successfully');
    }

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
    });
}).catch(error => {
    console.error('Unable to connect to the database:', error);
});
