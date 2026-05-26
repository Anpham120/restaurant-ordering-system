
# Agent Briefing

## 1. Mục đích

Tài liệu này là hướng dẫn bắt buộc cho tất cả thành viên và AI coding agent trước khi tham gia phát triển dự án **Hệ thống quản lý đặt bàn và gọi món nhà hàng**.

Mọi task, issue, pull request và thay đổi mã nguồn phải tuân thủ tài liệu này để tránh lệch kiến trúc, lệch API contract, lệch database schema hoặc phá vỡ luồng nghiệp vụ chính.

---

## 2. Kiến trúc chốt

Dự án sử dụng kiến trúc:

```text
Modular Monolith + AI RAG Service riêng
```

Không triển khai full microservices trong giai đoạn MVP.

Backend chính là một ứng dụng ASP.NET Core duy nhất, được chia thành nhiều module nghiệp vụ rõ ràng. AI Service được tách riêng bằng FastAPI để xử lý RAG.

---

## 3. Các thành phần chính

```text
Frontend
├── Customer Web
└── Admin Web

Backend
└── Restaurant.Api - ASP.NET Core Modular Monolith

AI
└── AI Service - FastAPI + RAG

Infrastructure
├── PostgreSQL
├── Redis
├── Docker Compose
├── Nginx
└── GitHub Actions
```

---

## 4. Luồng nghiệp vụ chính

Core flow cần được bảo vệ trong toàn bộ quá trình phát triển:

```text
Quản lý tạo menu và bàn
→ Khách đặt bàn
→ Nhân viên check-in
→ Hệ thống tạo phiên sử dụng bàn
→ Khách quét mã QR
→ Khách gọi món
→ Bếp nhận order realtime
→ Bếp cập nhật trạng thái món
→ Nhân viên phục vụ món
→ Thu ngân xác nhận thanh toán
→ Quản lý xem dashboard
→ AI tư vấn món hoặc sinh báo cáo
```

Không task nào được làm hỏng luồng chính này.

---

## 5. Cấu trúc thư mục chuẩn

```text
restaurant-ordering-system/
│
├── RestaurantOrderingSystem.slnx
├── README.md
│
├── docs/
│   ├── agent-briefing.md
│   ├── architecture.md
│   ├── api-contract.md
│   ├── db-schema.md
│   ├── ui-flow.md
│   ├── git-workflow-guide.md
│   ├── issue-template.md
│   └── demo-script.md
│
├── backend/
│   └── restaurant-api/
│       ├── src/
│       │   ├── Restaurant.Api/
│       │   ├── Restaurant.Application/
│       │   ├── Restaurant.Domain/
│       │   └── Restaurant.Infrastructure/
│       └── tests/
│           ├── Restaurant.UnitTests/
│           └── Restaurant.IntegrationTests/
│
├── frontend/
│   ├── customer-web/
│   └── admin-web/
│
├── services/
│   └── ai-service/
│       ├── app/
│       ├── knowledge_base/
│       ├── requirements.txt
│       └── Dockerfile
│
├── infrastructure/
│   ├── docker-compose.local.yml
│   ├── nginx/
│   └── scripts/
│
└── .github/
    └── workflows/
```

---

## 6. Phạm vi từng khu vực

### Backend

Chỉ code backend trong:

```text
backend/restaurant-api/
```

Các module backend chính:

```text
Identity
Restaurant
Reservation
Ordering
Kitchen
Billing
Dashboard
Notification
```

### Frontend

Customer UI:

```text
frontend/customer-web/
```

Admin/Internal UI:

```text
frontend/admin-web/
```

### AI Service

```text
services/ai-service/
```

### DevOps

```text
infrastructure/
.github/workflows/
```

### Documentation

```text
docs/
README.md
```

---

## 7. Quy tắc bắt buộc cho người và AI agent

### Được phép

