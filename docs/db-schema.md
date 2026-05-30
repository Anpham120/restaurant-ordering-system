# Database Schema

## 1. Mục đích

Tài liệu này là database schema bản đầu cho MVP của hệ thống quản lý đặt bàn và gọi món nhà hàng.

Schema này là nguồn tham chiếu cho:

- Entity và migration của `Restaurant.Infrastructure`.
- DTO/API contract trong `docs/api-contract.md`.
- Luồng UI trong `docs/ui-flow.md`.
- Kiểm thử tích hợp với PostgreSQL.

Nếu code, migration hoặc API cần thêm bảng/cột/quan hệ mới, phải cập nhật tài liệu này trong cùng Pull Request.

---

## 2. Quy ước chung

Database chính:

```text
PostgreSQL
```

Quy ước đặt tên:

- Tên bảng dùng `snake_case`, số nhiều.
- Tên cột dùng `snake_case`.
- Primary key dùng `id`.
- Foreign key dùng `{table_singular}_id`.
- Thời gian dùng `timestamp with time zone` trong PostgreSQL.
- ID dùng `uuid`.
- Tiền dùng `decimal(18,2)`.
- Trạng thái lưu dạng `varchar(50)` trong MVP để dễ migration; code nên map sang enum.

Quy ước audit tối thiểu:

- Bảng nghiệp vụ chính nên có `created_at`.
- Bảng có dữ liệu chỉnh sửa thường xuyên nên có `updated_at`.
- Log/audit append-only không bắt buộc có `updated_at`.

---

## 3. Enum chuẩn

Các enum này phải khớp `docs/api-contract.md`.

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

## 4. Danh sách bảng chính

```text
roles
users
areas
tables
menu_categories
menu_items
reservations
table_sessions
orders
order_items
invoices
ai_chat_logs
audit_logs
```

---

## 5. Bảng roles

Lưu danh sách role nội bộ.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| name | varchar(50) | No | Unique, một trong `Manager`, `Staff`, `Kitchen`, `Cashier` |
| description | text | Yes | Mô tả |
| created_at | timestamp with time zone | No | Ngày tạo |

Ràng buộc:

```text
unique(name)
```

Seed data bắt buộc:

```text
Manager
Staff
Kitchen
Cashier
```

---

## 6. Bảng users

Lưu thông tin tài khoản nội bộ.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| full_name | varchar(255) | No | Họ tên |
| email | varchar(255) | No | Unique, dùng đăng nhập |
| password_hash | text | No | Mật khẩu đã hash |
| role | varchar(50) | No | `Manager`, `Staff`, `Kitchen`, `Cashier` |
| is_active | boolean | No | Mặc định `true` |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
unique(email)
index(role)
index(is_active)
```

Ghi chú:

- `role` lưu dạng string trong MVP để đơn giản hóa API và migration.
- Nếu dùng bảng `roles` cho FK ở implementation, vẫn phải giữ contract role string khớp API.

---

## 7. Bảng areas

Lưu khu vực bàn.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| name | varchar(100) | No | Tên khu vực |
| description | text | Yes | Mô tả |
| created_at | timestamp with time zone | No | Ngày tạo |

Ràng buộc:

```text
unique(name)
```

---

## 8. Bảng tables

Lưu danh sách bàn.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| area_id | uuid | No | FK -> areas.id |
| table_number | varchar(50) | No | Mã bàn trong khu vực |
| capacity | int | No | Sức chứa, phải lớn hơn 0 |
| status | varchar(50) | No | `TableStatus` |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
unique(area_id, table_number)
check(capacity > 0)
index(area_id)
index(status)
```

---

## 9. Bảng menu_categories

Lưu danh mục món ăn.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| name | varchar(100) | No | Tên danh mục |
| description | text | Yes | Mô tả |
| display_order | int | No | Thứ tự hiển thị, mặc định `0` |
| is_active | boolean | No | Mặc định `true` |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
unique(name)
index(is_active)
index(display_order)
```

---

## 10. Bảng menu_items

Lưu món ăn.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| category_id | uuid | No | FK -> menu_categories.id |
| name | varchar(255) | No | Tên món |
| description | text | Yes | Mô tả |
| price | decimal(18,2) | No | Giá bán |
| image_url | text | Yes | Ảnh món |
| tags | text | Yes | Danh sách tag, MVP có thể lưu JSON string hoặc chuỗi phân tách |
| is_available | boolean | No | Còn món hay không, mặc định `true` |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
check(price >= 0)
index(category_id)
index(is_available)
index(name)
```

Ghi chú:

- Không dùng giá hiện tại của `menu_items` để tính lại hóa đơn cũ.
- `order_items.menu_item_name` và `order_items.unit_price` là snapshot tại thời điểm order.

---

## 11. Bảng reservations

