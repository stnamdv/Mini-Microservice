# Authentication & Authorization Service

Service xác thực và phân quyền cho hệ thống mini-ecommerce sử dụng kiến trúc microservice.

## Công nghệ sử dụng

- **Node.js** với **Express**
- **MongoDB** với **Mongoose**
- **JWT** (JSON Web Token) cho authentication
- **bcryptjs** để hash password
- **Docker** và **Docker Compose** để triển khai

## Cấu trúc dự án

```
auth-service/
├── config/
│   └── database.js          # Kết nối MongoDB
├── models/
│   └── User.js              # Model User với validation
├── middleware/
│   └── auth.js              # Middleware xác thực và phân quyền
├── routes/
│   └── auth.js              # Routes cho authentication
├── server.js                # Entry point của ứng dụng
├── Dockerfile               # Docker image configuration
├── docker-compose.yml       # Docker Compose configuration
└── package.json             # Dependencies
```

## Tính năng

### Authentication
- ✅ Đăng ký người dùng mới (Register)
- ✅ Đăng nhập (Login)
- ✅ Xác thực JWT token (Verify)
- ✅ Lấy thông tin user hiện tại (Get Me)

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Các role: `customer`, `admin`, `seller`
- ✅ Middleware bảo vệ routes theo role

## API Endpoints

### 1. Đăng ký (Register)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"  // optional: customer, admin, seller
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Đăng nhập (Login)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Xác thực Token (Verify)
```http
POST /api/auth/verify
Authorization: Bearer <token>
```

hoặc

```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "jwt_token_here"
}
```

### 4. Lấy thông tin User hiện tại (Get Me)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 5. Endpoint Admin (Chỉ dành cho Admin)
```http
GET /api/auth/admin
Authorization: Bearer <admin_token>
```

## Cách sử dụng

### 1. Cài đặt dependencies (Local development)

```bash
cd auth-service
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ecommerce_auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Chạy với Docker Compose (Khuyến nghị)

**Lưu ý:** Docker Compose file nằm ở thư mục gốc của project để quản lý nhiều service.

```bash
# Từ thư mục gốc của project (CHTPT)
# Build và start services
docker-compose up -d

# Xem logs
docker-compose logs -f auth-service

# Stop services
docker-compose down

# Stop và xóa volumes
docker-compose down -v
```

### 4. Chạy local (không dùng Docker)

```bash
# Đảm bảo MongoDB đang chạy
# Start service
npm start

# Hoặc development mode với nodemon
npm run dev
```

## Sử dụng trong Microservice

### Trong các service khác

1. **Gửi request với token:**
```javascript
const response = await fetch('http://auth-service:3001/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

2. **Sử dụng middleware trong service khác:**
```javascript
// Gọi auth service để verify token
const verifyToken = async (token) => {
  const response = await fetch('http://auth-service:3001/api/auth/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

## Roles và Permissions

- **customer**: Người dùng thông thường
- **seller**: Người bán hàng
- **admin**: Quản trị viên (có quyền truy cập tất cả)

## Security Features

- ✅ Password được hash bằng bcrypt
- ✅ JWT token với expiration
- ✅ Input validation
- ✅ Role-based authorization
- ✅ Token verification

## Health Check

```http
GET /health
```

## Notes

- JWT_SECRET nên được thay đổi trong môi trường production
- MongoDB data được lưu trong Docker volume `mongodb_data`
- Service chạy trên port 3001
- MongoDB chạy trên port 27017

