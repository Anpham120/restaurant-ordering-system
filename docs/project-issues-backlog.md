# Project Issues Backlog

Danh sách toàn bộ issue đề xuất cho dự án.

## 1. [DOCS] Cập nhật agent briefing và kiến trúc hệ thống

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `docs,priority-high`
- **Vai trò gợi ý:** Leader / Architect
- **Mục tiêu:** Hoàn thiện tài liệu định hướng để người thật và AI agent hiểu đúng kiến trúc, phạm vi và quy tắc phát triển dự án.
- **Phạm vi:** `docs/agent-briefing.md; docs/architecture.md`

## 2. [DOCS] Rà soát API contract bản đầu

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `docs,priority-high`
- **Vai trò gợi ý:** Leader / BE / FE
- **Mục tiêu:** Chuẩn hóa API contract bản đầu để backend, frontend và AI có thể code song song.
- **Phạm vi:** `docs/api-contract.md`

## 3. [DOCS] Rà soát database schema bản đầu

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `docs,backend,priority-high`
- **Vai trò gợi ý:** Backend Lead
- **Mục tiêu:** Chuẩn hóa database schema bản đầu để backend phát triển đúng hướng.
- **Phạm vi:** `docs/db-schema.md`

## 4. [DOCS] Viết UI flow cho Customer/Admin

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `docs,frontend,priority-high`
- **Vai trò gợi ý:** Frontend Lead
- **Mục tiêu:** Chuẩn hóa luồng giao diện để frontend code song song không lệch nghiệp vụ.
- **Phạm vi:** `docs/ui-flow.md`

## 5. [BE] Thiết lập backend health check

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend Core
- **Mục tiêu:** Thêm health check endpoint cho Restaurant.Api phục vụ local, Docker và CI/CD.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api`

## 6. [BE] Thiết lập EF Core PostgreSQL

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend Core
- **Mục tiêu:** Thiết lập Entity Framework Core kết nối PostgreSQL cho backend.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api; Restaurant.Infrastructure`

## 7. [FE] Khởi tạo Customer Web

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Customer
- **Mục tiêu:** Khởi tạo ứng dụng Customer Web cho khách hàng.
- **Phạm vi:** `frontend/customer-web`

## 8. [FE] Khởi tạo Admin Web

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Admin
- **Mục tiêu:** Khởi tạo ứng dụng Admin Web cho staff, kitchen, cashier và manager.
- **Phạm vi:** `frontend/admin-web`

## 9. [AI] Khởi tạo FastAPI AI RAG Service

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `ai,priority-high`
- **Vai trò gợi ý:** AI Engineer
- **Mục tiêu:** Khởi tạo AI Service riêng bằng FastAPI để phục vụ chatbot RAG và báo cáo quản lý.
- **Phạm vi:** `services/ai-service`

## 10. [DEVOPS] Hoàn thiện Docker Compose local

- **Milestone:** Sprint 1 - Foundation
- **Labels:** `devops,priority-high`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Hoàn thiện docker-compose local để chạy hạ tầng phát triển.
- **Phạm vi:** `infrastructure/docker-compose.local.yml`

## 11. [BE] Xây dựng Identity Module

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng module đăng nhập và phân quyền cơ bản cho hệ thống nội bộ.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Identity`

## 12. [BE] Xây dựng Menu Category API

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng API quản lý danh mục món ăn.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Restaurant`

## 13. [BE] Xây dựng Menu Item API

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng API quản lý món ăn, tìm kiếm, lọc và trạng thái còn món.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Restaurant`

## 14. [BE] Xây dựng Area và Table API

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng API quản lý khu vực và bàn.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Restaurant`

## 15. [BE] Xây dựng Reservation API

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng API đặt bàn cho khách hàng và quản lý reservation.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Reservation`

## 16. [BE] Xây dựng Check-in và Table Session API

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng chức năng check-in và tạo phiên sử dụng bàn.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Reservation`

