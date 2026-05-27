# API Contract

## 1. Mục đích

Tài liệu này là contract API bản đầu cho backend, frontend và AI Service phát triển song song trong MVP.

Contract này định nghĩa:

- Quy ước request/response chung.
- Endpoint chính cho Customer Web, Admin Web và AI Service.
- Realtime event qua SignalR.
- Health check cho backend và AI Service.
- Checklist kiểm thử khi thay đổi API.

Nếu implementation khác tài liệu này, phải cập nhật tài liệu trước hoặc trong cùng Pull Request.

---

## 2. Base URL và versioning

Backend core:

```text
Local:       https://localhost:{port}
API prefix:  /api/v1
Health:      /health
OpenAPI:     /openapi/v1.json trong môi trường Development
```

AI Service:

```text
Local:       http://localhost:{ai-port}
API prefix:  /api/v1
Health:      /health
```

Quy ước:

- Endpoint nghiệp vụ của backend dùng prefix `/api/v1`.
- `GET /health` không dùng prefix để phục vụ container health probe và CI/CD.
- Endpoint template `/weatherforecast` không phải contract nghiệp vụ.
- Endpoint hoặc response dùng để test thử phải được xóa khỏi code/API contract trước khi merge, trừ khi được ghi rõ là demo-only và có cách reset dữ liệu.

---

## 3. Chuẩn dữ liệu chung

### 3.1. JSON và thời gian

- Request và response dùng `application/json`, trừ health check trả `text/plain`.
- Tên field dùng `camelCase`.
- ID dùng UUID dạng string.
- Thời gian dùng ISO 8601 UTC, ví dụ `2026-06-01T12:30:00Z`.
- Tiền tệ dùng VND, kiểu number, không gửi ký hiệu tiền tệ trong field số.

### 3.2. Response thành công

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Với danh sách có phân trang:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

### 3.3. Response lỗi

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      {
        "field": "email",
        "message": "Email không hợp lệ"
      }
    ],
    "traceId": "request-trace-id"
  }
}
```

HTTP status chuẩn:

| Status | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Request không hợp lệ |
| 401 | Chưa đăng nhập hoặc token không hợp lệ |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy resource |
| 409 | Xung đột trạng thái hoặc dữ liệu trùng |
| 422 | Dữ liệu đúng JSON nhưng sai nghiệp vụ |
| 429 | Quá nhiều request |
| 500 | Lỗi server |

Mã lỗi chuẩn:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
BUSINESS_RULE_VIOLATION
IDEMPOTENCY_CONFLICT
AI_CONTEXT_NOT_FOUND
AI_SERVICE_UNAVAILABLE
INTERNAL_ERROR
```

---

## 4. Authentication và authorization

Các endpoint nội bộ dùng JWT Bearer:

```http
Authorization: Bearer <accessToken>
```

Role nội bộ:

```text
Manager
Staff
Kitchen
Cashier
```

Customer không bắt buộc đăng nhập trong MVP. Customer gọi món qua `sessionToken` của table session.

Endpoint public:

- `GET /api/v1/menu/categories`
- `GET /api/v1/menu/items`
- `POST /api/v1/reservations`
- `GET /api/v1/reservations/{reservationCode}`
- `POST /api/v1/orders`
- `GET /api/v1/orders/{id}` nếu có `sessionToken`
- `POST /api/v1/ai/menu-chat`
- `POST /api/v1/ai/recommend-combo`
- `GET /health`

Endpoint còn lại mặc định yêu cầu JWT và role phù hợp.

---

## 5. Enum chuẩn

```text
UserRole: Manager, Staff, Kitchen, Cashier
TableStatus: Available, Reserved, Occupied, Cleaning, Inactive
ReservationStatus: Pending, Confirmed, Cancelled, CheckedIn, NoShow
TableSessionStatus: Active, Closed, Cancelled
OrderStatus: Pending, Processing, Completed, Cancelled
OrderItemStatus: Pending, Preparing, Ready, Served, Cancelled
PaymentMethod: Cash, BankTransfer
PaymentStatus: Paid, Unpaid
```

---

## 6. Auth

### POST /api/v1/auth/login

Đăng nhập cho Staff, Kitchen, Cashier và Manager.

Request:

```json
{
  "email": "manager@example.com",
  "password": "password"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "expiresAt": "2026-06-01T12:30:00Z",
    "user": {
      "id": "user-id",
      "fullName": "Nguyễn Văn A",
      "email": "manager@example.com",
      "role": "Manager"
    }
  }
}
```

### GET /api/v1/auth/me

Lấy thông tin user hiện tại.

