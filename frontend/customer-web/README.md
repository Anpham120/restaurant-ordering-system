# 📱 Ứng Dụng Customer Web (Khách Hàng)

Chào mừng bạn đến với phân hệ **Customer Web** dành cho khách hàng trong **Hệ thống Quản lý Đặt bàn & Gọi món Nhà hàng**. Đây là ứng dụng dạng Single Page Application (SPA) viết bằng **React 19 + TypeScript + Vite**, sử dụng hệ thống **Vanilla CSS** tùy biến cao cấp cho giao diện sang trọng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core**: React 19 (TypeScript), Vite.
- **Styling**: Vanilla CSS thiết kế theo mô hình Glassmorphism hiện đại, tông màu chủ đạo tối Obsidian kết hợp gradient vàng/cam ấm nóng (phù hợp với lĩnh vực ẩm thực).
- **Icons**: `lucide-react` cao cấp, tối giản.
- **Trình giả lập**: Giả lập toàn bộ API Contract (theo `docs/api-contract.md`) và cơ chế SignalR thời gian thực.

---

## 🚀 Luồng Nghiệp Vụ Đã Thực Hiện

Ứng dụng đáp ứng trọn vẹn 5 luồng trải nghiệm khách hàng chính được mô tả trong [ui-flow.md](../docs/ui-flow.md):

1. **Xem Menu (`Luồng xem menu`)**:
   - Giao diện lưới món ăn kèm hình ảnh emoji đại diện sinh động.
   - Thanh tìm kiếm thời gian thực theo tên món hoặc từ khóa/tag.
   - Bộ lọc phân loại danh mục (Tất cả, Khai vị, Món chính, Lẩu, Đồ uống, Tráng miệng).
   - Chi tiết món ăn dưới dạng Modal trượt cùng với tag trạng thái Còn/Hết món rõ ràng.

2. **Đặt Bàn Trực Tuyến (`Luồng đặt bàn`)**:
   - Form thông tin khách hàng: Họ tên, Số điện thoại, Số lượng khách, Giờ nhận bàn, Ghi chú.
   - Giao diện **Hóa đơn Đặt bàn** sang trọng khi thành công, chứa mã đặt bàn động (ví dụ: `RSV-20260526-083`), thông tin cá nhân và hướng dẫn check-in chi tiết tại nhà hàng.

3. **QR Ordering / Table Session (`Luồng QR Ordering`)**:
   - Đọc tự động `sessionToken` từ URL dạng tham số truy vấn (`?sessionToken=...`).
   - Cung cấp thanh **Giả lập Quét Mã QR tại Bàn** ở đầu trang để hỗ trợ kiểm thử tiện lợi.
   - Khi có session hoạt động, hiển thị số bàn và kích hoạt giỏ hàng cùng với ghi chú riêng biệt cho từng món ăn ("ít cay", "không hành").

4. **Theo Dõi Trạng Thái Món Ăn (`Luồng theo dõi trạng thái`)**:
   - Hiển thị tiến trình đơn hàng 4 bước rõ ràng: `Pending` -> `Preparing` -> `Ready` -> `Served`.
   - **Tích hợp bộ giả lập SignalR**: Tự động chuyển đổi trạng thái món ăn mỗi 12 giây để mô phỏng chính xác sự cập nhật từ bếp, giúp buổi demo diễn ra trơn tru.

5. **Trợ Lý Khẩu Vị AI (`Luồng AI tư vấn món`)**:
   - Cửa sổ chat AI phong cách tương lai cùng với các câu hỏi gợi ý nhanh.
   - Thực hiện RAG trả lời theo dữ liệu thực đơn với các nguồn dẫn chứng rõ ràng.
   - **Chức năng đột phá**: Nút *"Thêm combo đề xuất vào giỏ hàng"* từ câu trả lời của AI cho phép đưa trực tiếp các món AI gợi ý vào giỏ hàng thực của khách hàng chỉ sau 1 cú nhấp chuột.

---

## 🎯 Hướng Dẫn Chạy Dự Án (Local Development)

### 1. Cài đặt Dependencies
Di chuyển vào thư mục dự án và cài đặt:
```bash
cd frontend/customer-web
npm install
```

### 2. Chạy Dev Server
```bash
npm run dev
```
Truy cập ứng dụng tại URL mặc định: `http://localhost:5173/`

### 3. Build Production
```bash
npm run build
```

---

## 🧪 Hướng Dẫn Kiểm Thử (Testing Guide)

Vui lòng làm theo kịch bản kiểm thử sau để trải nghiệm đầy đủ tính năng:

### Bước 1: Trải nghiệm Trang Chủ & Đặt Bàn
1. Mở trình duyệt truy cập `http://localhost:5173/`.
2. Đọc lướt qua Banner chào mừng sang trọng của **Antigravity Bistro**.
3. Nhấp vào nút **Đặt Bàn Ngay** trên tab điều hướng chân trang (hoặc trên banner chính).
4. Điền đầy đủ thông tin: Họ tên, số điện thoại, số khách đi, giờ hẹn đặt bàn và một vài dòng ghi chú (ví dụ: *"Cần bàn gần cửa kính"*).
5. Nhấp **Hoàn Tất Đặt Bàn**. Hệ thống sẽ hiển thị phiếu xác nhận đặt bàn rất đẹp cùng mã đặt bàn động `RSV-...` và QR Code check-in.

### Bước 2: Giả Lập Quét Mã QR & Gọi Món
1. Nhấp vào nút **Quét Mã QR Bàn A01** trên thanh giả lập màu cam ở đầu trang.
2. Trình duyệt sẽ tự động cập nhật URL thành `?sessionToken=secure-qr-session-token-...` và bạn sẽ thấy nhãn **📍 Bàn A01** hiển thị trên thanh header.
3. Di chuyển đến tab **Thực Đơn**. Bạn sẽ thấy bộ lọc danh mục và thanh tìm kiếm. Thử tìm từ khóa *"Lẩu"* hoặc *"Cam"*.
4. Nhấp vào một món ăn (ví dụ: **Lẩu Thái Hải Sản Tinh Hoa**).
5. Trong Modal chi tiết, nhập ghi chú *"Ít cay, lấy thêm thìa"* và chọn số lượng `1`. Nhấp **Thêm Vào Giỏ Hàng**.
6. Một nút giỏ hàng nổi màu cam sẽ xuất hiện ở góc dưới bên phải. Nhấp vào để mở Drawer xem giỏ hàng.
7. Nhấp vào nút **Gửi Yêu Cầu Xuống Bếp (QR Order)**.

### Bước 3: Theo Dõi Trạng Thái Realtime
1. Sau khi đặt hàng thành công, ứng dụng sẽ tự động chuyển sang tab **Đơn Hàng**.
2. Bạn sẽ thấy mã đơn hàng `ORD-...` và tiến trình trạng thái món ăn đang dừng ở bước 1: **Gửi Đơn & Chờ Nhận**.
3. Hãy chờ khoảng 12 giây, bạn sẽ thấy trạng thái tự động đổi sang **Đang Chuẩn Bị (Preparing)** với hiệu ứng nhấp nháy, mô phỏng SignalR đẩy sự kiện từ bếp.
4. Trạng thái sẽ tiếp tục cập nhật sang **Đã Sẵn Sàng (Ready)** và cuối cùng là **Đã Phục Vụ (Served)**.

### Bước 4: Tương Tác Trợ Lý Khẩu Vị AI
1. Chuyển sang tab **Trợ Lý AI** ở góc dưới cùng bên phải.
2. Nhấp vào một gợi ý nhanh bên trên ô chat, ví dụ: **Combo 4 người 600k?**.
3. Trợ lý AI sẽ lập tức phân tích và đưa ra phản hồi tiếng Việt chi tiết kèm nguồn dẫn `menu.md`, đồng thời xuất hiện một nút *"Thêm Combo 4 Người Đề Xuất (602k) Vào Giỏ Hàng"*.
4. Nhấp vào nút đề xuất đó, bạn sẽ thấy giỏ hàng tự động mở ra và chứa đúng 4 món ăn (Lẩu, gà chiên, gỏi cuốn, trà đào) với ghi chú thích hợp!
5. Gửi câu hỏi khác như *"Món nào cho trẻ em không cay?"* và xem AI phân tích thực đơn thực tế.
## Cau hinh realtime backend

Khi backend `Restaurant.Api` dang chay, cau hinh bien moi truong cho Vite:

```bash
VITE_API_BASE_URL=https://localhost:<backend-port>
```

Customer Web se gui order qua `POST /api/v1/orders`, ket noi SignalR hub `/hubs/restaurant` bang `sessionToken`, nghe `OrderItemPreparing`, `OrderItemReady`, `OrderItemServed`, va fallback polling `GET /api/v1/orders/{id}?sessionToken=...` khi SignalR chua ket noi.

Neu khong cau hinh `VITE_API_BASE_URL`, app tiep tuc chay che do demo va tu mo phong trang thai order.
