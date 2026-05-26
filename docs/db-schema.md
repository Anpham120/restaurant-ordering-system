# Database Schema

## 1. Tổng quan

Cơ sở dữ liệu chính sử dụng PostgreSQL.

Trong giai đoạn MVP, hệ thống dùng một database tập trung cho backend Modular Monolith.

Database name:

```text
restaurant_ordering
```

---

## 2. Danh sách bảng chính

```text
users
roles
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

## 3. Bảng users

Lưu thông tin tài khoản hệ thống.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| full_name | varchar(255) | Họ tên |
| email | varchar(255) | Unique |
| password_hash | text | Mật khẩu đã hash |
| role | varchar(50) | Manager, Staff, Kitchen, Cashier |
| is_active | boolean | Trạng thái hoạt động |
| created_at | timestamp | Ngày tạo |
| updated_at | timestamp | Ngày cập nhật |

---

## 4. Bảng areas

Khu vực bàn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| name | varchar(100) | Tên khu vực |
| description | text | Mô tả |
| created_at | timestamp | Ngày tạo |

---

## 5. Bảng tables

Danh sách bàn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| area_id | uuid | FK → areas.id |
| table_number | varchar(50) | Mã bàn |
| capacity | int | Sức chứa |
| status | varchar(50) | Available, Reserved, Occupied, Cleaning, Inactive |
| created_at | timestamp | Ngày tạo |
| updated_at | timestamp | Ngày cập nhật |

Ràng buộc:

```text
unique(area_id, table_number)
```

---

## 6. Bảng menu_categories

Danh mục món ăn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| name | varchar(100) | Tên danh mục |
| description | text | Mô tả |
| display_order | int | Thứ tự hiển thị |
| is_active | boolean | Trạng thái |

---

## 7. Bảng menu_items

Món ăn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| category_id | uuid | FK → menu_categories.id |
| name | varchar(255) | Tên món |
| description | text | Mô tả |
| price | decimal(18,2) | Giá |
| image_url | text | Ảnh |
| tags | text | Danh sách tag |
| is_available | boolean | Còn món hay không |
| created_at | timestamp | Ngày tạo |
| updated_at | timestamp | Ngày cập nhật |

---

## 8. Bảng reservations

Thông tin đặt bàn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| reservation_code | varchar(50) | Mã đặt bàn |
| customer_name | varchar(255) | Tên khách |
| phone | varchar(20) | Số điện thoại |
| guest_count | int | Số khách |
| reservation_time | timestamp | Thời gian đặt |
| note | text | Ghi chú |
| status | varchar(50) | Pending, Confirmed, Cancelled, CheckedIn, NoShow |
| assigned_table_id | uuid | FK → tables.id, nullable |
| created_at | timestamp | Ngày tạo |
| updated_at | timestamp | Ngày cập nhật |

---

## 9. Bảng table_sessions

Phiên sử dụng bàn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| table_id | uuid | FK → tables.id |
| reservation_id | uuid | FK → reservations.id, nullable |
| session_token | varchar(255) | Token QR |
| status | varchar(50) | Active, Closed, Cancelled |
| opened_at | timestamp | Thời gian mở |
| closed_at | timestamp | Thời gian đóng |
| created_by | uuid | FK → users.id |

Ràng buộc:

```text
Một bàn chỉ có tối đa một active session tại cùng thời điểm.
session_token phải khó đoán và unique.
```

---

## 10. Bảng orders

Đơn gọi món.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| table_session_id | uuid | FK → table_sessions.id |
| order_code | varchar(50) | Mã order |
| idempotency_key | varchar(255) | Chống double submit |
| status | varchar(50) | Pending, Processing, Completed, Cancelled |
| created_at | timestamp | Ngày tạo |

Ràng buộc:

```text
unique(table_session_id, idempotency_key)
```

---

## 11. Bảng order_items

Chi tiết món trong order.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| order_id | uuid | FK → orders.id |
| menu_item_id | uuid | FK → menu_items.id |
| menu_item_name | varchar(255) | Snapshot tên món |
| unit_price | decimal(18,2) | Snapshot giá |
| quantity | int | Số lượng |
| note | text | Ghi chú |
| status | varchar(50) | Pending, Preparing, Ready, Served, Cancelled |
| started_at | timestamp | Bắt đầu làm |
| ready_at | timestamp | Sẵn sàng |
| served_at | timestamp | Đã phục vụ |
| created_at | timestamp | Ngày tạo |

Lưu ý:

```text
menu_item_name và unit_price là snapshot để hóa đơn không bị thay đổi nếu menu cập nhật giá sau đó.
```

---

## 12. Bảng invoices

Hóa đơn.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| table_session_id | uuid | FK → table_sessions.id |
| invoice_code | varchar(50) | Mã hóa đơn |
| subtotal | decimal(18,2) | Tạm tính |
| discount | decimal(18,2) | Giảm giá |
| total_amount | decimal(18,2) | Tổng tiền |
| payment_method | varchar(50) | Cash, BankTransfer |
| payment_status | varchar(50) | Paid, Unpaid |
| paid_at | timestamp | Thời gian thanh toán |
| cashier_id | uuid | FK → users.id |

---

## 13. Bảng ai_chat_logs

Lưu lịch sử hỏi AI.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id, nullable |
| session_id | varchar(255) | Session chat |
| question | text | Câu hỏi |
| answer | text | Câu trả lời |
| sources | text | Tài liệu tham chiếu |
| created_at | timestamp | Ngày tạo |

---

## 14. Bảng audit_logs

Lưu lịch sử thao tác quan trọng.

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id, nullable |
| action | varchar(255) | Hành động |
| entity_name | varchar(255) | Tên entity |
| entity_id | uuid | ID entity |
| old_value | text | Giá trị cũ |
| new_value | text | Giá trị mới |
| created_at | timestamp | Thời gian |

---

## 15. Quan hệ chính

```text
areas 1 - n tables
menu_categories 1 - n menu_items
reservations 0..1 - 1 table_sessions
tables 1 - n table_sessions
table_sessions 1 - n orders
orders 1 - n order_items
table_sessions 1 - 0..1 invoices
users 1 - n invoices
users 1 - n audit_logs
```

---

## 16. Quy tắc migration

- Mọi thay đổi schema phải tạo migration.
- Không sửa database thủ công nếu không ghi lại.
- Khi thêm cột mới cần cân nhắc giá trị nullable/default.
- Không xóa cột đang dùng nếu chưa có migration chuyển đổi dữ liệu.
- PR có thay đổi DB phải ghi rõ trong phần `DB affected`.

---

## 17. Chuẩn hóa dữ liệu

Database thiết kế theo hướng 3NF:

- Không lưu dữ liệu lặp không cần thiết.
- Mỗi bảng đại diện một thực thể rõ ràng.
- Các thuộc tính phụ thuộc vào khóa chính.
- Dữ liệu snapshot chỉ dùng khi cần bảo toàn lịch sử nghiệp vụ, ví dụ `menu_item_name` và `unit_price` trong `order_items`.