Auth: `Manager`, `Staff`, `Kitchen`, `Cashier`.

---

## 7. Menu

### GET /api/v1/menu/categories

Lấy danh mục menu đang hoạt động.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| includeInactive | No | Chỉ dùng cho Manager |

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "category-id",
      "name": "Lẩu",
      "description": "Các món lẩu",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

### GET /api/v1/menu/items

Lấy danh sách món.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| categoryId | No | Lọc theo danh mục |
| isAvailable | No | Lọc món còn bán |
| keyword | No | Tìm theo tên món |
| page | No | Mặc định `1` |
| pageSize | No | Mặc định `20` |

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "menu-item-id",
      "categoryId": "category-id",
      "name": "Lẩu Thái hải sản",
      "description": "Lẩu chua cay",
      "price": 299000,
      "imageUrl": "https://example.com/image.jpg",
      "tags": ["spicy", "seafood"],
      "isAvailable": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### POST /api/v1/menu/categories

Tạo danh mục menu.

Auth: `Manager`.

### PUT /api/v1/menu/categories/{id}

Cập nhật danh mục menu.

Auth: `Manager`.

### POST /api/v1/menu/items

Tạo món.

Auth: `Manager`.

### PUT /api/v1/menu/items/{id}

Cập nhật món.

Auth: `Manager`.

---

## 8. Areas và tables

### GET /api/v1/areas

Lấy danh sách khu vực bàn.

Auth: `Staff`, `Manager`, `Cashier`.

### GET /api/v1/tables

Lấy danh sách bàn.

