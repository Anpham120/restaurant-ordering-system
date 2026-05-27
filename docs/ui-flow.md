# UI Flow

## 1. Mục đích

Tài liệu này chuẩn hóa luồng giao diện cho Customer Web và Admin Web trong MVP để frontend, backend và AI agent phát triển song song không lệch nghiệp vụ.

Frontend phải bám theo:

```text
docs/api-contract.md
docs/db-schema.md
```

Nếu backend chưa hoàn thiện, frontend được phép dùng mock data nhưng mock phải có field và trạng thái giống API contract.

---

## 2. Nhóm người dùng

```text
Customer
Staff
Kitchen
Cashier
Manager
```

Quy tắc đăng nhập:

- Customer không bắt buộc đăng nhập trong MVP.
- Customer đặt bàn bằng thông tin liên hệ.
- Customer gọi món qua `sessionToken` của table session.
- Staff, Kitchen, Cashier và Manager bắt buộc đăng nhập bằng JWT.

Role redirect sau đăng nhập:

```text
Manager -> Dashboard
Staff -> Table Map
Kitchen -> Kitchen Display
Cashier -> Cashier Page
```

---

## 3. Cấu trúc ứng dụng

Customer Web:

```text
Home/Menu
Reservation
Reservation Lookup
QR Session
Cart
Order Status
AI Menu Chat
```

Admin Web:

```text
Login
Table Map
Reservations
Kitchen Display
Serving
Cashier
Dashboard
AI Manager Report
Menu Management
Table Management
```

---

## 4. Customer Web flow

### 4.1. Xem menu

Luồng:

```text
Open Customer Web
-> Load categories
-> Load menu items
-> Filter by category/search/availability
-> View item detail
```

API:

```text
GET /api/v1/menu/categories
GET /api/v1/menu/items
```

Màn hình cần có:

- Danh mục món.
- Danh sách món.
- Tên món, mô tả, giá, ảnh, tag, trạng thái còn món.
- Empty state khi không có món phù hợp.
- Loading state khi đang tải dữ liệu.

Rule:

- Món `isAvailable = false` không cho thêm vào giỏ.
- Giá hiển thị từ field `price`, không tự tính từ text.

### 4.2. Đặt bàn

Luồng:

```text
Reservation Form
-> Enter customerName, phone, guestCount, reservationTime, note
-> Submit reservation
-> Show reservationCode
-> Customer saves reservationCode
```

API:

```text
POST /api/v1/reservations
GET /api/v1/reservations/{reservationCode}
```

Trạng thái đặt bàn:

```text
Pending
Confirmed
Cancelled
CheckedIn
NoShow
```

Validation UI:

- `customerName` bắt buộc.
- `phone` bắt buộc.
- `guestCount` phải lớn hơn 0.
- `reservationTime` không được là thời điểm trong quá khứ.

Thông tin hiển thị sau khi đặt:

- Mã đặt bàn `reservationCode`.
- Trạng thái hiện tại.
- Thời gian đặt.
- Ghi chú nếu có.

### 4.3. QR session

Luồng:

```text
Customer scans QR
-> App receives sessionToken
-> Load active table session
-> Show table/session context
-> Customer can add items to cart
```

API:

```text
GET /api/v1/table-sessions/by-token/{sessionToken}
```

Rule:

- Nếu session không tồn tại hoặc không còn `Active`, chặn gọi món.
- Không hiển thị `sessionToken` như thông tin cần copy.
- Không lưu `sessionToken` vào nơi dễ lộ nếu không cần thiết.

### 4.4. Giỏ hàng và gọi món

Luồng:

```text
Browse menu in QR session
-> Add available item to cart
-> Adjust quantity/note
-> Submit order
-> Generate idempotencyKey
-> Show order detail
```

API:

```text
POST /api/v1/orders
GET /api/v1/orders/{id}?sessionToken={sessionToken}
```

Request chính:

```text
sessionToken
idempotencyKey
items[].menuItemId
items[].quantity
items[].note
```

Rule:

- `idempotencyKey` tạo ở client cho mỗi lần submit.
- Nút submit phải disable trong lúc gửi request để giảm double submit.
- Nếu lỗi `IDEMPOTENCY_CONFLICT`, hiển thị lỗi rõ và không tự gửi lại.
- Snapshot tên món và giá lấy từ response order, không tự suy luận khi xem order detail.

### 4.5. Theo dõi trạng thái món

Luồng:

```text
Order Detail
-> Subscribe realtime event
-> Item status changes
-> UI updates item row
```

Trạng thái món:

```text
Pending -> Preparing -> Ready -> Served
Cancelled
```

Realtime:

```text
/hubs/restaurant
OrderItemPreparing
OrderItemReady
OrderItemServed
```

Fallback:

- Nếu SignalR lỗi, polling `GET /api/v1/orders/{id}?sessionToken={sessionToken}`.
- UI phải hiển thị trạng thái kết nối realtime hoặc thông báo cập nhật chậm.

### 4.6. AI tư vấn món

