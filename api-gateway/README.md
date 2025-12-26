# API Gateway

API Gateway cho hệ thống mini-ecommerce microservices. Gateway này đóng vai trò là entry point duy nhất cho tất cả các client requests và forward chúng tới các microservices tương ứng.

## Công nghệ sử dụng

- **Node.js** với **Express**
- **http-proxy-middleware** để forward requests
- **Swagger/OpenAPI** cho API documentation
- **Docker** để triển khai

## Tính năng

- ✅ Forward requests tới auth-service
- ✅ **Swagger UI** - API Documentation dùng chung cho toàn bộ hệ thống
- ✅ CORS handling
- ✅ Request logging
- ✅ Error handling
- ✅ Health check endpoint
- ✅ Dễ dàng mở rộng cho các service khác

## Cấu trúc

```
api-gateway/
├── config/
│   └── swagger.js         # Swagger configuration
├── routes/
│   └── swagger-docs.js    # API documentation definitions
├── server.js              # Main server với proxy configuration
├── Dockerfile             # Docker image configuration
├── package.json           # Dependencies
└── README.md              # Documentation
```

## API Routes

### Gateway Endpoints

- `GET /` - Thông tin về API Gateway
- `GET /health` - Health check
- `GET /api-docs` - **Swagger UI Documentation** (Truy cập tại http://localhost:3000/api-docs)

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

### Swagger Documentation

Truy cập Swagger UI tại: **http://localhost:3000/api-docs**

Swagger UI cung cấp:
- ✅ Tài liệu API đầy đủ cho tất cả endpoints
- ✅ Test API trực tiếp từ browser
- ✅ Schema definitions cho request/response
- ✅ Authentication với Bearer Token
- ✅ Examples cho tất cả endpoints

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

## Swagger Documentation

API Gateway tích hợp **Swagger UI** để cung cấp tài liệu API tập trung cho toàn bộ hệ thống. **Swagger được enable trên cả development và production.**

### Truy cập Swagger UI

- **Development**: http://localhost:3000/api-docs
- **Production**: https://your-domain.com/api-docs (hoặc domain của bạn)

### Tính năng Swagger

- 📚 Tài liệu API đầy đủ với OpenAPI 3.0
- 🧪 Test API trực tiếp từ browser
- 🔐 Hỗ trợ Bearer Token authentication (persist khi refresh)
- 📋 Schema definitions cho request/response
- 💡 Examples cho tất cả endpoints
- 🔍 Tìm kiếm và filter endpoints
- ⏱️ Hiển thị thời gian request

### Swagger Endpoints

- `GET /api-docs` - Swagger UI interface
- `GET /api-docs.json` - OpenAPI JSON specification (dùng cho external tools)

### Cấu hình Production

Để Swagger hoạt động đúng trên production, set environment variable `API_GATEWAY_URL`:

```bash
# Trong docker-compose.yml hoặc .env
API_GATEWAY_URL=https://api.yourdomain.com
```

Hoặc trong `docker-compose.yml`:

```yaml
environment:
  API_GATEWAY_URL: https://api.yourdomain.com
```

Swagger sẽ tự động sử dụng URL này để test API trên production.

### Thêm API Documentation cho Service mới

Để thêm documentation cho service mới:

1. Thêm swagger definitions vào `routes/swagger-docs.js`
2. Thêm schemas vào `config/swagger.js` nếu cần
3. Swagger UI sẽ tự động cập nhật

## Notes

- API Gateway chạy trên port 3000
- Swagger UI có sẵn tại `/api-docs`
- Tất cả requests từ client nên đi qua API Gateway
- Các services không cần expose ports ra ngoài (chỉ cần trong Docker network)
- Gateway tự động forward headers và body từ client tới services

