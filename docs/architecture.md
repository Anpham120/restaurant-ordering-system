# Architecture

## 1. Tổng quan kiến trúc

Dự án sử dụng kiến trúc:

```text
Modular Monolith + AI RAG Service riêng
```

Kiến trúc này giúp giảm độ phức tạp so với microservices, nhưng vẫn giữ được tư duy phân tách module rõ ràng, dễ mở rộng và dễ chuyển đổi thành microservices trong tương lai.

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

## 3. Sơ đồ kiến trúc tổng thể

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

---

## 4. Thành phần hệ thống

### 4.1. Customer Web

Ứng dụng dành cho khách hàng.

Chức năng chính:

- Xem menu
- Đặt bàn
- Quét QR gọi món
- Theo dõi trạng thái món
- Hỏi AI tư vấn món

### 4.2. Admin Web

Ứng dụng dành cho nhân viên, bếp, thu ngân và quản lý.

Chức năng chính:

- Đăng nhập
- Quản lý bàn
- Check-in đặt bàn
- Kitchen Display
- Thu ngân
- Dashboard
- AI báo cáo

### 4.3. Restaurant.Api

Backend chính của hệ thống, xây dựng bằng ASP.NET Core.

Chức năng:

- Xử lý nghiệp vụ chính
- Xác thực và phân quyền
- Kết nối database
- Cung cấp REST API
- Cung cấp SignalR Hub
- Gọi AI Service khi cần

### 4.4. AI Service

Service riêng bằng FastAPI.

Chức năng:

- RAG menu chatbot
- Gợi ý món
- Hỏi đáp chính sách
- Sinh báo cáo quản lý
- Xây dựng và truy xuất vector store

### 4.5. PostgreSQL

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

### 4.6. Redis

Dùng cho cache hoặc session nếu cần.

Trong MVP, Redis là optional nhưng vẫn có thể được dùng cho:

- Cache menu
- Cache dashboard
- Rate limit
- Realtime connection mapping

### 4.7. SignalR

Dùng cho realtime:

- Bếp nhận order mới
- Nhân viên nhận món ready
- Khách theo dõi trạng thái món
- Dashboard cập nhật dữ liệu

---

## 5. Module backend

### 5.1. Identity Module

Phụ trách:

- Đăng nhập
- JWT
- Role
- User
- Phân quyền

### 5.2. Restaurant Module

Phụ trách:

- Menu category
- Menu item
- Area
- Table
- Trạng thái bàn

### 5.3. Reservation Module

Phụ trách:

- Tạo đặt bàn
- Xác nhận đặt bàn
- Hủy đặt bàn
- Check-in khách
- Tạo table session

### 5.4. Ordering Module

Phụ trách:

- Tạo order từ QR
- Lưu order item
- Chống double submit bằng idempotency key
- Theo dõi order status

### 5.5. Kitchen Module

Phụ trách:

- Danh sách món chờ xử lý
- Cập nhật trạng thái món
- Gửi realtime event cho staff/customer

### 5.6. Billing Module

Phụ trách:

- Tính hóa đơn
- Xác nhận thanh toán
- Đóng table session

### 5.7. Dashboard Module

Phụ trách:

- Tổng doanh thu
- Số order
- Bàn đang hoạt động
- Món bán chạy
- Báo cáo theo ngày

### 5.8. Notification Module

Phụ trách:

- Thông báo nội bộ
- Telegram alert nếu cần
- Deploy alert nếu tích hợp DevOps

---

## 6. Luồng realtime

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

## 7. Luồng AI RAG

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

---

## 8. Deployment overview

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

---

## 9. Hướng mở rộng tương lai

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

