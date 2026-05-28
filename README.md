# restaurant-ordering-system
# Hệ Thống Quản Lý Đặt Bàn Và Gọi Món Nhà Hàng

> Hệ thống quản lý vận hành nhà hàng theo thời gian thực, tích hợp AI RAG và quy trình DevOps, được xây dựng theo kiến trúc Modular Monolith kết hợp AI Service riêng.

---

## 1. Tổng Quan Dự Án

Hệ thống quản lý đặt bàn và gọi món nhà hàng là một nền tảng web hỗ trợ toàn bộ quy trình vận hành nhà hàng, bao gồm đặt bàn, check-in, gọi món bằng mã QR, xử lý đơn trong bếp, thanh toán, thống kê doanh thu và hỗ trợ tư vấn bằng AI.

Dự án tập trung vào ba điểm mạnh chính:

- **Realtime**: đồng bộ trạng thái gọi món giữa khách hàng, bếp, nhân viên phục vụ, thu ngân và quản lý theo thời gian thực bằng SignalR.
- **AI RAG**: AI Service sử dụng Retrieval-Augmented Generation để tư vấn món ăn, hỏi đáp menu/chính sách và hỗ trợ sinh báo cáo quản lý.
- **DevOps**: hỗ trợ Docker Compose, GitHub Actions, health check, Nginx reverse proxy, triển khai tự động và cảnh báo trạng thái deploy.

Dự án được thiết kế phục vụ đồ án học thuật nhưng áp dụng quy trình phát triển phần mềm thực tế như Git workflow, GitHub Issues, Pull Request, API contract, tài liệu hóa kiến trúc và quản lý tiến độ theo task.

---

## 2. Mục Tiêu Hệ Thống

Hệ thống hướng tới các mục tiêu sau:

- Tin học hóa quy trình đặt bàn và gọi món tại nhà hàng.
- Giảm thời gian chờ của khách hàng khi gọi món và thanh toán.
- Hỗ trợ bếp nhận order ngay lập tức theo thời gian thực.
- Hỗ trợ nhân viên theo dõi trạng thái bàn, món ăn và hóa đơn.
- Hỗ trợ quản lý xem dashboard doanh thu và tình trạng vận hành.
- Tích hợp AI RAG để tư vấn món ăn và tạo báo cáo có căn cứ từ dữ liệu nhà hàng.
- Xây dựng quy trình DevOps đủ rõ để có thể build, test và deploy hệ thống một cách có kiểm soát.

---

## 3. Chức Năng Chính

### 3.1. Chức Năng Cho Khách Hàng

- Xem menu nhà hàng.
- Tìm kiếm và lọc món ăn.
- Xem chi tiết món, giá, tag và trạng thái còn/hết món.
- Đặt bàn trực tuyến.
- Quét mã QR tại bàn để gọi món.
- Thêm món vào giỏ hàng.
- Gửi order.
- Theo dõi trạng thái món ăn theo thời gian thực.
- Hỏi AI để được tư vấn món ăn phù hợp.

### 3.2. Chức Năng Cho Nhân Viên Phục Vụ

- Đăng nhập theo vai trò.
- Xem sơ đồ bàn.
- Kiểm tra thông tin đặt bàn.
- Check-in khách đã đặt bàn.
- Gán khách vào bàn.
- Theo dõi phiên sử dụng bàn.
- Nhận thông báo khi món đã sẵn sàng.

### 3.3. Chức Năng Cho Bếp

- Xem danh sách order mới theo thời gian thực.
- Quản lý trạng thái món ăn:
  - Chờ xử lý
  - Đang chuẩn bị
  - Đã sẵn sàng
  - Đã phục vụ
- Lọc món theo bàn hoặc trạng thái.
- Làm nổi bật các món xử lý quá lâu.

### 3.4. Chức Năng Cho Thu Ngân

- Xem các bàn đang hoạt động.
- Xem hóa đơn tạm tính.
- Xác nhận thanh toán.
- Đóng phiên sử dụng bàn.
- Cập nhật lại trạng thái bàn sau thanh toán.

### 3.5. Chức Năng Cho Quản Lý

- Xem dashboard tổng quan.
- Theo dõi doanh thu.
- Theo dõi số bàn đang phục vụ.
- Xem món bán chạy.
- Xem số lượng order theo khung giờ.
- Sinh báo cáo cuối ngày bằng AI.

### 3.6. Chức Năng AI

- Hỏi đáp menu.
- Tư vấn món ăn theo số người, ngân sách và khẩu vị.
- Hỏi đáp chính sách đặt bàn, thanh toán, phục vụ.
- Sinh báo cáo quản lý.
- Truy xuất thông tin từ knowledge base bằng RAG để giảm trả lời sai hoặc bịa thông tin.