Lưu thông tin đặt bàn.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| reservation_code | varchar(50) | No | Unique, mã tra cứu đặt bàn |
| customer_name | varchar(255) | No | Tên khách |
| phone | varchar(20) | No | Số điện thoại |
| guest_count | int | No | Số khách |
| reservation_time | timestamp with time zone | No | Thời gian đặt |
| note | text | Yes | Ghi chú |
| status | varchar(50) | No | `ReservationStatus` |
| assigned_table_id | uuid | Yes | FK -> tables.id |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
unique(reservation_code)
check(guest_count > 0)
index(phone)
index(status)
index(reservation_time)
index(assigned_table_id)
```

---

## 12. Bảng table_sessions

Lưu phiên sử dụng bàn.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| table_id | uuid | No | FK -> tables.id |
| reservation_id | uuid | Yes | FK -> reservations.id |
| session_token | varchar(255) | No | Unique, token QR cho Customer flow |
| status | varchar(50) | No | `TableSessionStatus` |
| opened_at | timestamp with time zone | No | Thời gian mở phiên |
| closed_at | timestamp with time zone | Yes | Thời gian đóng phiên |
| created_by | uuid | No | FK -> users.id |

Ràng buộc/index:

```text
unique(session_token)
index(table_id)
index(reservation_id)
index(status)
index(created_by)
partial unique(table_id) where status = 'Active'
```

Rule:

- Một bàn chỉ có tối đa một active session tại cùng thời điểm.
- session_token phải khó đoán, unique, không dùng ID tuần tự.
- Khi session `Closed`, bàn có thể chuyển sang `Cleaning` hoặc `Available` theo nghiệp vụ.

---

## 13. Bảng orders

Lưu đơn gọi món.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| table_session_id | uuid | No | FK -> table_sessions.id |
| order_code | varchar(50) | No | Unique, mã order |
| idempotency_key | varchar(255) | No | Chống double submit từ Customer QR flow |
| status | varchar(50) | No | `OrderStatus` |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
unique(order_code)
unique(table_session_id, idempotency_key)
index(table_session_id)
index(status)
index(created_at)
```

Rule:

- Nếu request lặp lại cùng `table_session_id` và `idempotency_key` với payload giống nhau, backend có thể trả lại order đã tạo.
- Nếu cùng key nhưng payload khác, trả lỗi `IDEMPOTENCY_CONFLICT`.

---

## 14. Bảng order_items

Lưu chi tiết món trong order.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| order_id | uuid | No | FK -> orders.id |
| menu_item_id | uuid | No | FK -> menu_items.id |
| menu_item_name | varchar(255) | No | Snapshot tên món |
| unit_price | decimal(18,2) | No | Snapshot giá |
| quantity | int | No | Số lượng |
| note | text | Yes | Ghi chú |
| status | varchar(50) | No | `OrderItemStatus` |
| started_at | timestamp with time zone | Yes | Bắt đầu làm |
| ready_at | timestamp with time zone | Yes | Sẵn sàng phục vụ |
| served_at | timestamp with time zone | Yes | Đã phục vụ |
| created_at | timestamp with time zone | No | Ngày tạo |
| updated_at | timestamp with time zone | No | Ngày cập nhật |

Ràng buộc/index:

```text
check(quantity > 0)
check(unit_price >= 0)
index(order_id)
index(menu_item_id)
index(status)
index(created_at)
```

Rule trạng thái:

```text
Pending -> Preparing -> Ready -> Served
Pending/Preparing -> Cancelled nếu hủy hợp lệ
```

---

## 15. Bảng invoices

Lưu hóa đơn và thanh toán.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| table_session_id | uuid | No | FK -> table_sessions.id |
| invoice_code | varchar(50) | No | Unique, mã hóa đơn |
| subtotal | decimal(18,2) | No | Tạm tính |
| discount | decimal(18,2) | No | Giảm giá, mặc định `0` |
| total_amount | decimal(18,2) | No | Tổng tiền |
| payment_method | varchar(50) | No | `PaymentMethod` |
| payment_status | varchar(50) | No | `PaymentStatus` |
| paid_at | timestamp with time zone | Yes | Thời gian thanh toán |
| cashier_id | uuid | No | FK -> users.id |
| created_at | timestamp with time zone | No | Ngày tạo |

Ràng buộc/index:

```text
unique(invoice_code)
unique(table_session_id)
check(subtotal >= 0)
check(discount >= 0)
check(total_amount >= 0)
index(payment_status)
index(paid_at)
index(cashier_id)
```

Rule:

- MVP chỉ cho phép một hóa đơn cho một `table_session`.
- `total_amount = subtotal - discount`.
- Khi thanh toán thành công, `payment_status = Paid`, `paid_at` có giá trị và table session được đóng.

---

## 16. Bảng ai_chat_logs

