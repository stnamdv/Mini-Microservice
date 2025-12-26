# API Gateway

API Gateway cho hệ thống mini-ecommerce microservices. Gateway này đóng vai trò là entry point duy nhất cho tất cả các client requests và forward chúng tới các microservices tương ứng.

## Công nghệ sử dụng

- **Node.js** với **Express**
- **http-proxy-middleware** để forward requests
- **Docker** để triển khai

## Tính năng

- ✅ Forward requests tới auth-service
- ✅ CORS handling
- ✅ Request logging
- ✅ Error handling
- ✅ Health check endpoint
- ✅ Dễ dàng mở rộng cho các service khác

## Cấu trúc

```
api-gateway/
├── server.js              # Main server với proxy configuration
├── Dockerfile             # Docker image configuration
├── package.json           # Dependencies
└── README.md              # Documentation
```

## API Routes

### Gateway Endpoints

- `GET /` - Thông tin về API Gateway
- `GET /health` - Health check

### Proxied Routes

Tất cả requests tới `/api/auth/*` sẽ được forward tới `auth-service`:

- `POST /api/auth/register` → Auth Service
- `POST /api/auth/login` → Auth Service
- `POST /api/auth/verify` → Auth Service
- `GET /api/auth/me` → Auth Service
- `GET /api/auth/admin` → Auth Service

## Cách sử dụng

### Chạy với Docker Compose (Khuyến nghị)

API Gateway được cấu hình trong `docker-compose.yml` ở thư mục gốc:

```bash
# Từ thư mục gốc của project
docker-compose up -d api-gateway

# Xem logs
docker-compose logs -f api-gateway
```

### Chạy local (Development)

```bash
cd api-gateway
npm install

# Tạo file .env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
NODE_ENV=development

# Start
npm start

# Hoặc development mode
npm run dev
```

## Environment Variables

```env
PORT=3000                                    # Port cho API Gateway
AUTH_SERVICE_URL=http://auth-service:3001   # URL của auth-service
NODE_ENV=production                          # Environment
```

## Ví dụ sử dụng

### Đăng ký qua API Gateway

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Đăng nhập qua API Gateway

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Mở rộng

Để thêm service mới vào Gateway, thêm proxy configuration trong `server.js`:

```javascript
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

app.use('/api/products', createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  // ... other options
}));
```

## Architecture

```
Client → API Gateway (Port 3000) → Auth Service (Port 3001)
                                  → Product Service (Port 3002)
                                  → Order Service (Port 3003)
                                  → ...
```

## Notes

- API Gateway chạy trên port 3000
- Tất cả requests từ client nên đi qua API Gateway
- Các services không cần expose ports ra ngoài (chỉ cần trong Docker network)
- Gateway tự động forward headers và body từ client tới services

