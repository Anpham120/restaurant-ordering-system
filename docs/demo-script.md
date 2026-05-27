# Demo Script

## 1. Mục tiêu demo

Buổi demo cần làm rõ ba điểm mạnh chính của dự án:

```text
Realtime
AI RAG
DevOps
```

Ngoài ra, cần chứng minh hệ thống có luồng nghiệp vụ nhà hàng hoàn chỉnh:

```text
Đặt bàn
→ Check-in
→ QR Ordering
→ Kitchen realtime
→ Thanh toán
→ Dashboard
→ AI hỗ trợ
```

---

## 2. Chuẩn bị trước demo

### 2.1. Kiểm tra repository

Cần chuẩn bị:

- README.md
- docs đầy đủ
- GitHub Issues
- Pull Requests
- Branch `main`
- Branch `develop`
- Feature branches nếu cần minh họa

### 2.2. Kiểm tra môi trường

Chạy:

```powershell
docker compose -f infrastructure/docker-compose.local.yml up -d
docker ps
```

Kiểm tra backend:

```text
GET /health
```

Kiểm tra AI Service:

```text
GET /health
```

### 2.3. Dữ liệu demo

Cần có seed data:

- Tài khoản Manager
- Tài khoản Staff
- Tài khoản Kitchen
- Tài khoản Cashier
- Danh sách bàn
- Danh sách menu
- Một vài đặt bàn mẫu
- Knowledge base cho AI

---

## 3. Kịch bản demo tổng quan

```text
1. Giới thiệu bài toán
2. Giới thiệu kiến trúc
3. Trình bày GitHub workflow
4. Chạy hệ thống
5. Demo nghiệp vụ đặt bàn
6. Demo QR Ordering
7. Demo Kitchen realtime
8. Demo thanh toán
9. Demo dashboard
10. Demo AI RAG
11. Demo DevOps/CI/CD
12. Tổng kết và hướng phát triển
```

---

## 4. Demo GitHub Workflow

### Nội dung cần show

- GitHub Issues
- Labels
- Milestones
- Pull Requests
- Branches

### Câu trình bày gợi ý

```text
Nhóm sử dụng GitHub Issues để quản lý task. Mỗi issue tương ứng với một công việc cụ thể, có label, milestone và checklist. Thành viên tạo feature branch từ develop, code xong tạo Pull Request vào develop để review trước khi merge.
```

---

## 5. Demo kiến trúc

### Nội dung cần show

- README.md
- docs/architecture.md
- Cấu trúc thư mục
- RestaurantOrderingSystem.slnx
- Backend modules
- AI Service
- Docker Compose

### Câu trình bày gợi ý

```text
Hệ thống sử dụng kiến trúc Modular Monolith kết hợp AI RAG Service riêng. Backend chính được chia thành các module nghiệp vụ rõ ràng như Identity, Reservation, Ordering, Kitchen, Billing và Dashboard. AI Service được tách riêng để xử lý RAG bằng FastAPI.
```

---

## 6. Demo luồng đặt bàn

### Các bước

1. Mở Customer Web.
2. Vào trang đặt bàn.
3. Nhập thông tin khách.
4. Submit đặt bàn.
5. Hiển thị mã đặt bàn.

### Kết quả mong đợi

- Tạo reservation thành công.
- Reservation có trạng thái Pending hoặc Confirmed.
- Quản lý/nhân viên xem được reservation trong Admin Web.

---

## 7. Demo check-in

### Các bước

1. Đăng nhập Staff.
2. Mở danh sách đặt bàn.
3. Tìm reservation theo mã hoặc số điện thoại.
4. Chọn bàn.
5. Check-in.
6. Hệ thống tạo table session.
7. Hệ thống hiển thị QR order URL.

### Kết quả mong đợi

- Bàn chuyển sang Occupied.
- Table session được tạo.
- QR order token có thể dùng để gọi món.

---

## 8. Demo QR Ordering

### Các bước

1. Mở link QR Order.
2. Xem thông tin bàn.
3. Chọn món.
4. Thêm món vào cart.
5. Ghi chú món nếu cần.
6. Submit order.

### Kết quả mong đợi

- Order được tạo.
- Order item có trạng thái Pending.
- Kitchen nhận order realtime.

---

## 9. Demo Kitchen Realtime

### Các bước

1. Mở Kitchen Display.
2. Submit order từ Customer Web.
3. Quan sát order xuất hiện realtime ở Kitchen.
4. Bếp chuyển món: Pending → Preparing → Ready.
5. Staff và Customer nhận cập nhật.

