# 🛒 ShopEase E-Commerce Platform

A modern, full-stack E-Commerce application offering a seamless shopping experience for users and a powerful dashboard for administrators. Built with **Spring Boot 3** and **React 18**, featuring secure authentication, real-time updates, and a responsive design.

![ShopEase Screenshot](https://github.com/user-attachments/assets/c8f39a48-1b21-4a6a-adca-0a65a1eef143)

## ✨ Key Features

### 👤 User Features
-   **Secure Authentication**: JWT-based login/register with role-based access control.
-   **Profile Management**: Update profile details, manage addresses, and change password with **OTP verification**.
-   **Product Discovery**: Browse products by category, search with filters, and view detailed product pages.
-   **Shopping Cart**: Add items, update quantities, and apply discount coupons.
-   **Checkout Flow**: Seamless checkout process with address selection.
-   **Order History**: View past orders and download PDF invoices.
-   **Reviews**: Rate and review products.

### 🛠️ Admin Dashboard
-   **Overview & Analytics**: Visual charts for revenue, order trends, and user growth.
-   **Product Management**: Add, edit, delete, and manage product inventory.
-   **Order Management**: Track orders, update status (Shipped, Delivered), and handle cancellations.
-   **User Management**: View and manage registered users.
-   **Category Management**: Organize products into categories.

## 🛠️ Tech Stack

| Area | Technologies |
|------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, React Router DOM, Heroicons |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, JWT, JavaMailSender |
| **Database** | MongoDB (User data, Products, Orders, Reviews) |
| **Tools** | Maven, Postman, Git |

## 🚀 Quick Start

### Prerequisites
-   Java 17 JDK
-   Node.js 18+
-   MongoDB (Local or Atlas)

### Backend Setup
1.  Navigate to `backend`.
2.  Update `src/main/resources/application.yml` or `.env` with your MongoDB URI and Mail credentials.
3.  Run:
    ```bash
    ./mvnw spring-boot:run
    ```
    *Server starts at `http://localhost:8080`*

### Frontend Setup
1.  Navigate to `frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
    *App starts at `http://localhost:5173`*

## 🔒 Security
-   **Role-Based Access**: Strict separation between User and Admin APIs.
-   **OTP Verification**: 2-step verification for "Forgot Password" and "Change Password" flows (2-minute expiry).
-   **Rate Limiting**: Protection against OTP abuse.

## 📄 License
MIT License

---
<p align="center">Built with ❤️ by ShopEase Team</p>
