# create-github-issues.ps1
# Chạy tại root repo sau khi đã đăng nhập GitHub CLI bằng: gh auth login
# Điều kiện: labels và milestones đã được tạo sẵn trên GitHub.

$ErrorActionPreference = "Continue"

function New-ProjectIssue {
    param(
        [string]$Title,
        [string]$Body,
        [string]$Labels,
        [string]$Milestone
    )
    Write-Host "Creating issue: $Title" -ForegroundColor Cyan
    gh issue create --title "$Title" --body "$Body" --label "$Labels" --milestone "$Milestone"
}


New-ProjectIssue `
    -Title '[DOCS] Cập nhật agent briefing và kiến trúc hệ thống' `
    -Body @'
## Mục tiêu

Hoàn thiện tài liệu định hướng để người thật và AI agent hiểu đúng kiến trúc, phạm vi và quy tắc phát triển dự án.

## Phạm vi thực hiện

docs/agent-briefing.md; docs/architecture.md

## Vai trò phụ trách gợi ý

Leader / Architect

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[DOCS] Rà soát API contract bản đầu' `
    -Body @'
## Mục tiêu

Chuẩn hóa API contract bản đầu để backend, frontend và AI có thể code song song.

## Phạm vi thực hiện

docs/api-contract.md

## Vai trò phụ trách gợi ý

Leader / BE / FE

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[DOCS] Rà soát database schema bản đầu' `
    -Body @'
## Mục tiêu

Chuẩn hóa database schema bản đầu để backend phát triển đúng hướng.

## Phạm vi thực hiện

docs/db-schema.md

## Vai trò phụ trách gợi ý

Backend Lead

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,backend,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[DOCS] Viết UI flow cho Customer/Admin' `
    -Body @'
## Mục tiêu

Chuẩn hóa luồng giao diện để frontend code song song không lệch nghiệp vụ.

## Phạm vi thực hiện

docs/ui-flow.md

## Vai trò phụ trách gợi ý

Frontend Lead

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,frontend,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[BE] Thiết lập backend health check' `
    -Body @'
## Mục tiêu

Thêm health check endpoint cho Restaurant.Api phục vụ local, Docker và CI/CD.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api

## Vai trò phụ trách gợi ý

Backend Core

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[BE] Thiết lập EF Core PostgreSQL' `
    -Body @'
## Mục tiêu

Thiết lập Entity Framework Core kết nối PostgreSQL cho backend.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api; Restaurant.Infrastructure

## Vai trò phụ trách gợi ý

Backend Core

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[FE] Khởi tạo Customer Web' `
    -Body @'
## Mục tiêu

Khởi tạo ứng dụng Customer Web cho khách hàng.

## Phạm vi thực hiện

frontend/customer-web

## Vai trò phụ trách gợi ý

Frontend Customer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[FE] Khởi tạo Admin Web' `
    -Body @'
## Mục tiêu

Khởi tạo ứng dụng Admin Web cho staff, kitchen, cashier và manager.

## Phạm vi thực hiện

frontend/admin-web

## Vai trò phụ trách gợi ý

Frontend Admin

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[AI] Khởi tạo FastAPI AI RAG Service' `
    -Body @'
## Mục tiêu

Khởi tạo AI Service riêng bằng FastAPI để phục vụ chatbot RAG và báo cáo quản lý.

## Phạm vi thực hiện

services/ai-service

## Vai trò phụ trách gợi ý

AI Engineer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'ai,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[DEVOPS] Hoàn thiện Docker Compose local' `
    -Body @'
## Mục tiêu

Hoàn thiện docker-compose local để chạy hạ tầng phát triển.

## Phạm vi thực hiện

infrastructure/docker-compose.local.yml

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,priority-high' `
    -Milestone 'Sprint 1 - Foundation'


New-ProjectIssue `
    -Title '[BE] Xây dựng Identity Module' `
    -Body @'
## Mục tiêu

