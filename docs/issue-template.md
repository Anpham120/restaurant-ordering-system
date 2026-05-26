# Issue Template

## 1. Mục đích

File này định nghĩa mẫu issue chuẩn cho dự án.

Mọi issue nên đủ rõ để thành viên hoặc AI coding agent có thể hiểu:

- Cần làm gì
- Làm ở đâu
- Không được sửa gì
- API/DB nào liên quan
- Khi nào được coi là hoàn thành

---

## 2. Mẫu issue chuẩn

```markdown
## Mục tiêu

Mô tả ngắn gọn mục tiêu của issue.

## Bối cảnh

Issue này thuộc luồng nào của hệ thống?

Ví dụ:
Khách đặt bàn → Staff check-in → Tạo table session → QR order → Kitchen realtime.

## Phạm vi thực hiện

Mô tả phạm vi công việc.

## Được phép sửa

- path/to/allowed-folder
- path/to/allowed-file

## Không được sửa

- path/to/restricted-folder
- path/to/restricted-file

## API liên quan

- METHOD /api/v1/...

## Database liên quan

- table_1
- table_2

## Yêu cầu chi tiết

- [ ] Yêu cầu 1
- [ ] Yêu cầu 2
- [ ] Yêu cầu 3

## Acceptance Criteria

- [ ] Điều kiện nghiệm thu 1
- [ ] Điều kiện nghiệm thu 2
- [ ] Điều kiện nghiệm thu 3

## Cách kiểm thử

1. Bước test 1
2. Bước test 2
3. Kết quả mong đợi

## Definition of Done

- [ ] Build pass
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Không phá API contract
- [ ] Không phá DB schema
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop
```

---

## 3. Issue mẫu: Backend

```markdown
# [BE] Xây dựng Login API

## Mục tiêu

Xây dựng API đăng nhập cho hệ thống nội bộ.

## Bối cảnh

Login là bước đầu tiên để Staff, Kitchen, Cashier và Manager truy cập hệ thống.

## Phạm vi thực hiện

Tạo endpoint đăng nhập, kiểm tra email/password và trả JWT token.

## Được phép sửa

- backend/restaurant-api/src/Restaurant.Api/Modules/Identity
- backend/restaurant-api/src/Restaurant.Application
- backend/restaurant-api/src/Restaurant.Domain
- backend/restaurant-api/src/Restaurant.Infrastructure
- docs/api-contract.md nếu cần

## Không được sửa

- frontend/*
- services/ai-service/*
- infrastructure/*

## API liên quan

- POST /api/v1/auth/login
- GET /api/v1/auth/me

## Database liên quan

- users

## Yêu cầu chi tiết

- [ ] Tạo Login request/response DTO
- [ ] Kiểm tra email/password
- [ ] Hash password
- [ ] Sinh JWT token
- [ ] Trả role trong response
- [ ] Thêm Swagger Bearer auth nếu cần

## Acceptance Criteria

- [ ] Login đúng trả accessToken
- [ ] Sai mật khẩu trả lỗi phù hợp
- [ ] Token có role
- [ ] Không hardcode JWT secret

## Cách kiểm thử

1. Chạy backend
2. Mở Swagger
3. Gọi POST /api/v1/auth/login
4. Kiểm tra response có accessToken

## Definition of Done

- [ ] Build pass
- [ ] Không commit secret
- [ ] API contract đã cập nhật nếu có thay đổi
- [ ] Tạo Pull Request vào develop
```

---

## 4. Issue mẫu: Frontend

```markdown
# [FE] Xây dựng trang QR Order

## Mục tiêu

Xây dựng màn hình gọi món bằng QR cho khách hàng.

## Bối cảnh

Khách sau khi check-in sẽ quét QR tại bàn để gọi món.

## Phạm vi thực hiện

Tạo UI đọc sessionToken từ URL, hiển thị menu, cart và gửi order.

## Được phép sửa

- frontend/customer-web

## Không được sửa

- backend/*
- services/ai-service/*
- infrastructure/*

## API liên quan

- GET /api/v1/table-sessions/by-token/{token}
- GET /api/v1/menu
- POST /api/v1/orders

## Database liên quan

Không sửa trực tiếp database.

## Yêu cầu chi tiết

- [ ] Đọc sessionToken từ URL
- [ ] Hiển thị thông tin bàn
- [ ] Hiển thị menu
- [ ] Thêm món vào cart
- [ ] Ghi chú từng món
- [ ] Gửi order
- [ ] Chống double submit bằng idempotencyKey

## Acceptance Criteria

- [ ] Trang chạy được bằng mock data
- [ ] UI đúng flow
- [ ] Request gửi đúng API contract
- [ ] Có loading/error/empty state

## Cách kiểm thử

1. Chạy frontend
2. Mở URL /qr-order/demo-token
3. Thêm món vào cart
4. Submit order bằng mock hoặc API thật

## Definition of Done

- [ ] Build pass
- [ ] Không hardcode API URL
- [ ] Không gọi trực tiếp AI provider
- [ ] Tạo Pull Request vào develop
```

---

## 5. Issue mẫu: AI

```markdown
# [AI] Xây dựng API menu-chat dùng RAG

## Mục tiêu

Xây dựng API hỏi đáp menu sử dụng RAG.

## Bối cảnh

Khách hàng cần hỏi AI về món ăn, ngân sách, khẩu vị và chính sách nhà hàng.

## Phạm vi thực hiện

Xây dựng endpoint nhận câu hỏi, truy xuất knowledge base và trả lời có căn cứ.

## Được phép sửa

- services/ai-service/app
- services/ai-service/knowledge_base
- docs/api-contract.md nếu cần

## Không được sửa

- backend/*
- frontend/*
- infrastructure/*

## API liên quan

- POST /api/v1/ai/menu-chat

## Database liên quan

Không sửa database chính.

## Yêu cầu chi tiết

- [ ] Load knowledge base
- [ ] Split documents
- [ ] Build embeddings
- [ ] Search top-k documents
- [ ] Build prompt với context
- [ ] Trả answer và sources

## Acceptance Criteria

- [ ] Câu hỏi về món ăn trả lời dựa trên knowledge base
- [ ] Câu hỏi không có dữ liệu thì không bịa
- [ ] Response có sources
- [ ] Có health endpoint

## Cách kiểm thử

1. Chạy AI Service
2. Gọi POST /api/v1/ai/menu-chat
3. Kiểm tra answer và sources

## Definition of Done

- [ ] Service chạy local
- [ ] Không hardcode API key
- [ ] Có fallback khi LLM lỗi
- [ ] Tạo Pull Request vào develop
```

---

## 6. Labels đề xuất

```text
backend
frontend
ai
devops
docs
realtime
bug
enhancement
priority-high
priority-medium
priority-low
```

---

## 7. Milestones đề xuất

```text
Sprint 1 - Foundation
Sprint 2 - Core Restaurant Flow
Sprint 3 - Realtime & AI
Sprint 4 - DevOps & Demo
```