Luồng:

```text
AI Menu Chat
-> Customer asks question
-> Send question/sessionId
-> Show grounded answer and sources
```

API:

```text
POST /api/v1/ai/menu-chat
POST /api/v1/ai/recommend-combo
```

Rule:

- Không gọi trực tiếp LLM provider từ frontend.
- Nếu response không có đủ context, hiển thị câu fallback từ API.
- Nếu có `sources`, hiển thị ngắn gọn để người dùng biết câu trả lời dựa trên dữ liệu nào.

---

## 5. Admin Web common flow

### 5.1. Đăng nhập

Luồng:

```text
Login Page
-> Submit email/password
-> Backend returns JWT and user role
-> Store accessToken
-> Redirect by role
```

API:

```text
POST /api/v1/auth/login
GET /api/v1/auth/me
```

Rule:

- Không hardcode token.
- Không commit account thật.
- Nếu token hết hạn hoặc API trả `401`, chuyển về Login.
- Nếu role không được phép truy cập màn hình, hiển thị `403` hoặc redirect về màn hình phù hợp.

### 5.2. Layout theo role

Navigation theo role:

```text
Staff:
- Table Map
- Reservations
- Serving

Kitchen:
- Kitchen Display

Cashier:
- Cashier
- Active Tables

Manager:
- Dashboard
- Reservations
- Table Map
- Menu Management
- Table Management
- AI Manager Report
```

Rule:

- Ẩn menu item không thuộc quyền role hiện tại.
- Backend vẫn là nơi quyết định quyền cuối cùng; frontend chỉ hỗ trợ UX.

---

## 6. Staff flow

### 6.1. Sơ đồ bàn

Luồng:

```text
Staff opens Table Map
-> Load areas
-> Load tables
-> Filter by area/status
-> Select table
-> View current status/session
```

API:

```text
GET /api/v1/areas
GET /api/v1/tables
PATCH /api/v1/tables/{id}/status
```

Trạng thái bàn:

```text
Available
Reserved
Occupied
Cleaning
Inactive
```

Realtime:

```text
TableStatusChanged
```

Rule:

- `Inactive` không cho mở table session.
- `Occupied` phải có active table session hoặc thông tin liên quan.
- Khi SignalR lỗi, polling danh sách bàn định kỳ.

### 6.2. Quản lý đặt bàn

Luồng:

```text
Reservations Page
-> Filter by date/status
-> Select reservation
-> Confirm and assign table
-> Or cancel reservation
```

API:

```text
GET /api/v1/reservations
PATCH /api/v1/reservations/{id}/confirm
PATCH /api/v1/reservations/{id}/cancel
```

Rule:

- Chỉ gán bàn còn phù hợp với sức chứa và trạng thái.
- Reservation đã `CheckedIn`, `Cancelled`, `NoShow` không cho confirm lại.

### 6.3. Check-in khách

Luồng:

```text
Find reservation
-> Verify customer info
-> Assign/confirm table
-> Check-in
-> Backend creates table session
-> Show QR/sessionToken for customer
```

API:

```text
POST /api/v1/reservations/{id}/check-in
POST /api/v1/table-sessions
```

Rule:

- Với khách không đặt trước, dùng `POST /api/v1/table-sessions`.
- Với khách đặt trước, dùng check-in reservation.
- QR phải chứa `sessionToken`, không chứa database credential hoặc thông tin nhạy cảm.

### 6.4. Phục vụ món

Luồng:

```text
Serving Page
-> Receive OrderItemReady
-> Staff serves item
-> Mark item as Served
```

API:

```text
PATCH /api/v1/kitchen/order-items/{id}/status
```

Realtime:

```text
OrderItemReady
OrderItemServed
```

Rule:

- Staff chỉ chuyển `Ready -> Served`.
- Không chuyển món chưa `Ready` sang `Served`.

---

## 7. Kitchen flow

Luồng:

```text
Kitchen Display
-> Load pending/preparing items
-> Receive NewOrderCreated
-> Mark item Preparing
-> Mark item Ready
```

API:

```text
GET /api/v1/kitchen/order-items
PATCH /api/v1/kitchen/order-items/{id}/status
```

Realtime:

```text
NewOrderCreated
OrderItemPreparing
OrderItemReady
```

Màn hình cần có:

- Cột hoặc filter theo `Pending`, `Preparing`, `Ready`.
- Bàn/mã order/tên món/số lượng/ghi chú.
- Thời điểm order được tạo.
- Empty state khi không có món chờ.

Rule:

- Kitchen không xử lý thanh toán.
- Kitchen không sửa giá, menu hoặc invoice.
- Transition chính: `Pending -> Preparing -> Ready`.

---

## 8. Cashier flow

Luồng:

```text
Cashier Page
-> Load active table sessions
-> Select table session
-> Preview invoice
-> Choose payment method
-> Confirm payment
-> Backend creates invoice and closes session
-> Table becomes Cleaning or Available
```

API:

```text
GET /api/v1/table-sessions/{id}
GET /api/v1/table-sessions/{id}/orders
GET /api/v1/table-sessions/{id}/invoice-preview
POST /api/v1/invoices
PATCH /api/v1/table-sessions/{id}/close
```

Payment method MVP:

```text
Cash
BankTransfer
```

Realtime:

```text
PaymentCompleted
TableStatusChanged
DashboardUpdated
```

Rule:

- Không tích hợp payment gateway trong MVP.
- Không cho thanh toán nếu còn món chưa xử lý theo rule nghiệp vụ.
- Sau khi thanh toán thành công, không cho tạo thêm order trong session đã đóng.

---

## 9. Manager flow

### 9.1. Dashboard

Luồng:

```text
Manager opens Dashboard
-> Load summary by date
-> Load revenue by date range
-> Watch realtime updates
```

API:

```text
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/revenue
```

Realtime:

```text
DashboardUpdated
PaymentCompleted
```

Dashboard hiển thị:

- Doanh thu.
- Số order.
- Số bàn đang hoạt động.
- Món bán chạy.
- Dữ liệu theo ngày hoặc khoảng ngày.

### 9.2. Quản lý menu

Luồng:

```text
Menu Management
-> Load categories/items
-> Create/update category
-> Create/update menu item
-> Toggle availability
```

API:

```text
GET /api/v1/menu/categories
GET /api/v1/menu/items
POST /api/v1/menu/categories
PUT /api/v1/menu/categories/{id}
POST /api/v1/menu/items
PUT /api/v1/menu/items/{id}
```

Rule:

- Không xóa vật lý menu item trong MVP.
- Món ngừng bán dùng `isAvailable = false`.
- Category ngừng dùng dùng `isActive = false`.

### 9.3. Quản lý bàn

Luồng:

```text
Table Management
-> Load areas/tables
-> Create/update table
-> Change status
```

API:

```text
GET /api/v1/areas
GET /api/v1/tables
POST /api/v1/tables
PUT /api/v1/tables/{id}
PATCH /api/v1/tables/{id}/status
```

Rule:

- Không cho đặt sức chứa nhỏ hơn hoặc bằng 0.
- Không cho trùng `tableNumber` trong cùng `area`.

### 9.4. AI Manager Report

Luồng:

```text
Dashboard
-> Generate Daily Report
-> Backend/AI Service receives date
-> AI returns grounded report
-> Manager reviews suggestions
```

API:

```text
POST /api/v1/ai/manager-report
POST /api/v1/ai/rebuild-index
```

Rule:

- Chỉ Manager dùng AI manager report.
- AI report phải nêu rõ khi thiếu dữ liệu.
- `rebuild-index` là thao tác quản trị, cần xác nhận trước khi chạy.

---

## 10. Trạng thái lỗi và fallback

UI phải xử lý các lỗi chuẩn từ API:

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

Mapping UX:

| Lỗi | Hành vi UI |
|---|---|
| `VALIDATION_ERROR` | Highlight field lỗi và hiển thị message |
| `UNAUTHORIZED` | Redirect Login hoặc yêu cầu đăng nhập lại |
| `FORBIDDEN` | Hiển thị không có quyền |
| `NOT_FOUND` | Hiển thị màn hình không tìm thấy |
| `CONFLICT` | Reload dữ liệu mới nhất và yêu cầu người dùng thử lại |
| `BUSINESS_RULE_VIOLATION` | Hiển thị lý do nghiệp vụ |
| `IDEMPOTENCY_CONFLICT` | Không retry tự động, yêu cầu kiểm tra order |
| `AI_SERVICE_UNAVAILABLE` | Hiển thị fallback, không chặn core flow |
| `INTERNAL_ERROR` | Hiển thị lỗi chung và traceId nếu có |

---

## 11. Nguyên tắc frontend

- Không hardcode API URL; dùng biến môi trường.
- Không commit token, password, API key hoặc `.env` thật.
- Mock data phải giống `docs/api-contract.md`.
- Field hiển thị phải dùng `camelCase` từ response.
- Không gọi trực tiếp database, Redis hoặc LLM provider.
- Realtime screen phải có fallback polling hoặc reload.
- Form submit phải có loading/disabled state.
- Danh sách phải có loading, empty và error state.
- Role-based UI không thay thế authorization ở backend.

---

## 12. Checklist kiểm thử UI flow

Khi thay đổi tài liệu UI flow:

```text
- Kiểm tra mọi flow chính có API tương ứng trong docs/api-contract.md.
- Kiểm tra trạng thái hiển thị khớp enum trong docs/db-schema.md.
- Kiểm tra Customer flow không yêu cầu đăng nhập.
- Kiểm tra Admin flow có role redirect và quyền truy cập.
- Kiểm tra realtime screen có fallback.
- Chạy git diff --check.
```

Khi đã có frontend implementation:

```text
npm install
npm run lint
npm run build
Kiểm tra thủ công các flow: đặt bàn, QR ordering, kitchen, cashier, dashboard.
```
