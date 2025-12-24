# 🥕 FarmToHome

[![Node.js](https://img.shields.io/badge/Node.js-16.x-green)](https://nodejs.org/) 
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/) 
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0.3-brightgreen)](https://www.mongodb.com/) 

FarmToHome is a Direct-to-Consumer (D2C) platform connecting farmers directly with consumers, ensuring fresh produce reaches customers efficiently and at fair prices.

---

## 📂 Repository Structure

```
FarmToHome/
├─ backend/       # Node.js + Express API
├─ frontend/      # React Application
├─ .gitignore
├─ package.json
└─ README.md
```

---

## ⚙️ Features

- **User Authentication**: Register, login, and secure JWT authentication.
- **Product Management**: Farmers can add and manage products with name, price, stock, and description.
- **Cart System**: Users can add, update, remove products from the cart.
- **Order Placement**: Users can place orders and track their status.
- **Admin Panel**: Admins can manage users, products, and orders.
- **Secure Passwords**: Passwords hashed using bcryptjs.
- **Email Verification & Password Reset**: Tokens for email verification and password reset.

---

## 🛠️ Technology Stack

- **Frontend**: React, Axios, TailwindCSS (optional)
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Password Security**: bcryptjs
- **Environment Variables**: dotenv
- **Logging & Monitoring**: morgan
- **Validation**: express-validator

---

## 💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sanjay-2k-5/FarmToHome.git
cd FarmToHome
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

- Create a `.env` file in `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

- Run the backend server:

```bash
npm run dev
```

> Backend runs on `http://localhost:5000`.

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

> Frontend runs on `http://localhost:3000`.

---

### 4. Optional: Seed Admin User

```bash
cd backend
npm run seed:admin
```

This will create a default admin user for testing.

---

## ⚡ Usage

1. Open `http://localhost:3000` in your browser.
2. Register as a **user** or **admin**.
3. Browse products, add items to the cart, and place orders.
4. Admins can manage users, products, and orders from the dashboard.

---

## 📝 API Endpoints

**Authentication:**

- `POST /auth/register` – Register a new user
- `POST /auth/login` – Login user and get JWT

**Cart:**

- `GET /cart` – Get current user's cart
- `POST /cart/add` – Add or increment product in cart
- `PATCH /cart/:id` – Update product quantity
- `DELETE /cart/:id` – Remove product from cart
- `DELETE /cart/clear` – Clear all items from cart

**Products:**

- `GET /products` – Get all products
- `GET /products/:id` – Get product by ID
- `POST /products` – Add new product (admin)
- `PATCH /products/:id` – Update product (admin)
- `DELETE /products/:id` – Delete product (admin)

**Orders:**

- `POST /orders` – Place a new order
- `GET /orders` – Get all orders for user/admin
- `PATCH /orders/:id` – Update order status (admin)

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes and commit:

```bash
git commit -m "Add your feature"
```

4. Push to the branch:

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

## 📝 License

This project is licensed under the ISC License.  
See the LICENSE file for details.

---

## 🔗 Links

- GitHub Repo: [https://github.com/Sanjay-2k-5/FarmToHome](https://github.com/Sanjay-2k-5/FarmToHome)
