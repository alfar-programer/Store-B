const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const dotenv = require('dotenv');

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

        const { title, description, price, category, discount, rating, isFeatured } = req.body;

        const product = await Product.create({
            title,
            description,
            price: parseFloat(price),
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

        const { title, description, price, category, discount, rating, isFeatured } = req.body;

        const updateData = {
            title: title || product.title,
            description: description || product.description,
            price: price ? parseFloat(price) : product.price,
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
        const { customerName, total, items } = req.body;

        const order = await Order.create({
            customerName,
            total: parseFloat(total),
            items: JSON.stringify(items),
            status: 'Pending'
        });

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
sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
    });
}).catch(error => {
    console.error('Unable to connect to the database:', error);
});
