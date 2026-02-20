# 🛠️ Setup Guide

Follow this guide to set up the ShopEase E-Commerce Platform on your local machine.

## Prerequisites

Ensure you have the following installed:
-   **Java 17 JDK** (or higher)
-   **Node.js 18+** (LTS recommended)
-   **MongoDB** (Running locally on port 27017 or use MongoDB Atlas)
-   **Git**

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/ecommerce-website-java.git
cd ecommerce-website-java
```

## 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` root directory (or update `src/main/resources/application.yml`).

    **Example `.env` content:**
    ```env
    MONGODB_URI=mongodb://localhost:27017/ecommerce
    # Or for Atlas: mongodb+srv://<user>:<password>@cluster.mongodb.net/ecommerce
    
    JWT_SECRET=<your-jwt-secret-key>
    JWT_EXPIRATION=86400000 
    
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USERNAME=<your-email>
    MAIL_PASSWORD=<your-app-password>
    
    CORS_ORIGINS=http://localhost:5173
    ```

3.  **Run the Application**:
    Using Maven wrapper (Windows):
    ```bash
    .\mvnw.cmd spring-boot:run
    ```
    Using Maven wrapper (Mac/Linux):
    ```bash
    ./mvnw spring-boot:run
    ```

    ✅ The backend server will start at `http://localhost:8080`.

## 3. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `frontend` root directory.

    **Example `.env` content:**
    ```env
    VITE_API_URL=http://localhost:8080/api
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

    ✅ The frontend application will start at `http://localhost:5173`.

## 4. Verification

1.  Open your browser and go to `http://localhost:5173`.
2.  Register a new user account.
3.  Check the backend terminal logs to ensure database connection is successful.
4.  Try logging in and browsing products.

## Troubleshooting

-   **MongoDB Connection Error**: Ensure MongoDB is running locally or your Atlas IP whitelist allows your connection.
-   **Email Sending Failed**: Verify your `MAIL_USERNAME` and `MAIL_PASSWORD` (use App Password for Gmail).
-   **CROS Issues**: Ensure `CORS_ORIGINS` in backend matches your frontend URL.

---
**Happy Coding!** 🚀
