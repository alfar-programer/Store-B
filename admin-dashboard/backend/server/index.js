const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

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
        const products = await Product.count();
        const orders = await Order.count();
        const ordersData = await Order.findAll();
        const revenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total), 0);

        res.json({
            products,
            orders,
            revenue
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

// Initialize database and start server
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
    });
}).catch(error => {
    console.error('Unable to connect to the database:', error);
});
