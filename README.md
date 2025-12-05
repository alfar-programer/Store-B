# 🛍️ Store-B E-Commerce Platform

A modern, full-stack e-commerce platform built with React, featuring a customer-facing storefront and a comprehensive admin dashboard for product and order management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Store-B is a complete e-commerce solution consisting of three main components:

1. **Customer Storefront** - A beautiful, responsive shopping experience
2. **Admin Dashboard** - Powerful tools for managing products, orders, and analytics
3. **Backend API** - RESTful API with SQLite database for data persistence

## ✨ Features

### Customer Storefront
- 🏠 **Home Page** with featured products and categories
- 🔍 **Advanced Search** with modal interface
- 🛒 **Shopping Cart** with real-time updates
- 📦 **Product Catalog** with filtering and sorting
- 💳 **Checkout Process** with order confirmation
- 📱 **Responsive Design** for all devices
- ⭐ **Product Ratings** and reviews
- 🎨 **Modern UI** with smooth animations (GSAP)

### Admin Dashboard
- 📊 **Analytics Dashboard** with revenue and order statistics
- ➕ **Product Management** (Create, Read, Update, Delete)
- 🖼️ **Image Upload** with preview
- 📋 **Order Management** with status tracking
- 🎯 **Featured Products** control
- 📈 **Data Visualization** with Recharts
- 🔄 **Real-time Updates**

### Backend API
- 🔌 **RESTful API** endpoints
- 💾 **SQLite Database** with Sequelize ORM
- 📤 **File Upload** handling with Multer
- 🔒 **CORS** enabled for cross-origin requests
- 📊 **Order Tracking** system
- 🏷️ **Category Management**

## 🛠️ Tech Stack

### Frontend (Main App)
- **React 19.2.0** - UI library
- **React Router DOM 7.9.6** - Client-side routing
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **GSAP 3.13.0** - Animation library
- **Lucide React** - Icon library
- **Axios 1.13.2** - HTTP client

### Frontend (Admin Dashboard)
- **React 19.2.0** - UI library
- **React Router DOM 7.10.0** - Routing
- **Vite 7.2.4** - Build tool
- **Recharts 3.5.1** - Data visualization
- **Lucide React** - Icons
- **Axios 1.13.2** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express 5.2.1** - Web framework
- **Sequelize 6.37.7** - ORM
- **SQLite3 5.1.7** - Database
- **Multer 2.0.2** - File upload middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **Nodemon 3.1.11** - Development auto-reload

## 📁 Project Structure

```
Project-B/
├── src/                          # Main storefront application
│   ├── components/
│   │   ├── Header/              # Navigation header
│   │   ├── Home page/           # Home page components
│   │   │   └── ui/
│   │   │       ├── Products/    # Product display
│   │   │       └── shopCategory/ # Category carousel
│   │   ├── Cart/                # Shopping cart
│   │   ├── Checkout/            # Checkout process
│   │   ├── AllProduct/          # Product catalog
│   │   ├── Search/              # Search modal
│   │   ├── About/               # About page
│   │   └── OrderConfirmation/   # Order success page
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
│
├── admin-dashboard/
│   ├── Frontend/
│   │   └── dashBoard/           # Admin dashboard React app
│   │       ├── src/
│   │       ├── package.json
│   │       └── vite.config.js
│   │
│   └── backend/
│       └── server/              # Express API server
│           ├── index.js         # Server entry point
│           ├── uploads/         # Product images
│           ├── database.sqlite  # SQLite database
│           └── package.json
│
├── public/                      # Static assets
├── package.json                 # Main app dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Project-B
   ```

2. **Install Main App Dependencies**
   ```bash
   npm install
   ```

3. **Install Admin Dashboard Dependencies**
   ```bash
   cd admin-dashboard/Frontend/dashBoard
   npm install
   ```

4. **Install Backend Dependencies**
   ```bash
   cd ../../backend/server
   npm install
   ```

5. **Create Uploads Directory** (if not exists)
   ```bash
   mkdir uploads
   ```

## 🎮 Running the Application

You need to run **three separate servers** for the complete application:

### 1. Backend API Server
```bash
cd admin-dashboard/backend/server
npm run dev
```
- Runs on: `http://localhost:5000`
- API endpoints available at `/api/*`

### 2. Admin Dashboard
```bash
cd admin-dashboard/Frontend/dashBoard
npm run dev
```
- Runs on: `http://localhost:5173` (or next available port)
- Access admin interface to manage products and orders

### 3. Main Storefront
```bash
# From project root
npm run dev
```
- Runs on: `http://localhost:5174` (or next available port)
- Customer-facing e-commerce site

### Production Build

**Main App:**
```bash
npm run build
npm run preview
```

**Admin Dashboard:**
```bash
cd admin-dashboard/Frontend/dashBoard
npm run build
npm run preview
```

**Backend:**
```bash
cd admin-dashboard/backend/server
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/featured` | Get featured products |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Create product (with image upload) |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

#### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| POST | `/orders` | Create new order |
| PUT | `/orders/:id` | Update order status |

#### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get dashboard statistics |

### Product Schema

```json
{
  "id": "integer",
  "title": "string",
  "description": "text",
  "price": "decimal(10,2)",
  "category": "string",
  "image": "string (URL)",
  "discount": "integer (0-100)",
  "rating": "decimal(2,1)",
  "isFeatured": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Order Schema

```json
{
  "id": "integer",
  "customerName": "string",
  "total": "decimal(10,2)",
  "status": "string (Pending/Processing/Completed/Cancelled)",
  "items": "JSON string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 🎨 Key Features Implementation

### Image Upload
Products support image uploads with:
- File type validation (jpeg, jpg, png, gif, webp)
- 5MB file size limit
- Unique filename generation
- Static file serving from `/uploads`

### Database
- SQLite database with Sequelize ORM
- Auto-sync on server start
- Persistent storage in `database.sqlite`

### Routing
Main app routes:
- `/` - Home page
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/order-confirmation` - Order success
- `/allproducts` - Product catalog
- `/about` - About page

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for blazing fast development
- Tailwind CSS for utility-first styling
- GSAP for smooth animations
- All open-source contributors

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ by the Store-B Team**