## 17. [BE] Xây dựng Ordering API

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng API tạo order từ QR và chống submit trùng.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Ordering`

## 18. [BE] Xây dựng Billing API cơ bản

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `backend,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng hóa đơn tạm tính và xác nhận thanh toán cơ bản.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Billing`

## 19. [FE] Xây dựng trang menu khách hàng

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Customer
- **Mục tiêu:** Xây dựng trang xem menu cho Customer Web.
- **Phạm vi:** `frontend/customer-web`

## 20. [FE] Xây dựng trang đặt bàn

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Customer
- **Mục tiêu:** Xây dựng giao diện đặt bàn cho khách hàng.
- **Phạm vi:** `frontend/customer-web`

## 21. [FE] Xây dựng màn hình Staff Table Map

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Admin
- **Mục tiêu:** Xây dựng màn hình sơ đồ bàn cho nhân viên.
- **Phạm vi:** `frontend/admin-web`

## 22. [FE] Xây dựng màn hình Check-in đặt bàn

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Admin
- **Mục tiêu:** Xây dựng màn hình tìm reservation và check-in khách.
- **Phạm vi:** `frontend/admin-web`

## 23. [FE] Xây dựng trang QR Order

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `frontend,priority-high`
- **Vai trò gợi ý:** Frontend Customer
- **Mục tiêu:** Xây dựng màn hình gọi món bằng QR cho khách hàng.
- **Phạm vi:** `frontend/customer-web`

## 24. [FE] Xây dựng màn hình Cashier Invoice

- **Milestone:** Sprint 2 - Core Restaurant Flow
- **Labels:** `frontend,priority-medium`
- **Vai trò gợi ý:** Frontend Admin
- **Mục tiêu:** Xây dựng màn hình thu ngân xem hóa đơn và xác nhận thanh toán.
- **Phạm vi:** `frontend/admin-web`

## 25. [REALTIME] Tạo SignalR Order Hub

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `realtime,backend,priority-high`
- **Vai trò gợi ý:** Backend Realtime
- **Mục tiêu:** Tạo SignalR hub phục vụ trạng thái order cho customer.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Shared/Realtime`

## 26. [REALTIME] Tạo SignalR Kitchen Hub

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `realtime,backend,priority-high`
- **Vai trò gợi ý:** Backend Realtime
- **Mục tiêu:** Tạo SignalR hub cho màn hình bếp nhận order realtime.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Shared/Realtime`

## 27. [REALTIME] Bếp nhận order realtime

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `realtime,backend,frontend,priority-high`
- **Vai trò gợi ý:** BE + FE
- **Mục tiêu:** Tích hợp flow order mới xuất hiện realtime trên Kitchen Display.
- **Phạm vi:** `backend + frontend/admin-web`

## 28. [REALTIME] Khách theo dõi trạng thái món realtime

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `realtime,frontend,priority-high`
- **Vai trò gợi ý:** Frontend Customer
- **Mục tiêu:** Tích hợp realtime cho khách theo dõi trạng thái món.
- **Phạm vi:** `frontend/customer-web`

## 29. [REALTIME] Staff nhận thông báo món Ready

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `realtime,frontend,priority-medium`
- **Vai trò gợi ý:** Frontend Admin
- **Mục tiêu:** Tích hợp realtime để nhân viên nhận món đã sẵn sàng.
- **Phạm vi:** `frontend/admin-web`

## 30. [BE] Xây dựng Kitchen Workflow API

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `backend,realtime,priority-high`
- **Vai trò gợi ý:** Backend
- **Mục tiêu:** Xây dựng API quản lý workflow món trong bếp.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Modules/Kitchen`

## 31. [FE] Xây dựng Kitchen Display System

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `frontend,realtime,priority-high`
- **Vai trò gợi ý:** Frontend Admin
- **Mục tiêu:** Xây dựng màn hình Kitchen Display dạng Kanban.
- **Phạm vi:** `frontend/admin-web`

## 32. [FE] Xây dựng Customer Order Status Page

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `frontend,realtime,priority-medium`
- **Vai trò gợi ý:** Frontend Customer
- **Mục tiêu:** Xây dựng trang khách theo dõi trạng thái order.
- **Phạm vi:** `frontend/customer-web`

## 33. [AI] Xây dựng knowledge base menu/policy/faq

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `ai,docs,priority-high`
- **Vai trò gợi ý:** AI Engineer
- **Mục tiêu:** Xây dựng knowledge base đủ để test AI RAG.
- **Phạm vi:** `services/ai-service/knowledge_base`

## 34. [AI] Xây dựng embedding và vector store

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `ai,priority-high`
- **Vai trò gợi ý:** AI Engineer
- **Mục tiêu:** Xây dựng pipeline embedding và lưu trữ vector cho RAG.
- **Phạm vi:** `services/ai-service/app`

## 35. [AI] Xây dựng API menu-chat dùng RAG

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `ai,priority-high`
- **Vai trò gợi ý:** AI Engineer
- **Mục tiêu:** Xây dựng API hỏi đáp menu dựa trên RAG.
- **Phạm vi:** `services/ai-service/app`