---

## 4. Kiến Trúc Hệ Thống

Dự án sử dụng kiến trúc **Modular Monolith + AI Service riêng**.

Backend chính được xây dựng bằng ASP.NET Core và chia thành nhiều module nghiệp vụ rõ ràng. Cách tiếp cận này giúp giảm độ phức tạp so với microservices, nhưng vẫn giữ được khả năng mở rộng trong tương lai.

AI Service được tách riêng vì sử dụng công nghệ Python/FastAPI và xử lý pipeline RAG riêng.

```text
Client Applications
├── Customer Web
└── Admin Web
        |
        v
ASP.NET Core Backend - Modular Monolith
├── Identity Module
├── Restaurant Module
├── Reservation Module
├── Ordering Module
├── Kitchen Module
├── Billing Module
├── Dashboard Module
└── Notification Module
        |
        ├── PostgreSQL
        ├── Redis
        └── SignalR
        |
        v
FastAPI AI RAG Service
├── Knowledge Base
├── Embedding Pipeline
├── Vector Store
└── LLM Provider
```

---

## 5. Công Nghệ Sử Dụng

### 5.1. Frontend

- React 19 / TypeScript
- Vanilla CSS (CSS thuần tối ưu hóa thẩm mỹ Premium nhã nhặn, không sử dụng Tailwind CSS)
- Lucide React (Thư viện Icons trực quan)
- TanStack Query / Zustand
- React Hook Form / Zod
- SignalR Client

### 5.2. Backend

- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL
- SignalR
- JWT Authentication
- FluentValidation
- Serilog
- Swagger / OpenAPI

### 5.3. AI Service

- Python
- FastAPI
- Pydantic
- RAG pipeline
- Chroma hoặc FAISS
- Embedding model
- Gemini API hoặc OpenAI API

### 5.4. DevOps

- Docker
- Docker Compose
- GitHub Actions
- Nginx
- Health check
- Telegram deploy alert
- PostgreSQL backup script
- `.env.example` để quản lý biến môi trường mẫu

---

## 6. Cấu Trúc Thư Mục

```text
restaurant-ordering-system/
│
├── RestaurantOrderingSystem.sln
│
├── docs/
│   ├── agent-briefing.md
│   ├── architecture.md
│   ├── api-contract.md
│   ├── db-schema.md
│   ├── ui-flow.md
│   ├── git-workflow-guide.md
│   ├── demo-script.md
│   └── issue-template.md
│
├── backend/
│   └── restaurant-api/
│       ├── src/
│       │   ├── Restaurant.Api/
│       │   ├── Restaurant.Application/
│       │   ├── Restaurant.Domain/
│       │   └── Restaurant.Infrastructure/
│       │
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
│       ├── Dockerfile
│       └── README.md
│
├── infrastructure/
│   ├── docker-compose.local.yml
│   ├── nginx/
│   └── scripts/
│
├── .github/
│   └── workflows/
│
├── .gitignore
└── README.md
```

---

## 7. Thiết Kế Module Backend

Backend được tổ chức theo hướng modular bên trong một ASP.NET Core application.

```text
Restaurant.Api/
├── Modules/
│   ├── Identity/
│   ├── Restaurant/
│   ├── Reservation/
│   ├── Ordering/
│   ├── Kitchen/
│   ├── Billing/
│   ├── Dashboard/
│   └── Notification/
│
├── Shared/
│   ├── Auth/
│   ├── Database/
│   ├── Realtime/
│   ├── Exceptions/
│   └── Common/
│
├── Controllers/
├── Program.cs
└── appsettings.json
```

| Module | Trách nhiệm |
|---|---|
| Identity | Xác thực, phân quyền, quản lý người dùng |
| Restaurant | Quản lý menu, danh mục món, bàn, khu vực |
| Reservation | Đặt bàn, xác nhận đặt bàn, check-in |
| Ordering | Gọi món bằng QR, tạo order, theo dõi trạng thái |
| Kitchen | Màn hình bếp, xử lý trạng thái món |
| Billing | Tạm tính hóa đơn, xác nhận thanh toán |
| Dashboard | Thống kê doanh thu, order, bàn, món bán chạy |
| Notification | Thông báo nội bộ và cảnh báo Telegram nếu cần |

---

## 8. Luồng Nghiệp Vụ Chính

```text
Quản lý tạo menu và bàn
        |
Khách đặt bàn
        |
Nhân viên check-in khách
        |
Hệ thống tạo phiên sử dụng bàn
        |
Khách quét mã QR
        |
Khách gửi order
        |
Bếp nhận order realtime
        |
Bếp cập nhật trạng thái món
        |
Nhân viên phục vụ món
        |
Thu ngân xác nhận thanh toán
        |
Quản lý xem dashboard
        |
AI tư vấn món hoặc sinh báo cáo
```