Xây dựng module đăng nhập và phân quyền cơ bản cho hệ thống nội bộ.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Identity

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Menu Category API' `
    -Body @'
## Mục tiêu

Xây dựng API quản lý danh mục món ăn.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Restaurant

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Menu Item API' `
    -Body @'
## Mục tiêu

Xây dựng API quản lý món ăn, tìm kiếm, lọc và trạng thái còn món.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Restaurant

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Area và Table API' `
    -Body @'
## Mục tiêu

Xây dựng API quản lý khu vực và bàn.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Restaurant

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Reservation API' `
    -Body @'
## Mục tiêu

Xây dựng API đặt bàn cho khách hàng và quản lý reservation.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Reservation

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Check-in và Table Session API' `
    -Body @'
## Mục tiêu

Xây dựng chức năng check-in và tạo phiên sử dụng bàn.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Reservation

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Ordering API' `
    -Body @'
## Mục tiêu

Xây dựng API tạo order từ QR và chống submit trùng.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Ordering

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[BE] Xây dựng Billing API cơ bản' `
    -Body @'
## Mục tiêu

Xây dựng hóa đơn tạm tính và xác nhận thanh toán cơ bản.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Billing

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[FE] Xây dựng trang menu khách hàng' `
    -Body @'
## Mục tiêu

Xây dựng trang xem menu cho Customer Web.

## Phạm vi thực hiện

frontend/customer-web

## Vai trò phụ trách gợi ý

Frontend Customer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[FE] Xây dựng trang đặt bàn' `
    -Body @'
## Mục tiêu

Xây dựng giao diện đặt bàn cho khách hàng.

## Phạm vi thực hiện

frontend/customer-web

## Vai trò phụ trách gợi ý

Frontend Customer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[FE] Xây dựng màn hình Staff Table Map' `
    -Body @'
## Mục tiêu

Xây dựng màn hình sơ đồ bàn cho nhân viên.

## Phạm vi thực hiện

frontend/admin-web

## Vai trò phụ trách gợi ý

Frontend Admin

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[FE] Xây dựng màn hình Check-in đặt bàn' `
    -Body @'
## Mục tiêu

Xây dựng màn hình tìm reservation và check-in khách.

## Phạm vi thực hiện

frontend/admin-web

## Vai trò phụ trách gợi ý

Frontend Admin

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[FE] Xây dựng trang QR Order' `
    -Body @'
## Mục tiêu

Xây dựng màn hình gọi món bằng QR cho khách hàng.

## Phạm vi thực hiện

frontend/customer-web

## Vai trò phụ trách gợi ý

Frontend Customer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-high' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[FE] Xây dựng màn hình Cashier Invoice' `
    -Body @'
## Mục tiêu

Xây dựng màn hình thu ngân xem hóa đơn và xác nhận thanh toán.

## Phạm vi thực hiện

frontend/admin-web

## Vai trò phụ trách gợi ý

Frontend Admin

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,priority-medium' `
    -Milestone 'Sprint 2 - Core Restaurant Flow'


New-ProjectIssue `
    -Title '[REALTIME] Tạo SignalR Order Hub' `
    -Body @'
## Mục tiêu

Tạo SignalR hub phục vụ trạng thái order cho customer.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Shared/Realtime

## Vai trò phụ trách gợi ý

Backend Realtime

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'realtime,backend,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[REALTIME] Tạo SignalR Kitchen Hub' `
    -Body @'
## Mục tiêu

Tạo SignalR hub cho màn hình bếp nhận order realtime.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Shared/Realtime

## Vai trò phụ trách gợi ý

Backend Realtime

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'realtime,backend,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[REALTIME] Bếp nhận order realtime' `
    -Body @'
## Mục tiêu

Tích hợp flow order mới xuất hiện realtime trên Kitchen Display.

## Phạm vi thực hiện

backend + frontend/admin-web

## Vai trò phụ trách gợi ý

