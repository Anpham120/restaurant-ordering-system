# Database Schema

## 1. Mục tiêu và phạm vi

Tài liệu này là schema chuẩn ban đầu cho backend **Restaurant.Api** trong giai đoạn MVP.

- Database engine: PostgreSQL.
- Database name: `restaurant_ordering`.
- Mô hình triển khai: một database dùng chung cho ASP.NET Core Modular Monolith.
- Phạm vi dữ liệu: Identity, Restaurant, Reservation, Ordering, Kitchen, Billing, Dashboard, AI log và Audit log.

Schema được thiết kế để hỗ trợ core flow:

```text
Quản lý tạo menu và bàn
-> Khách đặt bàn
-> Nhân viên check-in và mở phiên bàn
-> Khách gọi món bằng QR
-> Bếp xử lý món
-> Thu ngân thanh toán và đóng phiên
-> Quản lý xem báo cáo
```

---

## 2. Quy ước dữ liệu

### 2.1. Quy ước chung

| Nội dung | Quy ước |
|---|---|
| Naming | `snake_case`, tên bảng dạng số nhiều |
| Primary key | `id uuid primary key default gen_random_uuid()` |
| Thời gian nghiệp vụ | `timestamptz`, lưu UTC |
| Tiền tệ | `numeric(18,2)`, giá trị không âm |
| Text dài / dữ liệu linh hoạt | `text` hoặc `jsonb` theo mục đích truy vấn |
| Boolean | Luôn có `not null` và default hợp lý |
| Xóa dữ liệu nghiệp vụ | Ưu tiên vô hiệu hóa/trạng thái; không hard-delete dữ liệu đã tham gia order hoặc thanh toán |

Các bảng có thể thay đổi sau khi tạo dùng:

```text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

`updated_at` được cập nhật bởi application hoặc trigger trong cùng transaction với thay đổi dữ liệu.

### 2.2. Trạng thái chuẩn

Các giá trị trạng thái được giới hạn bằng check constraint trong migration đầu tiên. EF Core có thể ánh xạ sang enum ở Domain/Application layer.

| Nhóm | Giá trị hợp lệ |
|---|---|
| Role | `Manager`, `Staff`, `Kitchen`, `Cashier` |
| Table status | `Available`, `Reserved`, `Occupied`, `Cleaning`, `Inactive` |
| Reservation status | `Pending`, `Confirmed`, `Cancelled`, `CheckedIn`, `NoShow` |
| Table session status | `Active`, `Closed`, `Cancelled` |
| Order status | `Pending`, `Processing`, `Completed`, `Cancelled` |
| Order item status | `Pending`, `Preparing`, `Ready`, `Served`, `Cancelled` |
| Payment method | `Cash`, `BankTransfer` |
| Payment status | `Unpaid`, `Paid` |

---

## 3. Danh sách bảng

| Module | Bảng |
|---|---|
| Identity | `roles`, `users` |
| Restaurant | `areas`, `tables`, `menu_categories`, `menu_items`, `tags`, `menu_item_tags` |
| Reservation | `reservations`, `table_sessions` |
| Ordering / Kitchen | `orders`, `order_items` |
| Billing | `invoices` |
| AI / Audit | `ai_chat_logs`, `audit_logs` |

---

## 4. Identity

### 4.1. `roles`

Vai trò của tài khoản nội bộ. Customer không bắt buộc có tài khoản trong MVP.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `name` | `varchar(50)` | No | Unique; một trong các role chuẩn |
| `description` | `text` | Yes | Mô tả quyền |
| `created_at` | `timestamptz` | No | Default `now()` |

Ràng buộc:

```text
unique(name)
check (name in ('Manager', 'Staff', 'Kitchen', 'Cashier'))
```

Dữ liệu seed bắt buộc: `Manager`, `Staff`, `Kitchen`, `Cashier`.

### 4.2. `users`

Tài khoản đăng nhập của nhân viên nội bộ.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `role_id` | `uuid` | No | FK -> `roles.id` |
| `full_name` | `varchar(255)` | No | Họ tên hiển thị |
| `email` | `varchar(255)` | No | Email đăng nhập, lưu dạng chuẩn hóa lowercase |
| `password_hash` | `text` | No | Chỉ lưu mật khẩu đã hash |
| `is_active` | `boolean` | No | Default `true` |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
unique index on lower(email)
index(role_id)
```

Ghi chú API: trường `role` trong response authentication được lấy từ `roles.name`; không thay đổi API contract.