- Code đúng phạm vi issue được giao.
- Thêm file trong module mình phụ trách.
- Cập nhật tài liệu nếu có thay đổi API, DB, kiến trúc hoặc luồng UI.
- Tạo test tương ứng nếu task yêu cầu.
- Tạo Pull Request vào `develop`.

### Không được phép

- Không tự ý đổi kiến trúc từ Modular Monolith sang microservices.
- Không tự ý tạo service backend mới.
- Không tự ý đổi API contract nếu chưa cập nhật `docs/api-contract.md`.
- Không tự ý đổi database schema nếu chưa cập nhật `docs/db-schema.md`.
- Không sửa file ngoài phạm vi issue nếu không cần thiết.
- Không commit `.env`, API key, token, password thật.
- Không code trực tiếp vào `main`.
- Không code trực tiếp vào `develop` trừ khi được leader cho phép.
- Không để AI Service, Redis hoặc external API làm sập core flow.
- Không bỏ health check.

---

## 8. Quy tắc khi thay đổi API

Nếu thay đổi endpoint, request hoặc response, bắt buộc cập nhật:

```text
docs/api-contract.md
```

Pull Request phải ghi rõ:

```text
API affected:
- Endpoint thay đổi
- Request thay đổi
- Response thay đổi
- Frontend cần cập nhật gì
```

---

## 9. Quy tắc khi thay đổi database

Nếu thêm bảng, cột hoặc quan hệ, bắt buộc cập nhật:

```text
docs/db-schema.md
```

Pull Request phải ghi rõ:

```text
DB affected:
- Bảng thay đổi
- Cột thêm/xóa/sửa
- Migration liên quan
```

---

## 10. Quy tắc khi làm frontend

Frontend phải bám theo:

```text
docs/api-contract.md
docs/ui-flow.md
```

Nếu backend chưa hoàn thiện, frontend được phép dùng mock data nhưng mock phải giống API contract.

Không gọi trực tiếp AI provider từ frontend. Mọi request AI phải đi qua backend hoặc AI Service API đã định nghĩa.

---

## 11. Quy tắc khi làm AI RAG

AI Service phải bám theo:

```text
services/ai-service/knowledge_base/
docs/api-contract.md
```

AI không được bịa món ăn, giá, chính sách hoặc báo cáo nếu context không có dữ liệu.

Nếu không tìm thấy thông tin, AI phải trả lời theo hướng:

```text
Hiện tại hệ thống chưa có đủ dữ liệu để kết luận.
```

---

## 12. Quy tắc khi làm DevOps

DevOps phải đảm bảo:

- Docker Compose chạy được local.
- Không hardcode secret.
- Có `.env.example`.
- Có health check cho backend và AI.
- CI chạy trên Pull Request vào `develop`.
- CD chỉ chạy khi push hoặc merge vào `main`.

---

## 13. Format báo cáo sau khi hoàn thành task

Mỗi thành viên hoặc AI agent khi hoàn thành task phải báo cáo theo format:

```text
Task ID:
Branch:
Files changed:
API affected:
DB affected:
UI affected:
How to test:
Known issues:
Checklist:
[ ] Build pass
[ ] Test pass hoặc đã nêu rõ chưa có test
[ ] Không commit secret
[ ] Không phá API contract
[ ] Không phá DB schema
[ ] Đã cập nhật docs nếu cần
```

---

## 14. Definition of Done chung

Một task chỉ được coi là hoàn thành khi:

- Code đúng phạm vi issue.
- Build pass.
- Không commit secret.
- Không phá core flow.
- Có hướng dẫn test.
- Pull Request được tạo về `develop`.
- Nếu thay đổi API/DB/UI flow thì tài liệu đã được cập nhật.

---

## 15. Tài liệu bắt buộc đọc trước khi code

Trước khi code bất kỳ issue nào, bắt buộc đọc:

```text
docs/agent-briefing.md
docs/architecture.md
docs/api-contract.md
docs/db-schema.md
docs/ui-flow.md
docs/git-workflow-guide.md
```