---

## 9. Thiết Kế Realtime

Realtime được triển khai bằng **SignalR**.

### Các sự kiện realtime chính

```text
NewOrderCreated
OrderItemPreparing
OrderItemReady
OrderItemServed
TableStatusChanged
PaymentCompleted
DashboardUpdated
```

### Kịch bản realtime cần demo

- Khách gửi order và bếp nhận được ngay.
- Bếp chuyển món sang trạng thái sẵn sàng và nhân viên nhận cập nhật.
- Khách thấy trạng thái món thay đổi theo thời gian thực.
- Dashboard quản lý cập nhật khi có order hoặc thanh toán mới.

---

## 10. Thiết Kế AI RAG

AI Service được tách riêng và triển khai bằng FastAPI.

### Knowledge Base

```text
services/ai-service/knowledge_base/
├── menu.md
├── ingredient_notes.md
├── restaurant_policy.md
├── reservation_policy.md
├── payment_policy.md
└── faq.md
```

### Luồng RAG

```text
Câu hỏi của người dùng
→ AI Service nhận request
→ Tạo embedding cho câu hỏi
→ Truy xuất tài liệu liên quan từ vector store
→ Đưa context vào prompt
→ LLM sinh câu trả lời có căn cứ
→ Trả kết quả về frontend/backend
```

### API AI dự kiến

```text
POST /api/v1/ai/menu-chat
POST /api/v1/ai/recommend-combo
POST /api/v1/ai/manager-report
POST /api/v1/ai/rebuild-index
GET  /health
```

---

## 11. Thiết Kế DevOps

DevOps tập trung vào khả năng chạy, kiểm thử và triển khai hệ thống một cách có kiểm soát.

### Thành phần DevOps

- Docker Compose cho môi trường local.
- Dockerfile cho backend.
- Dockerfile cho AI Service.
- Dockerfile cho frontend.
- GitHub Actions CI.
- Deploy lên VPS bằng SSH nếu triển khai thực tế.
- Nginx reverse proxy.
- Health check cho backend và AI Service.
- Telegram deploy alert.
- Script backup PostgreSQL.
- `.env.example` để tránh commit secret thật.

### Luồng CI

```text
Pull Request vào develop
→ Restore dependencies
→ Build backend
→ Run tests
→ Build frontend
→ Validate AI service
→ Trả trạng thái CI
```

### Luồng CD

```text
Push vào main
→ Build Docker images
→ SSH vào VPS
→ Pull phiên bản mới
→ docker compose up -d
→ Kiểm tra backend /health
→ Kiểm tra AI Service /health
→ Gửi kết quả deploy qua Telegram
```

---

## 12. Cài Đặt Môi Trường Local

### 12.1. Yêu Cầu Cài Đặt

Cần cài các công cụ sau:

- Git
- Docker Desktop
- .NET SDK 8
- Node.js LTS
- Python 3.11+
- Visual Studio 2022

### 12.2. Clone Repository

```bash
git clone https://github.com/<owner>/restaurant-ordering-system.git
cd restaurant-ordering-system
```

### 12.3. Chạy Hạ Tầng Local

```bash
docker compose -f infrastructure/docker-compose.local.yml up -d
docker ps
```

Các container mong đợi:

```text
restaurant-postgres
restaurant-redis
```

### 12.4. Chạy Backend

Mở solution bằng Visual Studio:

```text
RestaurantOrderingSystem.sln
```

Hoặc chạy bằng terminal:

```bash
dotnet build RestaurantOrderingSystem.sln
dotnet run --project backend/restaurant-api/src/Restaurant.Api/Restaurant.Api.csproj
```

### 12.5. Chạy AI Service

```bash
cd services/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 12.6. Chạy Frontend

Customer Web:

```bash
cd frontend/customer-web
npm install
npm run dev
```

Admin Web:

```bash
cd frontend/admin-web
npm install
npm run dev
```

---

## 13. Biến Môi Trường

Tạo file môi trường local dựa trên `.env.example`.

Ví dụ:

```env
POSTGRES_USER=restaurant
POSTGRES_PASSWORD=restaurant
POSTGRES_DB=restaurant_ordering

BACKEND_PORT=8080
AI_SERVICE_PORT=8000

JWT_SECRET=change-me
GEMINI_API_KEY=change-me