## 36. [AI] Xây dựng API recommend-combo dùng RAG

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `ai,priority-high`
- **Vai trò gợi ý:** AI Engineer
- **Mục tiêu:** Xây dựng API gợi ý combo theo số người, ngân sách và sở thích.
- **Phạm vi:** `services/ai-service/app`

## 37. [AI] Xây dựng API manager-report

- **Milestone:** Sprint 3 - Realtime & AI
- **Labels:** `ai,priority-medium`
- **Vai trò gợi ý:** AI Engineer
- **Mục tiêu:** Xây dựng API sinh báo cáo quản lý từ dữ liệu summary và RAG context.
- **Phạm vi:** `services/ai-service/app`

## 38. [DEVOPS] Tạo Dockerfile cho backend

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,backend,priority-high`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Tạo Dockerfile để container hóa Restaurant.Api.
- **Phạm vi:** `backend/restaurant-api/src/Restaurant.Api/Dockerfile`

## 39. [DEVOPS] Tạo Dockerfile cho AI Service

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,ai,priority-high`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Tạo Dockerfile để container hóa AI Service.
- **Phạm vi:** `services/ai-service/Dockerfile`

## 40. [DEVOPS] Tạo Dockerfile cho Customer Web

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,frontend,priority-medium`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Tạo Dockerfile cho Customer Web.
- **Phạm vi:** `frontend/customer-web/Dockerfile`

## 41. [DEVOPS] Tạo Dockerfile cho Admin Web

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,frontend,priority-medium`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Tạo Dockerfile cho Admin Web.
- **Phạm vi:** `frontend/admin-web/Dockerfile`

## 42. [DEVOPS] Tạo GitHub Actions CI

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,priority-high`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Tạo workflow CI chạy khi Pull Request vào develop.
- **Phạm vi:** `.github/workflows/ci.yml`

## 43. [DEVOPS] Cấu hình Nginx reverse proxy

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,priority-medium`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Cấu hình Nginx routing frontend, backend và AI service.
- **Phạm vi:** `infrastructure/nginx`

## 44. [DEVOPS] Thêm Telegram deploy alert

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,priority-medium`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Thêm cảnh báo Telegram cho kết quả deploy nếu kịp.
- **Phạm vi:** `.github/workflows; infrastructure/scripts`

## 45. [DEVOPS] Tạo script seed demo data

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,backend,priority-high`
- **Vai trò gợi ý:** DevOps + Backend
- **Mục tiêu:** Tạo dữ liệu mẫu phục vụ demo.
- **Phạm vi:** `infrastructure/scripts; backend`

## 46. [DEVOPS] Tạo script backup PostgreSQL

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `devops,priority-low`
- **Vai trò gợi ý:** DevOps
- **Mục tiêu:** Tạo script backup database PostgreSQL đơn giản.
- **Phạm vi:** `infrastructure/scripts`

## 47. [DEMO] Viết kịch bản demo nghiệp vụ

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `docs,priority-high`
- **Vai trò gợi ý:** Leader
- **Mục tiêu:** Viết kịch bản demo core flow nghiệp vụ nhà hàng.
- **Phạm vi:** `docs/demo-script.md`

## 48. [DEMO] Viết kịch bản demo Realtime

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `docs,realtime,priority-high`
- **Vai trò gợi ý:** Leader
- **Mục tiêu:** Viết kịch bản demo các luồng realtime.
- **Phạm vi:** `docs/demo-script.md`

## 49. [DEMO] Viết kịch bản demo AI RAG

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `docs,ai,priority-high`
- **Vai trò gợi ý:** Leader / AI
- **Mục tiêu:** Viết kịch bản demo AI RAG.
- **Phạm vi:** `docs/demo-script.md`

## 50. [DEMO] Viết kịch bản demo DevOps

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `docs,devops,priority-medium`
- **Vai trò gợi ý:** Leader / DevOps
- **Mục tiêu:** Viết kịch bản demo Docker/CI/CD/health check.
- **Phạm vi:** `docs/demo-script.md`

## 51. [DOCS] Hoàn thiện báo cáo phân tích thiết kế hệ thống

- **Milestone:** Sprint 4 - DevOps & Demo
- **Labels:** `docs,priority-medium`
- **Vai trò gợi ý:** All team
- **Mục tiêu:** Hoàn thiện tài liệu báo cáo phân tích thiết kế hệ thống để nộp và thuyết trình.
- **Phạm vi:** `docs`

