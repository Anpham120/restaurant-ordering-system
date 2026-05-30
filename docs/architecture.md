# Architecture

## 1. Tổng quan kiến trúc

Dự án sử dụng kiến trúc:

```text
Modular Monolith + AI RAG Service riêng
```

Kiến trúc này giúp giảm độ phức tạp so với microservices, nhưng vẫn giữ được tư duy phân tách module rõ ràng, dễ mở rộng và dễ chuyển đổi thành microservices trong tương lai.

Backend core là một ứng dụng ASP.NET Core duy nhất. Các module nghiệp vụ được tách bằng namespace/project/layer nội bộ, không tách thành nhiều service deploy độc lập trong MVP. AI RAG Service là service riêng vì có runtime, dependency và pipeline dữ liệu khác với backend core.

---

## 2. Lý do chọn Modular Monolith

Full microservices yêu cầu xử lý nhiều vấn đề phức tạp:

- Service-to-service communication
- Service-to-service authentication
- Distributed transaction
- Event consistency
- Multiple deployment pipelines
- Debug xuyên nhiều service
- Đồng bộ API giữa nhiều service

Trong phạm vi đồ án, hệ thống chọn Modular Monolith để:

- Tăng tốc phát triển.
- Giảm rủi ro tích hợp.
- Dễ mở bằng Visual Studio.
- Dễ debug và demo.
- Vẫn giữ module nghiệp vụ tách biệt.
- Vẫn có thể tách dần thành microservices sau này.

---

## 3. Hiện trạng triển khai trong repository

Tại thời điểm tài liệu này được cập nhật, repository đã có:

```text
RestaurantOrderingSystem.sln
backend/restaurant-api/src/Restaurant.Api/
backend/restaurant-api/src/Restaurant.Application/
backend/restaurant-api/src/Restaurant.Domain/
backend/restaurant-api/src/Restaurant.Infrastructure/
backend/restaurant-api/tests/Restaurant.UnitTests/
backend/restaurant-api/tests/Restaurant.IntegrationTests/
docs/
infrastructure/docker-compose.local.yml
```

`Restaurant.Api` hiện có baseline ASP.NET Core gồm:

- OpenAPI trong môi trường development.
- Health check tại `GET /health`.
- HTTPS redirection, ngoại trừ `/health`.
- Endpoint mẫu `/weatherforecast` từ template. Endpoint này chỉ dùng để xác nhận skeleton chạy được và phải xóa khi có API nghiệp vụ thật thay thế.

Các phần sau là mục tiêu kiến trúc và có thể được tạo dần theo issue:

```text
frontend/customer-web/
frontend/admin-web/
services/ai-service/
infrastructure/nginx/
.github/workflows/
```

Khi một module hoặc service chưa tồn tại, không coi đó là lý do đổi kiến trúc. Issue triển khai phải tạo đúng vị trí đã quy ước.

---

## 4. Sơ đồ kiến trúc tổng thể

```text
Customer Web
Admin Web
    |
    v
ASP.NET Core Backend - Restaurant.Api
    |
    ├── Identity Module
    ├── Restaurant Module
    ├── Reservation Module
    ├── Ordering Module
    ├── Kitchen Module
    ├── Billing Module
    ├── Dashboard Module
    └── Notification Module
    |
    ├── PostgreSQL
    ├── Redis
    └── SignalR
    |
    v
FastAPI AI RAG Service
    |
    ├── Knowledge Base
    ├── Embedding
    ├── Vector Store
    └── LLM Provider
```

Luồng request chuẩn:

```text
Client
→ Restaurant.Api
→ Application use case
→ Domain rule
→ Infrastructure adapter
→ PostgreSQL/Redis/AI Service nếu cần
```

Frontend không gọi trực tiếp database, Redis hoặc AI provider. Nếu cần AI, request đi qua API/hợp đồng đã định nghĩa.

---

## 5. Thành phần hệ thống

### 5.1. Customer Web

Ứng dụng dành cho khách hàng.

Chức năng chính:

- Xem menu
- Đặt bàn
- Quét QR gọi món
- Theo dõi trạng thái món
- Hỏi AI tư vấn món

### 5.2. Admin Web

Ứng dụng dành cho nhân viên, bếp, thu ngân và quản lý.

Chức năng chính:

- Đăng nhập
- Quản lý bàn
- Check-in đặt bàn
- Kitchen Display
- Thu ngân
- Dashboard
- AI báo cáo

### 5.3. Restaurant.Api

Backend chính của hệ thống, xây dựng bằng ASP.NET Core.

Chức năng:

- Xử lý nghiệp vụ chính
- Xác thực và phân quyền
- Kết nối database
- Cung cấp REST API
- Cung cấp SignalR Hub
- Gọi AI Service khi cần

### 5.4. AI Service

Service riêng bằng FastAPI.

Chức năng:

- RAG menu chatbot
- Gợi ý món
- Hỏi đáp chính sách
- Sinh báo cáo quản lý
- Xây dựng và truy xuất vector store

### 5.5. PostgreSQL

Cơ sở dữ liệu chính.

Lưu:

- User
- Role
- Menu
- Table
- Reservation
- Table Session
- Order
- Order Item
- Invoice
- AI log
- Audit log

### 5.6. Redis

Dùng cho cache hoặc session nếu cần.

Trong MVP, Redis là optional nhưng vẫn có thể được dùng cho:

- Cache menu
- Cache dashboard
- Rate limit
- Realtime connection mapping

### 5.7. SignalR

Dùng cho realtime:

- Bếp nhận order mới
- Nhân viên nhận món ready
- Khách theo dõi trạng thái món
- Dashboard cập nhật dữ liệu

---

## 6. Backend layering

Backend được tổ chức thành các layer:

```text
Restaurant.Api
├── endpoint, middleware, auth wiring, OpenAPI, health check, SignalR hub

Restaurant.Application
├── use case, command/query handler, DTO, validation, interface port

Restaurant.Domain
├── entity, value object, enum, domain service, invariant nghiệp vụ

Restaurant.Infrastructure
└── EF Core, repository, migration, Redis, AI client, external integration
```

Luật phụ thuộc:

```text
Restaurant.Api -> Restaurant.Application -> Restaurant.Domain
Restaurant.Infrastructure -> Restaurant.Application
Restaurant.Infrastructure -> Restaurant.Domain
Restaurant.Domain -> không phụ thuộc layer khác
```

Domain không được phụ thuộc ASP.NET Core, EF Core, Redis, SignalR, FastAPI, LLM provider hoặc framework frontend.

---

## 7. Module backend

### 7.1. Identity Module

Phụ trách:

- Đăng nhập
- JWT
- Role
- User
- Phân quyền

### 7.2. Restaurant Module

Phụ trách:

- Menu category
- Menu item
- Area
- Table
- Trạng thái bàn

### 7.3. Reservation Module

Phụ trách:

- Tạo đặt bàn
- Xác nhận đặt bàn
- Hủy đặt bàn
- Check-in khách
- Tạo table session

### 7.4. Ordering Module

Phụ trách:

- Tạo order từ QR
- Lưu order item
- Chống double submit bằng idempotency key
- Theo dõi order status

### 7.5. Kitchen Module

Phụ trách:

- Danh sách món chờ xử lý
- Cập nhật trạng thái món
- Gửi realtime event cho staff/customer

### 7.6. Billing Module

Phụ trách:

- Tính hóa đơn
- Xác nhận thanh toán
- Đóng table session

### 7.7. Dashboard Module

Phụ trách:

- Tổng doanh thu
- Số order
- Bàn đang hoạt động
- Món bán chạy
- Báo cáo theo ngày

### 7.8. Notification Module

Phụ trách:

- Thông báo nội bộ
- Telegram alert nếu cần
- Deploy alert nếu tích hợp DevOps

---

## 8. Quan hệ giữa module

Module backend giao tiếp qua use case và domain event nội bộ, không gọi trực tiếp controller hoặc database table của nhau.

```text
Reservation
→ tạo TableSession
→ phát TableStatusChanged

Ordering
→ tạo Order/OrderItem
→ phát NewOrderCreated

Kitchen
→ cập nhật OrderItem status
→ phát OrderItemPreparing/OrderItemReady/OrderItemServed

Billing
→ tạo Invoice, đóng TableSession
→ phát PaymentCompleted

Dashboard
→ đọc dữ liệu tổng hợp
→ phát DashboardUpdated nếu cần realtime
```

Các thay đổi cross-module phải được phản ánh trong API contract, DB schema hoặc realtime event list nếu contract bị ảnh hưởng.

---

## 9. Luồng realtime

```text
Customer submits order
→ Backend creates order
→ SignalR emits NewOrderCreated
→ Kitchen receives order instantly
→ Kitchen updates item status
→ SignalR emits OrderItemReady
→ Staff and Customer receive update
```

Các event realtime chính:

```text
NewOrderCreated
OrderItemPreparing
OrderItemReady
OrderItemServed
TableStatusChanged
PaymentCompleted
DashboardUpdated
```

---

## 10. Luồng AI RAG

```text
User question
→ Backend or Frontend sends request to AI Service
→ AI Service embeds query
→ Vector store retrieves relevant documents
→ Prompt is built with retrieved context
→ LLM generates grounded response
→ Response is returned to user
```

Knowledge base gồm:

```text
menu.md
ingredient_notes.md
restaurant_policy.md
reservation_policy.md
payment_policy.md
faq.md
```

AI Service không là thành phần bắt buộc để hoàn tất core flow đặt bàn, gọi món, bếp và thanh toán. Nếu AI lỗi hoặc thiếu dữ liệu, hệ thống phải trả response có kiểm soát và không làm sập flow chính.

---

## 11. Deployment overview

MVP deployment:

```text
Nginx
├── Customer Web
├── Admin Web
├── Backend API
└── AI Service

Docker Compose
├── PostgreSQL
├── Redis
├── Restaurant.Api
├── AI Service
├── Customer Web
└── Admin Web
```

Local development tối thiểu:

```text
docker compose -f infrastructure/docker-compose.local.yml up -d
dotnet run --project backend/restaurant-api/src/Restaurant.Api/Restaurant.Api.csproj
GET /health
```

---

## 12. Ràng buộc kiến trúc

- Không tách module backend thành service deploy riêng trong MVP nếu issue không yêu cầu rõ.
- Không bỏ `GET /health`; endpoint này dùng cho local check, container health probe và CI/CD.
- Không để frontend phụ thuộc vào shape response chưa có trong `docs/api-contract.md`.
- Không thay database schema nếu chưa cập nhật `docs/db-schema.md`.
- Không đưa secret, connection string thật hoặc API key vào repository.
- Không để AI Service, Redis hoặc external provider là single point of failure cho core flow.
- Không dùng `/weatherforecast` như API nghiệp vụ thật.
- Không để lại code mẫu, endpoint thử, seed tạm hoặc dữ liệu test trong runtime production; demo data phải có script seed/reset riêng.

---

## 13. Hướng mở rộng tương lai

Các module có thể tách dần thành microservices:

```text
Identity Service
Restaurant Service
Ordering Service
Payment Service
AI Service
Notification Service
```

Các phần có thể bổ sung:

- RabbitMQ
- Blue/Green Deployment
- Prometheus, Grafana, Loki
- Payment Gateway
- Mobile App
- Advanced RAG Evaluation