BE + FE

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'realtime,backend,frontend,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[REALTIME] Khách theo dõi trạng thái món realtime' `
    -Body @'
## Mục tiêu

Tích hợp realtime cho khách theo dõi trạng thái món.

## Phạm vi thực hiện

frontend/customer-web

## Vai trò phụ trách gợi ý

Frontend Customer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'realtime,frontend,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[REALTIME] Staff nhận thông báo món Ready' `
    -Body @'
## Mục tiêu

Tích hợp realtime để nhân viên nhận món đã sẵn sàng.

## Phạm vi thực hiện

frontend/admin-web

## Vai trò phụ trách gợi ý

Frontend Admin

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'realtime,frontend,priority-medium' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[BE] Xây dựng Kitchen Workflow API' `
    -Body @'
## Mục tiêu

Xây dựng API quản lý workflow món trong bếp.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Modules/Kitchen

## Vai trò phụ trách gợi ý

Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'backend,realtime,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[FE] Xây dựng Kitchen Display System' `
    -Body @'
## Mục tiêu

Xây dựng màn hình Kitchen Display dạng Kanban.

## Phạm vi thực hiện

frontend/admin-web

## Vai trò phụ trách gợi ý

Frontend Admin

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,realtime,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[FE] Xây dựng Customer Order Status Page' `
    -Body @'
## Mục tiêu

Xây dựng trang khách theo dõi trạng thái order.

## Phạm vi thực hiện

frontend/customer-web

## Vai trò phụ trách gợi ý

Frontend Customer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'frontend,realtime,priority-medium' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[AI] Xây dựng knowledge base menu/policy/faq' `
    -Body @'
## Mục tiêu

Xây dựng knowledge base đủ để test AI RAG.

## Phạm vi thực hiện

services/ai-service/knowledge_base

## Vai trò phụ trách gợi ý

AI Engineer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'ai,docs,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[AI] Xây dựng embedding và vector store' `
    -Body @'
## Mục tiêu

Xây dựng pipeline embedding và lưu trữ vector cho RAG.

## Phạm vi thực hiện

services/ai-service/app

## Vai trò phụ trách gợi ý

AI Engineer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'ai,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[AI] Xây dựng API menu-chat dùng RAG' `
    -Body @'
## Mục tiêu

Xây dựng API hỏi đáp menu dựa trên RAG.

## Phạm vi thực hiện

services/ai-service/app

## Vai trò phụ trách gợi ý

AI Engineer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'ai,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[AI] Xây dựng API recommend-combo dùng RAG' `
    -Body @'
## Mục tiêu

Xây dựng API gợi ý combo theo số người, ngân sách và sở thích.

## Phạm vi thực hiện

services/ai-service/app

## Vai trò phụ trách gợi ý

AI Engineer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'ai,priority-high' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[AI] Xây dựng API manager-report' `
    -Body @'
## Mục tiêu

Xây dựng API sinh báo cáo quản lý từ dữ liệu summary và RAG context.

## Phạm vi thực hiện

services/ai-service/app

## Vai trò phụ trách gợi ý

AI Engineer

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'ai,priority-medium' `
    -Milestone 'Sprint 3 - Realtime & AI'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo Dockerfile cho backend' `
    -Body @'
## Mục tiêu

Tạo Dockerfile để container hóa Restaurant.Api.

## Phạm vi thực hiện

backend/restaurant-api/src/Restaurant.Api/Dockerfile

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,backend,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo Dockerfile cho AI Service' `
    -Body @'
## Mục tiêu

Tạo Dockerfile để container hóa AI Service.

## Phạm vi thực hiện

services/ai-service/Dockerfile

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,ai,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo Dockerfile cho Customer Web' `
    -Body @'
## Mục tiêu

Tạo Dockerfile cho Customer Web.

## Phạm vi thực hiện

