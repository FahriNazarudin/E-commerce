# E-commerce Clone 🛍️

A modern e-commerce application with automatic chatbot features to help customers manage and check stock

## 🚀 Main Features

- **Modern Authentication**: Login/Register with Google OAuth
- **Admin Dashboard**: Complete CRUD for managing products and categories
- **AI Chatbot**: Integrated Dialogflow for automatic customer service
- **Shopping Cart**: Dynamic cart system
- **Payment Gateway**: Midtrans integration for transactions
- **Responsive Design**: Modern and mobile-friendly UI

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** with Sequelize ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Cloud Dialogflow** for chatbot
- **Midtrans** for payment gateway

### Frontend

- **React.js** with Vite
- **Bootstrap** for styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **SweetAlert2** for notifications

## 📋 Prerequisites

Make sure you have installed:

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/FahriNazarudin/E-commerce.git
cd IP-RMT60
```

### 2. Setup Backend

```bash
cd BACKEND
npm install
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb ecommerce_db

# Run migrations
npx sequelize-cli db:migrate

# Run seeders
npx sequelize-cli db:seed:all
```

### 4. Setup Frontend

```bash
cd ../FRONTEND/ecommerce
npm install
```

### 5. Environment Variables

Create `.env` file in `BACKEND/` folder with configuration:

```env
# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ecommerce_db

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Midtrans
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key

# Dialogflow
GOOGLE_PROJECT_ID=your_dialogflow_project_id
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**

```bash
cd BACKEND
npm run dev
```

Server will run on `http://localhost:3000`

2. **Start Frontend Development Server**

```bash
cd FRONTEND/ecommerce
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Build

```bash
# Build frontend
cd FRONTEND/ecommerce
npm run build

# Start backend in production
cd ../../BACKEND
npm start
```

## 📝 API Documentation

Complete API endpoints available at [API Documentation](./BACKEND/api_doc.md)

### Main Endpoints:

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /login/google` - Login with Google OAuth
- `GET /products` - Get all products
- `GET /categories` - Get all categories
- `POST /carts` - Add item to cart
- `POST /payments` - Create payment transaction

## 🗄️ Database Schema

### Tables:

- **Users**: User and admin data
- **Products**: Product catalog
- **Categories**: Product categories
- **Carts**: User shopping cart

### Relationships:

- User → Products (One-to-Many)
- Category → Products (One-to-Many)
- User → Carts (One-to-Many)
- Product → Carts (One-to-Many)

## 🧪 Testing

```bash
# Run backend tests
cd BACKEND
npm test

# Run tests with coverage
npm run test:coverage
```

## 👨‍💻 Author

- GitHub: [@fahrinzrdn](https://github.com/fahrinzrdn)
- Email: fahrinazarudin0405@gmail.com

### Screenshots

<img width="1512" alt="Screenshot 2025-07-09 at 11 47 34" src="https://github.com/user-attachments/assets/96b4191e-adf6-42e1-a876-14377e7e7a1b" />
<img width="1502" alt="Screenshot 2025-07-09 at 11 24 43" src="https://github.com/user-attachments/assets/7dd3b1af-871d-42ca-bbab-524d77b70544" />
<img width="1503" alt="Screenshot 2025-07-09 at 11 27 52" src="https://github.com/user-attachments/assets/409e015b-743e-4193-b618-68d0d6d832f1" />
<img width="1509" alt="Screenshot 2025-07-09 at 11 30 24" src="https://github.com/user-attachments/assets/936aac5b-68d1-4737-9920-87233bbd0acf" />
<img width="1504" alt="Screenshot 2025-07-09 at 11 33 16" src="https://github.com/user-attachments/assets/bd387482-c976-4720-afb7-742da6f3f53f" />
<img width="1511" alt="Screenshot 2025-07-09 at 11 33 25" src="https://github.com/user-attachments/assets/af402ddf-2b57-45b0-9476-8c6763700084" />







