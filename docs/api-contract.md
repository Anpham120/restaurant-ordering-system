# API Contract

## 1. Quy ước chung

Tất cả API sử dụng prefix:

```text
/api/v1
```

Response lỗi dùng format chung:

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "errors": []
}
```

Response thành công dùng format:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

---

## 2. Authentication

### POST /api/v1/auth/login

Đăng nhập hệ thống.

Request:

```json
{
  "email": "manager@restaurant.local",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "user-id",
      "fullName": "Nguyễn Văn A",
      "email": "manager@restaurant.local",
      "role": "Manager"
    }
  }
}
```

### GET /api/v1/auth/me

Lấy thông tin người dùng hiện tại.

Header:

```text
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "fullName": "Nguyễn Văn A",
    "email": "manager@restaurant.local",
    "role": "Manager"
  }
}
```

---

## 3. Menu

### GET /api/v1/menu

Lấy danh sách menu.

Query optional:

```text
?categoryId=&keyword=&isAvailable=true
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "item-id",
      "name": "Lẩu Thái hải sản",
      "description": "Món lẩu cay chua",
      "price": 299000,
      "categoryId": "category-id",
      "categoryName": "Lẩu",
      "tags": ["cay", "bán chạy"],
      "isAvailable": true,
      "imageUrl": ""
    }
  ]
}
```

### GET /api/v1/menu/items/{id}

Lấy chi tiết món ăn.

### POST /api/v1/menu/items

Tạo món ăn mới.

Role yêu cầu:

```text
Manager
```

Request:

```json
{
  "name": "Ba chỉ bò Mỹ",
  "description": "Món nhúng lẩu",
  "price": 99000,
  "categoryId": "category-id",
  "tags": ["bò", "món nhúng"],
  "isAvailable": true,
  "imageUrl": ""
}
```

### PUT /api/v1/menu/items/{id}

Cập nhật món ăn.

### DELETE /api/v1/menu/items/{id}

Xóa hoặc vô hiệu hóa món ăn.

---

## 4. Tables

### GET /api/v1/tables

Lấy danh sách bàn.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "table-id",
      "tableNumber": "A01",
      "areaName": "Tầng 1",
      "capacity": 4,
      "status": "Available"
    }
  ]
}
```

### GET /api/v1/tables/{id}

Lấy chi tiết bàn.

### PUT /api/v1/tables/{id}/status

Cập nhật trạng thái bàn.

Request:

```json
{
  "status": "Available"
}
```

Trạng thái bàn:

```text
Available
Reserved
Occupied
Cleaning
Inactive
```

---

## 5. Reservations

### POST /api/v1/reservations

Khách đặt bàn.

Request:

```json
{
  "customerName": "Nguyễn Văn B",
  "phone": "0987654321",
  "guestCount": 4,
  "reservationTime": "2026-06-01T19:00:00",
  "note": "Muốn bàn gần cửa sổ"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "reservation-id",
    "reservationCode": "RSV-20260601-001",
    "status": "Pending"
  }
}
```

### GET /api/v1/reservations

Lấy danh sách đặt bàn.

Query optional:

```text
?date=&status=&keyword=
```

### GET /api/v1/reservations/{id}

Lấy chi tiết đặt bàn.

### PUT /api/v1/reservations/{id}/confirm

Xác nhận đặt bàn.

### PUT /api/v1/reservations/{id}/cancel

Hủy đặt bàn.

### POST /api/v1/reservations/{id}/check-in

Check-in khách đã đặt bàn.

Request:

```json
{
  "tableId": "table-id"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "tableSessionId": "session-id",
    "sessionToken": "secure-session-token",
    "qrOrderUrl": "/qr-order/secure-session-token"
  }
}
```

---

## 6. Table Sessions

### GET /api/v1/table-sessions/{id}

Lấy chi tiết phiên sử dụng bàn.

### GET /api/v1/table-sessions/by-token/{token}

Lấy phiên sử dụng bàn bằng QR token.

Response:

```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "tableId": "table-id",
    "tableNumber": "A01",
    "status": "Active",
    "openedAt": "2026-06-01T19:05:00"
  }
}
```

### POST /api/v1/table-sessions/{id}/close

Đóng phiên sử dụng bàn.

---

## 7. Orders

### POST /api/v1/orders

Tạo order từ QR.

Request:

```json
{
  "sessionToken": "secure-session-token",
  "idempotencyKey": "client-generated-key",
  "items": [
    {
      "menuItemId": "item-id",
      "quantity": 2,
      "note": "Ít cay"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "orderId": "order-id",
    "orderCode": "ORD-0001",
    "status": "Pending",
    "items": [
      {
        "id": "order-item-id",
        "menuItemName": "Lẩu Thái hải sản",
        "quantity": 2,
        "unitPrice": 299000,
        "status": "Pending"
      }
    ]
  }
}
```

### GET /api/v1/orders/{id}

Lấy chi tiết order.

### GET /api/v1/table-sessions/{id}/orders

Lấy danh sách order theo phiên bàn.

---

## 8. Kitchen

### GET /api/v1/kitchen/items

Lấy danh sách món cho bếp.

Query optional:

```text
?status=Pending
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "order-item-id",
      "orderCode": "ORD-0001",
      "tableNumber": "A01",
      "menuItemName": "Lẩu Thái hải sản",
      "quantity": 2,
      "note": "Ít cay",
      "status": "Pending",
      "createdAt": "2026-06-01T19:10:00"
    }
  ]
}
```

### PUT /api/v1/kitchen/items/{id}/status

Cập nhật trạng thái món.

Request:

```json
{
  "status": "Preparing"
}
```

Trạng thái món:

```text
Pending
Preparing
Ready
Served
Cancelled
```

---

## 9. Billing

### GET /api/v1/table-sessions/{id}/invoice-preview

Xem hóa đơn tạm tính.

Response:

```json
{
  "success": true,
  "data": {
    "tableSessionId": "session-id",
    "tableNumber": "A01",
    "items": [
      {
        "name": "Lẩu Thái hải sản",
        "quantity": 2,
        "unitPrice": 299000,
        "total": 598000
      }
    ],
    "subtotal": 598000,
    "discount": 0,
    "totalAmount": 598000
  }
}
```

### POST /api/v1/table-sessions/{id}/pay

Xác nhận thanh toán.

Request:

```json
{
  "paymentMethod": "Cash"
}
```

Payment method:

```text
Cash
BankTransfer
```

---

## 10. Dashboard

### GET /api/v1/dashboard/overview

Tổng quan dashboard.

Response:

```json
{
  "success": true,
  "data": {
    "revenueToday": 3500000,
    "ordersToday": 45,
    "activeTables": 8,
    "pendingKitchenItems": 12
  }
}
```

### GET /api/v1/reports/daily

Báo cáo ngày.

### GET /api/v1/reports/top-items

Món bán chạy.

### GET /api/v1/reports/revenue

Doanh thu theo thời gian.

---

## 11. AI Service

### POST /api/v1/ai/menu-chat

Hỏi đáp menu bằng RAG.

Request:

```json
{
  "question": "Đi 4 người khoảng 600k nên gọi món gì?",
  "sessionId": "optional-session-id"
}
```

Response:

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

### POST /api/v1/ai/recommend-combo

Gợi ý combo.

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

Request:

```json
{
  "date": "2026-06-01"
}
```

### POST /api/v1/ai/rebuild-index

Tạo lại vector index từ knowledge base.

### GET /health

Kiểm tra trạng thái AI Service.

---

## 12. SignalR Hubs

### /hubs/order

Dành cho customer order status.

Events client nhận:

```text
OrderItemPreparing
OrderItemReady
OrderItemServed
```

### /hubs/kitchen

Dành cho màn hình bếp.

Events client nhận:

```text
NewOrderCreated
OrderItemUpdated
```

### /hubs/dashboard

Dành cho dashboard quản lý.

Events client nhận:

```text
DashboardUpdated
PaymentCompleted
```

---

## 13. Backend Operations

### GET /health

Kiểm tra trạng thái hoạt động của Restaurant.Api (Backend Core). Endpoint này hoạt động tại root path (không có prefix `/api/v1`) để phục vụ kiểm tra trạng thái local, container health probe (Docker) và CI/CD.

Response:

- **HTTP Status 200 (OK):** Service hoạt động bình thường (Healthy).
  - Content-Type: `text/plain`
  - Response Body: `Healthy`
- **HTTP Status 503 (Service Unavailable):** Gặp sự cố không hoạt động bình thường (Unhealthy).
  - Content-Type: `text/plain`
  - Response Body: `Unhealthy`