frontend/customer-web/Dockerfile

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,frontend,priority-medium' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo Dockerfile cho Admin Web' `
    -Body @'
## Mục tiêu

Tạo Dockerfile cho Admin Web.

## Phạm vi thực hiện

frontend/admin-web/Dockerfile

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,frontend,priority-medium' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo GitHub Actions CI' `
    -Body @'
## Mục tiêu

Tạo workflow CI chạy khi Pull Request vào develop.

## Phạm vi thực hiện

.github/workflows/ci.yml

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Cấu hình Nginx reverse proxy' `
    -Body @'
## Mục tiêu

Cấu hình Nginx routing frontend, backend và AI service.

## Phạm vi thực hiện

infrastructure/nginx

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,priority-medium' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Thêm Telegram deploy alert' `
    -Body @'
## Mục tiêu

Thêm cảnh báo Telegram cho kết quả deploy nếu kịp.

## Phạm vi thực hiện

.github/workflows; infrastructure/scripts

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,priority-medium' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo script seed demo data' `
    -Body @'
## Mục tiêu

Tạo dữ liệu mẫu phục vụ demo.

## Phạm vi thực hiện

infrastructure/scripts; backend

## Vai trò phụ trách gợi ý

DevOps + Backend

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,backend,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEVOPS] Tạo script backup PostgreSQL' `
    -Body @'
## Mục tiêu

Tạo script backup database PostgreSQL đơn giản.

## Phạm vi thực hiện

infrastructure/scripts

## Vai trò phụ trách gợi ý

DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'devops,priority-low' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEMO] Viết kịch bản demo nghiệp vụ' `
    -Body @'
## Mục tiêu

Viết kịch bản demo core flow nghiệp vụ nhà hàng.

## Phạm vi thực hiện

docs/demo-script.md

## Vai trò phụ trách gợi ý

Leader

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEMO] Viết kịch bản demo Realtime' `
    -Body @'
## Mục tiêu

Viết kịch bản demo các luồng realtime.

## Phạm vi thực hiện

docs/demo-script.md

## Vai trò phụ trách gợi ý

Leader

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,realtime,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEMO] Viết kịch bản demo AI RAG' `
    -Body @'
## Mục tiêu

Viết kịch bản demo AI RAG.

## Phạm vi thực hiện

docs/demo-script.md

## Vai trò phụ trách gợi ý

Leader / AI

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,ai,priority-high' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DEMO] Viết kịch bản demo DevOps' `
    -Body @'
## Mục tiêu

Viết kịch bản demo Docker/CI/CD/health check.

## Phạm vi thực hiện

docs/demo-script.md

## Vai trò phụ trách gợi ý

Leader / DevOps

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,devops,priority-medium' `
    -Milestone 'Sprint 4 - DevOps & Demo'


New-ProjectIssue `
    -Title '[DOCS] Hoàn thiện báo cáo phân tích thiết kế hệ thống' `
    -Body @'
## Mục tiêu

Hoàn thiện tài liệu báo cáo phân tích thiết kế hệ thống để nộp và thuyết trình.

## Phạm vi thực hiện

docs

## Vai trò phụ trách gợi ý

All team

## Yêu cầu chi tiết

- [ ] Đọc docs/agent-briefing.md trước khi làm
- [ ] Kiểm tra docs/api-contract.md nếu có liên quan API
- [ ] Kiểm tra docs/db-schema.md nếu có liên quan database
- [ ] Thực hiện đúng phạm vi issue
- [ ] Cập nhật tài liệu nếu có thay đổi API/DB/UI/DevOps

## Acceptance Criteria

- [ ] Hoàn thành đúng phạm vi issue
- [ ] Không sửa file ngoài phạm vi nếu không cần thiết
- [ ] Không phá API contract hoặc DB schema
- [ ] Có hướng dẫn kiểm thử

## Definition of Done

- [ ] Build pass nếu có code
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Đã cập nhật docs nếu cần
- [ ] Tạo Pull Request vào develop

'@ `
    -Labels 'docs,priority-medium' `
    -Milestone 'Sprint 4 - DevOps & Demo'