### Kết quả mong đợi

- Không cần refresh trang.
- Trạng thái món thay đổi realtime.
- Dashboard có thể cập nhật số liệu.

### Điểm cần nhấn mạnh

```text
Realtime được triển khai bằng SignalR. Nếu kết nối realtime gặp lỗi, frontend có thể fallback bằng polling để không làm gián đoạn luồng nghiệp vụ.
```

---

## 10. Demo thanh toán

### Các bước

1. Đăng nhập Cashier.
2. Chọn bàn đang hoạt động.
3. Xem invoice preview.
4. Kiểm tra danh sách món và tổng tiền.
5. Chọn phương thức thanh toán.
6. Xác nhận thanh toán.

### Kết quả mong đợi

- Invoice được tạo.
- Table session đóng.
- Bàn chuyển về Available hoặc Cleaning.
- PaymentCompleted event được phát ra nếu có realtime dashboard.

---

## 11. Demo Dashboard

### Các bước

1. Đăng nhập Manager.
2. Mở Dashboard.
3. Xem doanh thu, số order, bàn đang hoạt động, món bán chạy.
4. Nếu có realtime, tạo order mới và quan sát dashboard cập nhật.

### Kết quả mong đợi

- Dashboard hiển thị dữ liệu tổng quan.
- Quản lý nắm được tình hình vận hành.

---

## 12. Demo AI RAG

### Demo 1: Tư vấn món

Câu hỏi:

```text
Đi 4 người khoảng 600k nên gọi gì?
```

Kết quả mong đợi:

- AI gợi ý món dựa trên menu.
- Có ước tính tổng tiền.
- Không bịa món ngoài knowledge base.

### Demo 2: Hỏi chính sách

Câu hỏi:

```text
Đặt bàn rồi đến muộn thì sao?
```

Kết quả mong đợi:

- AI trả lời dựa trên reservation_policy.md.

### Demo 3: Báo cáo quản lý

Câu hỏi:

```text
Hôm nay doanh thu thế nào và món nào bán chạy?
```

Kết quả mong đợi:

- AI sinh báo cáo dựa trên dữ liệu summary.
- Có nhận xét vận hành.

### Điểm cần nhấn mạnh

```text
AI không trả lời trực tiếp từ kiến thức chung của LLM. Hệ thống dùng RAG để truy xuất knowledge base gồm menu, thành phần món, chính sách và FAQ, sau đó mới sinh câu trả lời có căn cứ.
```

---

## 13. Demo DevOps

### Nội dung cần show

- Docker Compose
- Dockerfile
- GitHub Actions
- Health check
- Nginx nếu có
- Telegram deploy alert nếu có

### Lệnh demo local

```powershell
docker compose -f infrastructure/docker-compose.local.yml up -d
docker ps
```

### CI/CD demo

Show GitHub Actions:

```text
Pull Request vào develop
→ Build backend
→ Test backend
→ Build frontend
→ Validate AI service
```

### Câu trình bày gợi ý

```text
Nhóm sử dụng Docker Compose để chuẩn hóa môi trường chạy local, GitHub Actions để kiểm tra build/test khi tạo Pull Request, và health check để xác nhận service hoạt động sau khi deploy.
```

---

## 14. Kịch bản nếu có lỗi khi demo

### Nếu AI lỗi

Vẫn demo core flow:

```text
Đặt bàn → QR Order → Kitchen → Thanh toán
```

Giải thích:

```text
AI Service được tách riêng nên nếu AI lỗi, core flow gọi món và thanh toán vẫn hoạt động.
```

### Nếu SignalR lỗi

Dùng polling fallback hoặc refresh.

Giải thích:

```text
Realtime có fallback để đảm bảo nghiệp vụ không bị dừng.
```

### Nếu Docker lỗi

Chạy thủ công backend/frontend.

Giải thích:

```text
Docker dùng để chuẩn hóa môi trường, nhưng từng service vẫn có thể chạy độc lập trong môi trường development.
```

---

## 15. Kết luận demo

Nội dung kết luận:

```text
Hệ thống đã hoàn thiện luồng nghiệp vụ chính của nhà hàng, bao gồm đặt bàn, QR Ordering, xử lý bếp realtime, thanh toán và dashboard. Dự án tích hợp AI RAG để hỗ trợ tư vấn món và báo cáo quản lý, đồng thời áp dụng quy trình DevOps với Docker, GitHub Actions và health check để đảm bảo khả năng triển khai.
```