---

## 5. Restaurant

### 5.1. `areas`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `name` | `varchar(100)` | No | Tên khu vực |
| `description` | `text` | Yes | Mô tả |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc:

```text
unique(name)
```

### 5.2. `tables`

Danh sách bàn vật lý của nhà hàng.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `area_id` | `uuid` | No | FK -> `areas.id` |
| `table_number` | `varchar(50)` | No | Mã bàn hiển thị |
| `capacity` | `integer` | No | Sức chứa |
| `status` | `varchar(50)` | No | Default `Available` |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
unique(area_id, table_number)
check (capacity > 0)
check (status in ('Available', 'Reserved', 'Occupied', 'Cleaning', 'Inactive'))
index(area_id, status)
```

### 5.3. `menu_categories`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `name` | `varchar(100)` | No | Tên danh mục |
| `description` | `text` | Yes | Mô tả |
| `display_order` | `integer` | No | Default `0` |
| `is_active` | `boolean` | No | Default `true` |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc:

```text
unique(name)
check (display_order >= 0)
```

### 5.4. `menu_items`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `category_id` | `uuid` | No | FK -> `menu_categories.id` |
| `name` | `varchar(255)` | No | Tên món |
| `description` | `text` | Yes | Mô tả |
| `price` | `numeric(18,2)` | No | Giá hiện tại |
| `image_url` | `text` | Yes | URL ảnh |
| `is_available` | `boolean` | No | Default `true` |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
check (price >= 0)
index(category_id, is_available)
```

Không xóa món đã từng xuất hiện trong `order_items`; đặt `is_available = false`.

### 5.5. `tags`

Tag chuẩn hóa để hỗ trợ lọc món và trả về mảng `tags` trong API menu.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `name` | `varchar(100)` | No | Tên tag |
| `created_at` | `timestamptz` | No | Default `now()` |

Ràng buộc:

```text
unique index on lower(name)
```

### 5.6. `menu_item_tags`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `menu_item_id` | `uuid` | No | FK -> `menu_items.id` |
| `tag_id` | `uuid` | No | FK -> `tags.id` |

Ràng buộc:

```text
primary key(menu_item_id, tag_id)
index(tag_id)
```

---

## 6. Reservation và table session