Auth: `Staff`, `Manager`, `Cashier`.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| areaId | No | Lọc theo khu vực |
| status | No | Lọc theo `TableStatus` |

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "table-id",
      "areaId": "area-id",
      "areaName": "Tầng 1",
      "tableNumber": "A01",
      "capacity": 4,
      "status": "Available"
    }
  ]
}
```

### POST /api/v1/tables

Tạo bàn.

Auth: `Manager`.

### PUT /api/v1/tables/{id}

Cập nhật bàn.

Auth: `Manager`.

### PATCH /api/v1/tables/{id}/status

Cập nhật trạng thái bàn.

Auth: `Staff`, `Manager`.

Request:

```json
{
  "status": "Cleaning"
}
```

---

## 9. Reservations

### POST /api/v1/reservations

Customer tạo đặt bàn.

Request:

```json
{
  "customerName": "Nguyễn Văn A",
  "phone": "0900000000",
  "guestCount": 4,
  "reservationTime": "2026-06-01T19:00:00Z",
  "note": "Có trẻ em"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": "reservation-id",
    "reservationCode": "RSV-0001",
    "status": "Pending"
  }
}
```

### GET /api/v1/reservations/{reservationCode}

Tra cứu đặt bàn bằng mã đặt bàn.

### GET /api/v1/reservations

Danh sách đặt bàn cho staff.

Auth: `Staff`, `Manager`.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| status | No | Lọc theo `ReservationStatus` |
| date | No | Ngày đặt bàn, dạng `YYYY-MM-DD` |

### PATCH /api/v1/reservations/{id}/confirm

Xác nhận đặt bàn và gán bàn nếu có.

Auth: `Staff`, `Manager`.

Request:

```json
{
  "assignedTableId": "table-id"
}
```

### PATCH /api/v1/reservations/{id}/cancel

Hủy đặt bàn.

Auth: `Staff`, `Manager`.

### POST /api/v1/reservations/{id}/check-in

Check-in khách và tạo table session.

Auth: `Staff`, `Manager`.

Response `201`:

```json
{
  "success": true,
  "data": {
    "tableSessionId": "table-session-id",
    "sessionToken": "secure-session-token",
    "tableId": "table-id",
    "status": "Active"
  }
}
```

---

## 10. Table sessions

### POST /api/v1/table-sessions

Mở phiên bàn không đi qua đặt bàn.

Auth: `Staff`, `Manager`.

Request:

```json
{
  "tableId": "table-id"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": "table-session-id",
    "tableId": "table-id",
    "sessionToken": "secure-session-token",
    "status": "Active",
    "openedAt": "2026-06-01T12:30:00Z"
  }
}
```

### GET /api/v1/table-sessions/{id}

Lấy chi tiết phiên bàn.

Auth: `Staff`, `Manager`, `Cashier`.

### GET /api/v1/table-sessions/by-token/{sessionToken}

Lấy thông tin phiên bàn cho Customer QR flow.

### PATCH /api/v1/table-sessions/{id}/close

Đóng phiên bàn sau khi thanh toán.

Auth: `Cashier`, `Manager`.

---

## 11. Orders

### POST /api/v1/orders

Tạo order từ QR.

Request:

```json
{
  "sessionToken": "secure-session-token",
  "idempotencyKey": "client-generated-key",
  "items": [
    {
      "menuItemId": "menu-item-id",
      "quantity": 2,
      "note": "Ít cay"
    }
  ]
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "orderCode": "ORD-0001",
    "tableSessionId": "table-session-id",
    "status": "Pending",
    "items": [
      {
        "id": "order-item-id",
        "menuItemId": "menu-item-id",
        "menuItemName": "Lẩu Thái hải sản",
        "unitPrice": 299000,
        "quantity": 2,
        "note": "Ít cay",
        "status": "Pending"
      }
    ]
  }
}
```

Idempotency:

- `idempotencyKey` là bắt buộc.
- Backend chống double submit bằng `unique(table_session_id, idempotency_key)`.
- Nếu cùng key nhưng payload khác, trả `409 IDEMPOTENCY_CONFLICT`.

### GET /api/v1/orders/{id}

Lấy chi tiết order.

Auth: public nếu gửi `sessionToken`, hoặc `Staff`, `Kitchen`, `Cashier`, `Manager`.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| sessionToken | No | Dùng cho Customer QR flow |

### GET /api/v1/table-sessions/{id}/orders

Lấy danh sách order theo phiên bàn.

Auth: `Staff`, `Kitchen`, `Cashier`, `Manager`.

### PATCH /api/v1/orders/{id}/cancel

Hủy order nếu chưa xử lý.

Auth: `Staff`, `Manager`.

---

## 12. Kitchen

### GET /api/v1/kitchen/order-items

Danh sách món cho Kitchen Display.

Auth: `Kitchen`, `Manager`.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| status | No | `Pending`, `Preparing`, `Ready` |

### PATCH /api/v1/kitchen/order-items/{id}/status

Cập nhật trạng thái món.

Auth: `Kitchen`, `Manager`.

Request:

```json
{
  "status": "Preparing"
}
```

Rule:

- `Pending -> Preparing -> Ready -> Served`.
- `Cancelled` chỉ dùng khi order hoặc item bị hủy hợp lệ.
- Khi status đổi, backend phát SignalR event tương ứng.

---

## 13. Billing

### GET /api/v1/table-sessions/{id}/invoice-preview

Xem tạm tính hóa đơn.

Auth: `Cashier`, `Manager`.

Response `200`:

```json
{
  "success": true,
  "data": {
    "tableSessionId": "table-session-id",
    "subtotal": 598000,
    "discount": 0,
    "totalAmount": 598000,
    "items": [
      {
        "orderItemId": "order-item-id",
        "menuItemName": "Lẩu Thái hải sản",
        "unitPrice": 299000,
        "quantity": 2,
        "lineTotal": 598000
      }
    ]
  }
}
```

### POST /api/v1/invoices

Tạo hóa đơn và xác nhận thanh toán.

Auth: `Cashier`, `Manager`.

Request:

```json
{
  "tableSessionId": "table-session-id",
  "discount": 0,
  "paymentMethod": "Cash"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": "invoice-id",
    "invoiceCode": "INV-0001",
    "subtotal": 598000,
    "discount": 0,
    "totalAmount": 598000,
    "paymentMethod": "Cash",
    "paymentStatus": "Paid",
    "paidAt": "2026-06-01T12:30:00Z"
  }
}
```

### GET /api/v1/invoices/{id}

Lấy chi tiết hóa đơn.

Auth: `Cashier`, `Manager`.

---

## 14. Dashboard

### GET /api/v1/dashboard/summary

Tổng quan vận hành trong ngày.

Auth: `Manager`.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| date | No | `YYYY-MM-DD`, mặc định hôm nay |

Response `200`:

```json
{
  "success": true,
  "data": {
    "date": "2026-06-01",
    "revenue": 3500000,
    "orderCount": 42,
    "activeTableCount": 8,
    "topItems": [
      {
        "menuItemName": "Lẩu Thái hải sản",
        "quantity": 12,
        "revenue": 3588000
      }
    ]
  }
}
```

### GET /api/v1/dashboard/revenue

Doanh thu theo khoảng thời gian.

Auth: `Manager`.

Query:

| Field | Required | Ghi chú |
|---|---|---|
| fromDate | Yes | `YYYY-MM-DD` |
| toDate | Yes | `YYYY-MM-DD` |

---

## 15. AI Service

Các endpoint AI có thể được gọi qua backend gateway hoặc trực tiếp tới AI Service tùy cấu hình triển khai. Frontend không gọi trực tiếp LLM provider.

### POST /api/v1/ai/menu-chat

Hỏi đáp menu bằng RAG.

Request:

```json
{
  "question": "Đi 4 người khoảng 600k nên gọi món gì?",
  "sessionId": "optional-session-id"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "answer": "Gợi ý combo gồm...",
    "sources": [
      "menu.md",
      "restaurant_policy.md"
    ]
  }
}
```

Nếu không đủ context, AI phải trả lời có kiểm soát:

```json
{
  "success": true,
  "data": {
    "answer": "Hiện tại hệ thống chưa có đủ dữ liệu để kết luận.",
    "sources": []
  }
}
```

### POST /api/v1/ai/recommend-combo

Gợi ý combo món.

Request:

```json
{
  "numberOfPeople": 4,
  "budget": 600000,
  "preferences": ["không quá cay", "có trẻ em"]
}
```

### POST /api/v1/ai/manager-report

Sinh báo cáo quản lý.

Auth: `Manager`.

Request:

```json
{
  "date": "2026-06-01"
}
```

### POST /api/v1/ai/rebuild-index

Tạo lại vector index từ knowledge base.

Auth: `Manager`.

---

## 16. SignalR realtime

Backend cung cấp hub:

```text
/hubs/restaurant
```

Client gửi JWT khi cần nhận event nội bộ. Customer QR flow có thể subscribe bằng `sessionToken` nếu backend cho phép.

Event contract:

### NewOrderCreated

```json
{
  "orderId": "order-id",
  "orderCode": "ORD-0001",
  "tableSessionId": "table-session-id",
  "tableNumber": "A01",
  "createdAt": "2026-06-01T12:30:00Z"
}
```

### OrderItemPreparing

```json
{
  "orderItemId": "order-item-id",
  "orderId": "order-id",
  "status": "Preparing"
}
```

### OrderItemReady

```json
{
  "orderItemId": "order-item-id",
  "orderId": "order-id",
  "status": "Ready"
}
```

### OrderItemServed

```json
{
  "orderItemId": "order-item-id",
  "orderId": "order-id",
  "status": "Served"
}
```

### TableStatusChanged

```json
{
  "tableId": "table-id",
  "tableNumber": "A01",
  "status": "Occupied"
}
```

### PaymentCompleted

```json
{
  "invoiceId": "invoice-id",
  "tableSessionId": "table-session-id",
  "totalAmount": 598000,
  "paidAt": "2026-06-01T12:30:00Z"
}
```

### DashboardUpdated

```json
{
  "date": "2026-06-01",
  "revenue": 3500000,
  "orderCount": 42
}
```

---

## 17. Backend operations

### GET /health

Kiểm tra trạng thái hoạt động của `Restaurant.Api`.

Endpoint này hoạt động tại root path, không có prefix `/api/v1`.

Response:

- `200 OK`, Content-Type `text/plain`, body `Healthy`.
- `503 Service Unavailable`, Content-Type `text/plain`, body `Unhealthy`.

### GET /openapi/v1.json

OpenAPI document trong môi trường Development.

Endpoint này không bắt buộc bật ở Production.

---

## 18. AI operations

### GET /health

Kiểm tra trạng thái AI Service.

Response:

- `200 OK`, Content-Type `text/plain` hoặc `application/json`.
- `503 Service Unavailable` nếu AI Service không sẵn sàng.

Health check AI không được làm sập core flow backend. Nếu AI Service lỗi, backend phải trả lỗi có kiểm soát cho endpoint AI và vẫn cho phép đặt bàn, gọi món, bếp và thanh toán.

---

## 19. Checklist kiểm thử API contract

Khi thay đổi file này, kiểm tra:

```text
- Endpoint mới có method, path, auth, request và response mẫu.
- Field response dùng camelCase.
- Enum khớp docs/db-schema.md.
- Flow liên quan khớp docs/ui-flow.md.
- Nếu có database field mới, docs/db-schema.md đã được cập nhật trong cùng PR.
- Nếu có realtime event mới, đã thêm vào mục SignalR realtime.
- Nếu là docs-only change, chạy git diff --check và đọc lại Markdown.
```

Khi implementation backend đã có code, kiểm tra thêm:

```text
dotnet build RestaurantOrderingSystem.slnx
dotnet test backend/restaurant-api/tests/Restaurant.UnitTests/Restaurant.UnitTests.csproj
dotnet test backend/restaurant-api/tests/Restaurant.IntegrationTests/Restaurant.IntegrationTests.csproj
GET /health
```
