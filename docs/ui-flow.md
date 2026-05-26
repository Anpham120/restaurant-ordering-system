# UI Flow

## 1. Mục đích

Tài liệu này mô tả luồng giao diện chính của hệ thống để frontend, backend và AI agent có cùng cách hiểu khi phát triển.

Frontend không chia theo backend module, mà chia theo trải nghiệm người dùng và nghiệp vụ.

---

## 2. Nhóm người dùng

Hệ thống có các nhóm người dùng chính:

```text
Customer
Staff
Kitchen
Cashier
Manager
```

Customer không bắt buộc đăng nhập trong MVP.

Các vai trò nội bộ cần đăng nhập:

```text
Staff
Kitchen
Cashier
Manager
```

---

## 3. Customer Web Flow

### 3.1. Luồng xem menu

```text
Home
→ Menu
→ Filter/Search
→ Dish Detail
```

Màn hình cần có:

- Danh mục món
- Danh sách món
- Tìm kiếm
- Lọc theo category/tag
- Trạng thái còn/hết món
- Chi tiết món

---

### 3.2. Luồng đặt bàn

```text
Home/Menu
→ Reservation Form
→ Submit Reservation
→ Reservation Confirmation
```

Form đặt bàn gồm:

- Họ tên
- Số điện thoại
- Số lượng khách
- Thời gian đặt
- Ghi chú

Sau khi đặt bàn thành công, hiển thị:

- Mã đặt bàn
- Trạng thái đặt bàn
- Thông tin thời gian
- Hướng dẫn đến nhà hàng/check-in

---

### 3.3. Luồng QR Ordering

```text
Scan QR
→ Load Table Session
→ Menu
→ Add to Cart
→ Review Cart
→ Submit Order
→ Order Status
```

Yêu cầu:

- Đọc `sessionToken` từ URL.
- Kiểm tra session còn hoạt động.
- Hiển thị số bàn.
- Cho phép thêm món vào giỏ.
- Cho phép ghi chú từng món.
- Chống submit trùng bằng `idempotencyKey`.

---

### 3.4. Luồng theo dõi trạng thái món

```text
Order Status
→ Pending
→ Preparing
→ Ready
→ Served
```

Màn hình cần cập nhật realtime bằng SignalR.

Nếu SignalR lỗi, dùng polling fallback.

---

### 3.5. Luồng AI tư vấn món

```text
Menu
→ AI Assistant
→ Ask Question
→ Receive RAG Answer
→ Add Suggested Items to Cart
```

Ví dụ câu hỏi:

```text
Đi 4 người khoảng 600k nên gọi gì?
Món nào không cay?
Có món chay không?
Có món nào phù hợp trẻ em không?
```

---

## 4. Admin Web Flow

Admin Web dùng cho Staff, Kitchen, Cashier, Manager.

---

## 5. Login Flow

```text
Login Page
→ Submit email/password
→ Backend returns JWT
→ Store token
→ Redirect by role
```

Role redirect:

```text
Manager → Dashboard
Staff → Table Map
Kitchen → Kitchen Display
Cashier → Cashier Page
```

---

## 6. Staff Flow

### 6.1. Sơ đồ bàn

```text
Login
→ Table Map
→ Select Area
→ Select Table
→ View Table Status
```

Trạng thái bàn:

```text
Available
Reserved
Occupied
Cleaning
Inactive
```

### 6.2. Check-in đặt bàn

```text
Reservation List
→ Search Reservation
→ View Detail
→ Assign Table
→ Check-in
→ Create Table Session
→ Show QR Order URL
```

Yêu cầu:

- Tìm theo mã đặt bàn hoặc số điện thoại.
- Không cho check-in vào bàn đang occupied.
- Sau check-in, bàn chuyển trạng thái occupied.

---

## 7. Kitchen Flow

```text
Login as Kitchen
→ Kitchen Display
→ View Pending Items
→ Mark Preparing
→ Mark Ready
```

Màn hình Kitchen Display nên dùng dạng Kanban:

```text
Pending | Preparing | Ready
```

Mỗi item hiển thị:

- Mã order
- Số bàn
- Tên món
- Số lượng
- Ghi chú
- Thời gian chờ

Realtime events:

```text
NewOrderCreated
OrderItemUpdated
```

---

## 8. Staff Serving Flow

```text
Ready Items
→ Select Item
→ Mark Served
→ Customer status updated
```

Nhân viên nhận thông báo khi bếp chuyển món sang Ready.

---

## 9. Cashier Flow

```text
Login as Cashier
→ Active Tables
→ Select Table Session
→ Invoice Preview
→ Confirm Payment
→ Close Table Session
→ Table Available
```

Hóa đơn hiển thị:

- Danh sách món
- Số lượng
- Đơn giá
- Thành tiền
- Tổng tiền
- Phương thức thanh toán

MVP hỗ trợ:

```text
Cash
BankTransfer
```

Không tích hợp payment gateway trong MVP.

---

## 10. Manager Flow

```text
Login as Manager
→ Dashboard
→ Revenue Overview
→ Top Items
→ Active Tables
→ AI Report
```

Dashboard cần có:

- Doanh thu hôm nay
- Số order hôm nay
- Bàn đang phục vụ
- Số món đang chờ bếp
- Món bán chạy
- Biểu đồ order theo giờ

---

## 11. AI Manager Report Flow

```text
Dashboard
→ Generate Daily Report
→ Backend sends summary to AI Service
→ AI RAG generates report
→ Display result
```

AI report nên gồm:

- Tổng quan doanh thu
- Món bán chạy
- Khung giờ đông
- Gợi ý vận hành
- Cảnh báo nếu dữ liệu bất thường

---

## 12. Trang lỗi và fallback

Frontend cần có:

- Loading state
- Empty state
- Error state
- Unauthorized page
- Not found page
- Realtime disconnected warning

---

## 13. Nguyên tắc frontend

- UI bám theo `docs/api-contract.md`.
- Nếu backend chưa có, dùng mock data giống contract.
- Không hardcode API URL.
- Dùng `.env` cho base URL.
- Không gọi trực tiếp LLM provider.
- Realtime screen phải có fallback.