### 6.1. `reservations`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `reservation_code` | `varchar(50)` | No | Mã cung cấp cho khách |
| `customer_name` | `varchar(255)` | No | Tên khách |
| `phone` | `varchar(20)` | No | Số điện thoại liên hệ |
| `guest_count` | `integer` | No | Số khách |
| `reservation_time` | `timestamptz` | No | Thời điểm đặt bàn |
| `note` | `text` | Yes | Ghi chú |
| `status` | `varchar(50)` | No | Default `Pending` |
| `assigned_table_id` | `uuid` | Yes | FK -> `tables.id`; gán khi xác nhận/check-in |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
unique(reservation_code)
check (guest_count > 0)
check (status in ('Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'NoShow'))
index(reservation_time, status)
index(phone)
index(assigned_table_id, reservation_time)
```

Application phải kiểm tra `guest_count <= tables.capacity` khi gán bàn và không check-in vào bàn đang có active session.

### 6.2. `table_sessions`

Phiên phục vụ tại bàn, được tạo khi check-in thành công.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `table_id` | `uuid` | No | FK -> `tables.id` |
| `reservation_id` | `uuid` | Yes | FK -> `reservations.id` |
| `session_token_hash` | `char(64)` | No | SHA-256 hash của token QR; không lưu token thô |
| `status` | `varchar(50)` | No | Default `Active` |
| `opened_at` | `timestamptz` | No | Default `now()` |
| `closed_at` | `timestamptz` | Yes | Có khi session đã đóng/hủy |
| `created_by` | `uuid` | No | FK -> `users.id` |
| `created_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
unique(session_token_hash)
unique index on reservation_id where reservation_id is not null
unique index on table_id where status = 'Active'
check (status in ('Active', 'Closed', 'Cancelled'))
check (closed_at is null or closed_at >= opened_at)
index(status, opened_at)
```

Ghi chú API: endpoint vẫn nhận và trả `sessionToken`; backend sinh token ngẫu nhiên đủ mạnh, chỉ lưu hash để tra cứu token QR.

---

## 7. Ordering và Kitchen

### 7.1. `orders`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `table_session_id` | `uuid` | No | FK -> `table_sessions.id` |
| `order_code` | `varchar(50)` | No | Mã order hiển thị |
| `idempotency_key` | `varchar(255)` | No | Khóa chống submit trùng từ client |
| `status` | `varchar(50)` | No | Default `Pending` |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
unique(order_code)
unique(table_session_id, idempotency_key)
check (status in ('Pending', 'Processing', 'Completed', 'Cancelled'))
index(table_session_id, created_at)
index(status, created_at)
```

Chỉ cho tạo order khi `table_sessions.status = 'Active'`.

### 7.2. `order_items`

Mỗi dòng là một món bếp cần xử lý. Tên món và đơn giá được snapshot tại thời điểm tạo order.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `order_id` | `uuid` | No | FK -> `orders.id` |
| `menu_item_id` | `uuid` | No | FK -> `menu_items.id` |
| `menu_item_name` | `varchar(255)` | No | Snapshot tên món |
| `unit_price` | `numeric(18,2)` | No | Snapshot đơn giá |
| `quantity` | `integer` | No | Số lượng |
| `note` | `text` | Yes | Ghi chú chế biến |
| `status` | `varchar(50)` | No | Default `Pending` |
| `started_at` | `timestamptz` | Yes | Thời điểm bếp bắt đầu |
| `ready_at` | `timestamptz` | Yes | Thời điểm món sẵn sàng |
| `served_at` | `timestamptz` | Yes | Thời điểm phục vụ |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
check (unit_price >= 0)
check (quantity > 0)
check (status in ('Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'))
index(order_id)
index(status, created_at)
```

Việc chuyển trạng thái và ghi thời gian tương ứng phải thực hiện trong cùng transaction.

---

## 8. Billing

### 8.1. `invoices`

Mỗi table session chỉ phát sinh tối đa một hóa đơn.

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `table_session_id` | `uuid` | No | FK -> `table_sessions.id` |
| `invoice_code` | `varchar(50)` | No | Mã hóa đơn |
| `subtotal` | `numeric(18,2)` | No | Tạm tính |
| `discount` | `numeric(18,2)` | No | Default `0` |
| `total_amount` | `numeric(18,2)` | No | Tổng thanh toán |
| `payment_method` | `varchar(50)` | Yes | Có khi xác nhận thanh toán |
| `payment_status` | `varchar(50)` | No | Default `Unpaid` |
| `paid_at` | `timestamptz` | Yes | Có khi đã thanh toán |
| `cashier_id` | `uuid` | Yes | FK -> `users.id`; bắt buộc khi thanh toán |
| `created_at` | `timestamptz` | No | Default `now()` |
| `updated_at` | `timestamptz` | No | Default `now()` |

Ràng buộc và index:

```text
unique(table_session_id)
unique(invoice_code)
check (subtotal >= 0 and discount >= 0 and total_amount >= 0)
check (total_amount = subtotal - discount)
check (payment_method is null or payment_method in ('Cash', 'BankTransfer'))
check (payment_status in ('Unpaid', 'Paid'))
check (
  (payment_status = 'Unpaid' and paid_at is null and cashier_id is null)
  or
  (payment_status = 'Paid' and paid_at is not null and cashier_id is not null and payment_method is not null)
)
index(payment_status, paid_at)
```

Khi thanh toán thành công, application cập nhật invoice, đóng `table_sessions` và chuyển `tables.status` về trạng thái phù hợp trong cùng transaction.

---

## 9. AI và audit

### 9.1. `ai_chat_logs`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `user_id` | `uuid` | Yes | FK -> `users.id`; null cho customer ẩn danh |
| `session_id` | `varchar(255)` | Yes | ID phiên chat từ client |
| `question` | `text` | No | Câu hỏi |
| `answer` | `text` | No | Nội dung trả lời |
| `sources` | `jsonb` | No | Default `[]`; danh sách nguồn RAG |
| `created_at` | `timestamptz` | No | Default `now()` |

Index:

```text
index(user_id, created_at)
index(session_id, created_at)
```

### 9.2. `audit_logs`

| Cột | Kiểu dữ liệu | Null | Ghi chú |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `user_id` | `uuid` | Yes | FK -> `users.id`; null cho thao tác hệ thống |
| `action` | `varchar(255)` | No | Ví dụ `Reservation.CheckedIn` |
| `entity_name` | `varchar(255)` | No | Tên entity |
| `entity_id` | `uuid` | Yes | ID entity nếu có |
| `old_value` | `jsonb` | Yes | Snapshot trước thay đổi |
| `new_value` | `jsonb` | Yes | Snapshot sau thay đổi |
| `created_at` | `timestamptz` | No | Default `now()` |

Index:

```text
index(entity_name, entity_id, created_at)
index(user_id, created_at)
```

Không ghi mật khẩu, token QR thô, JWT hoặc secret vào audit log.

---

## 10. Quan hệ chính

```text
roles 1 ---- n users
areas 1 ---- n tables
menu_categories 1 ---- n menu_items
menu_items n ---- n tags (qua menu_item_tags)
tables 1 ---- n reservations
reservations 0..1 ---- 1 table_sessions
tables 1 ---- n table_sessions
users 1 ---- n table_sessions (created_by)
table_sessions 1 ---- n orders
orders 1 ---- n order_items
menu_items 1 ---- n order_items
table_sessions 1 ---- 0..1 invoices
users 1 ---- n invoices (cashier_id)
users 1 ---- n ai_chat_logs
users 1 ---- n audit_logs
```

---

## 11. Quy tắc nghiệp vụ cần bảo vệ

| Quy tắc | Cách bảo vệ |
|---|---|
| Một bàn chỉ có một phiên active | Partial unique index trên `table_sessions(table_id)` khi `status = 'Active'` |
| QR không bị lộ nếu database rò rỉ | Chỉ lưu `session_token_hash`; token thô chỉ trả về client khi tạo |
| Không tạo order trùng do retry | Unique `(table_session_id, idempotency_key)` |
| Hóa đơn không thay đổi khi menu đổi giá | Snapshot `menu_item_name`, `unit_price` trong `order_items` |
| Một phiên bàn chỉ có một hóa đơn | Unique `invoices.table_session_id` |
| Dữ liệu doanh thu chỉ tính thanh toán hoàn tất | Báo cáo lọc `payment_status = 'Paid'` |
| Lịch sử nghiệp vụ không mất | Vô hiệu hóa menu/user thay vì xóa dữ liệu đã được tham chiếu |

---

## 12. Ánh xạ với API contract

Schema này không thay đổi endpoint hoặc payload trong `docs/api-contract.md`.

| API field / hành vi | Nguồn dữ liệu |
|---|---|
| `user.role` | Join `users.role_id` -> `roles.name` |
| Menu `tags: []` | Join `menu_items` -> `menu_item_tags` -> `tags.name` |
| `sessionToken` | Token thô sinh khi check-in; lookup bằng hash tại `table_sessions.session_token_hash` |
| Order item `menuItemName`, `unitPrice` | Snapshot trong `order_items` |
| Invoice preview | Tính từ các `order_items` hợp lệ thuộc table session |
| Dashboard revenue | Tổng `invoices.total_amount` đã `Paid` theo thời gian thanh toán |

---

## 13. Quy tắc migration và triển khai EF Core

1. Migration đầu tiên phải tạo extension hoặc cơ chế sinh UUID phù hợp cho `gen_random_uuid()`.
2. Tạo bảng theo thứ tự phụ thuộc FK: `roles`, `users`, `areas`, `tables`, `menu_categories`, `menu_items`, `tags`, `menu_item_tags`, `reservations`, `table_sessions`, `orders`, `order_items`, `invoices`, `ai_chat_logs`, `audit_logs`.
3. Seed bốn role nội bộ trong migration hoặc seed configuration.
4. Tạo đầy đủ unique/check constraint và partial unique index được chỉ định trong tài liệu này.
5. Không tạo migration xóa hoặc đổi tên cột dữ liệu nghiệp vụ nếu chưa có kế hoạch chuyển đổi dữ liệu.
6. Mọi thay đổi sau schema bản đầu phải cập nhật tài liệu này và ghi rõ phần `DB affected` trong Pull Request.

---

## 14. Kiểm tra schema khi triển khai

Khi issue EF Core/PostgreSQL được thực hiện, cần kiểm tra tối thiểu:

1. Apply migration lên database rỗng thành công.
2. Seed role tạo đúng bốn vai trò và không trùng khi chạy lại.
3. Không thể tạo hai active session cho cùng một bàn.
4. Không thể tạo hai order có cùng `idempotency_key` trong cùng table session.
5. Không thể tạo hai invoice cho cùng table session.
6. API menu vẫn trả tags dạng mảng và authentication vẫn trả role dạng chuỗi.
7. Token QR thô không xuất hiện trong database hoặc audit log.