Lưu lịch sử hỏi AI.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| user_id | uuid | Yes | FK -> users.id, nullable vì Customer không đăng nhập |
| session_id | varchar(255) | Yes | Session chat hoặc Customer session |
| question | text | No | Câu hỏi |
| answer | text | No | Câu trả lời |
| sources | text | Yes | Danh sách tài liệu tham chiếu, có thể lưu JSON string |
| created_at | timestamp with time zone | No | Ngày tạo |

Index:

```text
index(user_id)
index(session_id)
index(created_at)
```

Rule:

- AI không được bịa dữ liệu ngoài knowledge base.
- Khi không đủ context, lưu câu trả lời fallback thay vì lỗi không kiểm soát.

---

## 17. Bảng audit_logs

Lưu lịch sử thao tác quan trọng.

| Cột | Kiểu dữ liệu | Nullable | Ghi chú |
|---|---|---:|---|
| id | uuid | No | Primary key |
| user_id | uuid | Yes | FK -> users.id, nullable cho system action |
| action | varchar(255) | No | Hành động |
| entity_name | varchar(255) | No | Tên entity |
| entity_id | uuid | Yes | ID entity |
| old_value | text | Yes | Giá trị cũ, có thể lưu JSON string |
| new_value | text | Yes | Giá trị mới, có thể lưu JSON string |
| created_at | timestamp with time zone | No | Thời gian |

Index:

```text
index(user_id)
index(entity_name, entity_id)
index(created_at)
```

Các thao tác nên ghi audit:

- Login thất bại nhiều lần nếu có rate limit.
- Tạo/sửa/xóa menu item.
- Tạo/check-in/hủy reservation.
- Mở/đóng table session.
- Hủy order hoặc order item.
- Xác nhận thanh toán.
- Rebuild AI vector index.

---

## 18. Quan hệ chính

```text
areas 1 - n tables
menu_categories 1 - n menu_items
tables 1 - n reservations qua reservations.assigned_table_id
tables 1 - n table_sessions
reservations 0..1 - 1 table_sessions
users 1 - n table_sessions qua table_sessions.created_by
table_sessions 1 - n orders
orders 1 - n order_items
menu_items 1 - n order_items
table_sessions 1 - 0..1 invoices
users 1 - n invoices qua invoices.cashier_id
users 1 - n ai_chat_logs
users 1 - n audit_logs
```

---

## 19. Delete policy

MVP ưu tiên soft behavior thay vì xóa dữ liệu nghiệp vụ:

- User nghỉ việc: đặt `users.is_active = false`.
- Menu category ngừng dùng: đặt `menu_categories.is_active = false`.
- Món hết/ngừng bán: đặt `menu_items.is_available = false`.
- Bàn không dùng: đặt `tables.status = Inactive`.
- Order, invoice, reservation đã phát sinh không xóa vật lý trong flow thông thường.

---

## 20. Migration policy

- Mọi thay đổi schema phải có EF Core migration khi phần infrastructure đã sẵn sàng.
- Không sửa database thủ công nếu không ghi lại bằng migration hoặc script có version.
- Khi thêm cột mới cho bảng đã có dữ liệu, phải cân nhắc nullable/default/backfill.
- Không xóa hoặc đổi tên cột đang dùng nếu chưa có kế hoạch migration dữ liệu.
- PR có thay đổi DB phải ghi rõ phần `DB affected`.
- Migration không được chứa secret, connection string thật hoặc dữ liệu nhạy cảm.

---

## 21. Seed data tối thiểu

Seed data cho môi trường local/dev:

```text
roles:
- Manager
- Staff
- Kitchen
- Cashier

areas:
- Tầng 1
- Tầng 2

menu_categories:
- Khai vị
- Món chính
- Lẩu
- Đồ uống
```

User seed nếu có phải dùng password hash dev-only và không dùng password thật.

---

## 22. Checklist kiểm thử database schema

Khi thay đổi tài liệu schema:

```text
- Kiểm tra enum khớp docs/api-contract.md.
- Kiểm tra field request/response trong docs/api-contract.md có mapping sang bảng/cột.
- Kiểm tra quan hệ chính không mâu thuẫn với docs/architecture.md.
- Kiểm tra core flow: reservation -> table_session -> order -> order_items -> invoice.
- Kiểm tra các ràng buộc quan trọng: active session duy nhất, idempotency key, invoice duy nhất cho table session.
- Chạy git diff --check.
```

Khi đã có EF Core migration:

```text
dotnet build RestaurantOrderingSystem.sln
dotnet ef database update --project backend/restaurant-api/src/Restaurant.Infrastructure --startup-project backend/restaurant-api/src/Restaurant.Api
dotnet test backend/restaurant-api/tests/Restaurant.UnitTests/Restaurant.UnitTests.csproj
dotnet test backend/restaurant-api/tests/Restaurant.IntegrationTests/Restaurant.IntegrationTests.csproj
```
