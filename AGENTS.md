# AGENTS.md - Hướng Dẫn Phát Triển Dành Cho AI Coding Agent

Tài liệu này đóng vai trò là kim chỉ nam và quy chuẩn làm việc dành riêng cho các AI Coding Agent (như Claude Code, Cursor, Copilot, Antigravity) khi tham gia xây dựng và bảo trì dự án **Hệ Thống Đặt Món & Đặt Bàn Nhà Hàng (Restaurant Ordering System)**.

---

## 🎯 1. Mục Tiêu & Phạm Vi Thực Hiện

### Mục Tiêu Chính
* **Khởi tạo và Phát triển ứng dụng Customer Web** dành cho khách hàng gọi món tại bàn, đặt bàn trước trực tuyến, và giao tiếp với trợ lý AI.
* **Khởi tạo và Phát triển ứng dụng Admin Web** dành cho nhân viên phục vụ, bếp, thu ngân và quản lý nhà hàng (sơ đồ bàn, check-in, quản lý bếp Kanban, AI Report).
* **Đảm bảo tính thẩm mỹ cực cao (Premium Aesthetics)**: Bám sát tuyệt đối chỉ dẫn trong `DESIGN.md` tại thư mục gốc để xây dựng giao diện chuẩn thương hiệu cao cấp (phong cách Starbucks: tông màu xanh lục đất nhã nhặn, canvas kem ấm, typographic tinh tế, và các micro-interaction mượt mà, kết hợp đổ bóng và bo góc tròn `12px` tinh tế).

### Phạm Vi Thực Hiện
* **Thư mục chịu trách nhiệm**: 
  1. `frontend/customer-web` (Customer Web)
  2. `frontend/admin-web` (Admin Web)
* **Vai Trò Phụ Trách**: **Frontend Full-Client Developer** (Chuyên gia tối ưu hóa trải nghiệm khách hàng và quản lý).

---

## 📋 2. Quy Trình Thực Hiện Chi Tiết (Workflow)

Trước khi thực hiện bất kỳ thay đổi nào về mã nguồn, Agent **bắt buộc** phải thực hiện các bước sau:

1. 📂 **Đọc Tài Liệu Nghiệp Vụ**:
   * Đọc [docs/agent-briefing.md](file:///d:/cmc/Restaurant_order_system/restaurant-ordering-system/docs/agent-briefing.md) đầu tiên để hiểu rõ toàn cảnh hệ thống, các luồng đi của luồng gọi món tại bàn (QR Code) và đặt bàn trước.
2. 🔌 **Kiểm Tra Hợp Đồng API**:
   * Nếu tính năng có liên quan đến việc tương tác dữ liệu, bắt buộc kiểm tra [docs/api-contract.md](file:///d:/cmc/Restaurant_order_system/restaurant-ordering-system/docs/api-contract.md) để đảm bảo tuân thủ đúng định dạng Request/Response.
3. 🗄️ **Kiểm Tra Cấu Trúc Database**:
   * Nếu có thao tác lưu trữ dữ liệu hoặc đồng bộ dữ liệu, kiểm tra [docs/db-schema.md](file:///d:/cmc/Restaurant_order_system/restaurant-ordering-system/docs/db-schema.md).
4. 🎨 **Thiết Kế & Trải Nghiệm Giao Diện**:
   * Tham chiếu cấu trúc UI tại [docs/ui-flow.md](file:///d:/cmc/Restaurant_order_system/restaurant-ordering-system/docs/ui-flow.md) và bám sát triết lý thiết kế trong [DESIGN.md](file:///d:/cmc/Restaurant_order_system/restaurant-ordering-system/DESIGN.md) (màu sắc, spacing, component rules).

---

## ⚙️ 3. Quy Chuẩn Kỹ Thuật & Môi Trường Chạy

### Cấu Trúc Kỹ Thuật Chung (Cả Customer-Web & Admin-Web)
* **Ngôn Ngữ & Thư Viện**: React 19, TypeScript, Vite.
* **Styling**: Sử dụng CSS thuần chất lượng cao (Vanilla CSS) đặt trong `src/index.css` và `src/App.css`. 
  > [!WARNING]
  > Tuyệt đối không tự ý cài đặt hoặc sử dụng TailwindCSS trừ khi có yêu cầu đặc biệt từ người dùng.
* **Icons**: Sử dụng thư viện `lucide-react` để hiển thị các biểu tượng trực quan.

### Các Lệnh CLI Hữu Dụng (Thực hiện tại thư mục tương ứng)

#### Cho Customer Web (`frontend/customer-web`)
* **Chạy Dev Server**: `npm run dev` (Khởi chạy môi trường phát triển cục bộ tại `http://localhost:5173`).
* **Biên dịch sản phẩm**: `npm run build` (Chạy lệnh `tsc -b && vite build` để kiểm tra toàn bộ lỗi biên dịch và kiểu dữ liệu trước khi bàn giao).
* **Kiểm tra cú pháp**: `npm run lint` để tối ưu hóa code sạch.

#### Cho Admin Web (`frontend/admin-web`)
* **Chạy Dev Server**: `npm run dev` (Khởi chạy môi trường phát triển cục bộ tại `http://localhost:5173` hoặc cổng khả dụng khác).
* **Biên dịch sản phẩm**: `npm run build` (Chạy lệnh `tsc -b && vite build` để kiểm tra lỗi kiểu dữ liệu trước khi bàn giao).
* **Kiểm tra cú pháp**: `npm run lint` để tối ưu hóa code sạch.

---

## ✅ 4. Tiêu Chuẩn Hoàn Thành (Acceptance Criteria & Definition of Done)

### Tiêu Chí Chấp Nhận (Acceptance Criteria)
* [ ] **Hoàn thành đúng phạm vi issue**: Chỉ sửa đổi và tối ưu các file trong phạm vi được giao (`frontend/customer-web` và `frontend/admin-web`).
* [ ] **Không chỉnh sửa file ngoài phạm vi**: Hạn chế tối đa chỉnh sửa các tệp thuộc `backend/` hay `infrastructure/` nếu không thực sự cần thiết hoặc không được yêu cầu.
* [ ] **Bảo vệ hợp đồng dữ liệu**: Tuyệt đối không phá vỡ API contract hoặc DB schema đã được định nghĩa sẵn trong tài liệu docs.
* [ ] **Kiểm thử trực quan đầy đủ**: Sử dụng browser hoặc chạy build thử nghiệm để đảm bảo không lỗi bố cục hiển thị.

### Định Nghĩa Hoàn Thành (Definition of Done)
* [ ] **Build Pass**: Cả hai dự án chạy build (`npm run build`) thành công 100% không có lỗi TypeScript hay lỗi cú pháp đóng gói.
* [ ] **Không rò rỉ thông tin mật**: Không commit bất kỳ token, password, connection string hay credentials nào lên git.
* [ ] **Cập nhật tài liệu**: Nếu có thay đổi, bổ sung hoặc tối ưu hóa về API/DB/UI/DevOps, bắt buộc cập nhật lại các file tài liệu tương ứng trong thư mục `docs/`.
* [ ] **Bàn Giao Sạch Sẽ**: Đảm bảo toàn bộ thay đổi đã sẵn sàng để tạo Pull Request vào nhánh `develop`.

---

## 🧪 5. Hướng Dẫn Kiểm Thử & Xác Minh (Test Guidelines)

### Kiểm Thử Biên Dịch (Compilation Test)
Mỗi lần sửa code xong, chạy lệnh build tại thư mục tương ứng để xác minh kiểu dữ liệu:
```powershell
# Ví dụ đối với Admin Web
cd frontend/admin-web
npm run build
```

### Kiểm Thử Trải Nghiệm Giao Diện (Visual & Interactive Test)

#### 1. Khách Hàng (Customer Web)
* **Giao diện Menu**: Kiểm tra các tab danh mục món ăn hoạt động mượt mà.
* **Tùy chọn chi tiết (PDP Modal)**: Nhấp chọn một món uống để kiểm tra bộ chọn kích cỡ (S/M/L/XL), các nút chọn độ ngọt/nhiệt độ, và steppers topping hoạt động đúng nghiệp vụ tính toán giá.
* **Giỏ Hàng**: Kiểm tra nút giỏ hàng nổi xuất hiện đúng số lượng và hiển thị chi tiết các tùy chọn cấu hình món ăn đã chọn.
* **Đặt bàn**: Kiểm tra phiếu đặt chỗ hóa đơn trắng đạt độ tương phản cao, dễ đọc trên mọi thiết bị.

#### 2. Quản Trị (Admin Web)
* **Sơ đồ bàn phục vụ**: Kiểm tra tính năng lọc khu vực bàn, tính năng mở phiên, chuyển dọn dẹp, và nút chuyển sang bảo trì (Wrench icon) hoạt động chính xác.
* **Tìm Kiếm & Check-in Đặt Chỗ**: Thử nghiệm tìm kiếm khách hàng bằng Tên/SĐT, chọn bàn trống và check-in trực quan.
* **Độ tương thích thiết bị**: Co giãn kích thước trình duyệt hoặc sử dụng DevTools Device Toolbar để kiểm định giao diện đáp ứng hoàn hảo trên Desktop, Tablet và Mobile.