TELEGRAM_BOT_TOKEN=change-me
TELEGRAM_CHAT_ID=change-me
```

Không commit secret thật lên Git.

---

## 14. Quy Trình Git

Dự án sử dụng mô hình branch:

```text
main      = nhánh ổn định để demo/release
develop   = nhánh tích hợp code
feature/* = nhánh làm từng task
```

Quy trình chuẩn:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<issue-number>-<task-name>

# code và test

git add .
git commit -m "feat: mô tả ngắn gọn task"
git push -u origin feature/<issue-number>-<task-name>
```

Sau đó tạo Pull Request:

```text
feature/<issue-number>-<task-name> → develop
```

Khi `develop` ổn định:

```text
develop → main
```

---

## 15. Quy Trình Issue Và Pull Request

### Issue

Issue đại diện cho một task, tính năng, lỗi hoặc tài liệu cần thực hiện.

Mỗi issue cần có:

- Mục tiêu
- Phạm vi thực hiện
- Thư mục/file được phép sửa
- API liên quan
- Bảng dữ liệu liên quan
- Tiêu chí nghiệm thu
- Definition of Done

### Pull Request

Pull Request dùng để review và merge code từ feature branch vào `develop`.

Mẫu mô tả Pull Request:

```markdown
## Tóm tắt

## Issue liên quan
Closes #<issue-number>

## Thay đổi chính

## Cách kiểm thử

## Checklist
- [ ] Build pass
- [ ] Test pass
- [ ] Không commit secret
- [ ] Đã cập nhật API contract nếu có thay đổi
```

---

## 16. Danh Sách Issue Khởi Tạo Đề Xuất

```text
[ARCH] Cập nhật agent briefing và tài liệu kiến trúc
[BE] Khởi tạo solution RestaurantOrderingSystem
[BE] Thiết lập backend skeleton và health check
[BE] Thiết lập EF Core PostgreSQL
[FE] Khởi tạo Customer Web
[FE] Khởi tạo Admin Web
[AI] Khởi tạo FastAPI AI RAG Service
[AI] Xây dựng knowledge base ban đầu
[DEVOPS] Thiết lập Docker Compose local
[DOCS] Viết API contract bản đầu
[DOCS] Viết database schema bản đầu
```

---

## 17. Kế Hoạch Demo

### Luồng demo

```text
1. Khởi động hệ thống bằng Docker Compose
2. Trình bày GitHub Issues và Pull Requests
3. Trình bày kết quả CI workflow
4. Đăng nhập với vai trò quản lý/nhân viên/bếp/thu ngân
5. Xem menu và danh sách bàn
6. Khách đặt bàn
7. Nhân viên check-in
8. Khách quét QR và gửi order
9. Bếp nhận order realtime
10. Bếp cập nhật trạng thái món
11. Thu ngân xác nhận thanh toán
12. Quản lý xem dashboard
13. AI RAG tư vấn món ăn
14. AI sinh báo cáo quản lý
15. Trình bày health check/deploy status
```

### Điểm cần nhấn mạnh khi demo

- Kiến trúc backend modular.
- Luồng gọi món realtime.
- AI RAG trả lời dựa trên knowledge base.
- Môi trường Docker hóa.
- Quy trình CI/CD.
- Quản lý task bằng GitHub Issues và Pull Request.

---

## 18. Hướng Phát Triển Tương Lai

- Tách một số module thành microservices độc lập.
- Bổ sung RabbitMQ cho event-driven architecture.
- Bổ sung Blue/Green Deployment.
- Bổ sung Prometheus, Grafana và Loki.
- Tích hợp cổng thanh toán.
- Bổ sung đặt món trước khi đặt bàn.
- Bổ sung đánh giá RAG nâng cao.
- Bổ sung audit log theo vai trò.
- Phát triển PWA hoặc ứng dụng mobile.

---

## 19. Quy Tắc Làm Việc Nhóm

Mỗi thành viên làm việc theo issue được giao.

```text
Issue
→ Feature branch
→ Code
→ Test local
→ Commit
→ Push branch
→ Pull Request
→ Review
→ Merge vào develop
```

Quy tắc:

- Không commit trực tiếp vào `main`.
- Không commit trực tiếp vào `develop` nếu chưa được thống nhất.
- Nếu thay đổi API, phải cập nhật `docs/api-contract.md`.
- Nếu thay đổi database, phải cập nhật `docs/db-schema.md`.
- Không commit file `.env` hoặc secret thật.
- Mỗi Pull Request phải có mô tả cách kiểm thử.

---

## 20. Trạng Thái Dự Án

Kiến trúc mục tiêu:

```text
Modular Monolith + AI RAG Service + Realtime SignalR + Docker DevOps
```

Phạm vi demo mục tiêu:

```text
Đặt bàn
QR Ordering
Kitchen Realtime
Billing
Dashboard
AI RAG Assistant
Docker Compose
CI/CD
```

---

## 21. License

Dự án được phát triển phục vụ mục đích học tập và đồ án môn học.
