# Git Workflow Guide

## 1. Mục đích

Tài liệu này quy định cách sử dụng Git, GitHub Issues, Branch và Pull Request trong dự án.

Mục tiêu:

- Không code trực tiếp vào `main`.
- Không làm hỏng code chung.
- Mỗi task có issue rõ ràng.
- Mỗi thay đổi code được review qua Pull Request.
- Dễ theo dõi tiến độ khi demo với giảng viên.

---

## 2. Branch chính

Dự án sử dụng 3 nhóm branch:

```text
main
develop
feature/*
```

### main

Nhánh ổn định nhất.

Dùng cho:

- Demo
- Nộp bài
- Deploy production/staging ổn định

Không commit trực tiếp vào `main`.

### develop

Nhánh tích hợp code.

Dùng để gom code từ các feature branch.

Mọi Pull Request từ task sẽ merge vào `develop`.

### feature/*

Nhánh làm từng issue/task.

Ví dụ:

```text
feature/12-login-api
feature/18-reservation-page
feature/25-ai-rag-menu-chat
```

---

## 3. Luồng làm việc chuẩn

```text
Issue
→ Tạo branch từ develop
→ Code
→ Test local
→ Commit
→ Push branch
→ Pull Request vào develop
→ Review
→ Merge vào develop
→ Khi develop ổn định thì merge vào main
```

---

## 4. Lệnh làm task mới

Bắt đầu từ repo local:

```powershell
git checkout develop
git pull origin develop
git checkout -b feature/<issue-number>-<task-name>
```

Ví dụ:

```powershell
git checkout -b feature/12-login-api
```

---

## 5. Commit code

Kiểm tra thay đổi:

```powershell
git status
```

Add file:

```powershell
git add .
```

Commit:

```powershell
git commit -m "feat: xây dựng login api"
```

Push branch:

```powershell
git push -u origin feature/12-login-api
```

---

## 6. Quy ước commit message

Sử dụng tiếng Việt, có tiền tố rõ ràng.

```text
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
chore: cấu hình hoặc việc phụ trợ
ci: cập nhật CI/CD
refactor: tái cấu trúc code
test: thêm hoặc sửa kiểm thử
```

Ví dụ:

```text
feat: xây dựng chức năng đặt bàn
fix: sửa lỗi tạo order trùng
docs: cập nhật api contract
ci: thêm workflow build backend
chore: thêm docker compose local
```

---

## 7. Pull Request

Sau khi push branch, tạo Pull Request trên GitHub:

```text
base: develop
compare: feature/<issue-number>-<task-name>
```

Ví dụ:

```text
feature/12-login-api → develop
```

---

## 8. Mẫu mô tả Pull Request

```markdown
## Tóm tắt

Mô tả ngắn gọn task đã làm.

## Issue liên quan

Closes #<issue-number>

## Thay đổi chính

- Thay đổi 1
- Thay đổi 2
- Thay đổi 3

## Cách kiểm thử

1. Chạy project
2. Gọi API hoặc mở UI
3. Kiểm tra kết quả

## Checklist

- [ ] Build pass
- [ ] Test pass hoặc đã nêu rõ chưa có test
- [ ] Không commit secret
- [ ] Không phá API contract
- [ ] Đã cập nhật docs nếu có thay đổi API/DB/UI
```

---

## 9. Liên kết Pull Request với Issue

Trong PR description ghi:

```text
Closes #12
```

Khi PR được merge, GitHub tự đóng issue #12.

---

## 10. Khi develop ổn định

Tạo Pull Request:

```text
base: main
compare: develop
```

Nghĩa là:

```text
develop → main
```

Dùng khi chuẩn bị demo hoặc nộp bản ổn định.

---

## 11. Những điều không được làm

- Không push trực tiếp vào `main`.
- Không push trực tiếp vào `develop` nếu không được leader cho phép.
- Không commit `.env`.
- Không commit secret, token, API key.
- Không commit `bin/`, `obj/`, `node_modules/`, `.venv/`.
- Không sửa file ngoài phạm vi issue nếu không cần.
- Không merge PR khi build lỗi.

---

## 12. Kiểm tra branch hiện tại

```powershell
git branch
```

Dấu `*` cho biết branch đang đứng.

Ví dụ:

```text
  main
  develop
* feature/12-login-api
```

---

## 13. Cập nhật code sau khi PR đã merge

Sau khi PR đã merge vào `develop`, thành viên cập nhật local:

```powershell
git checkout develop
git pull origin develop
```

Xóa branch local nếu không cần:

```powershell
git branch -d feature/12-login-api
```

---

## 14. Cách xử lý conflict cơ bản

Nếu Pull Request bị conflict:

1. Chuyển sang branch feature.
2. Pull develop mới nhất.
3. Resolve conflict.
4. Commit lại.
5. Push lại branch.

Lệnh:

```powershell
git checkout feature/12-login-api
git pull origin develop
```

Sau đó sửa file conflict, rồi:

```powershell
git add .
git commit -m "fix: xử lý conflict với develop"
git push
```

---

## 15. Quy trình cho thành viên mới

```powershell
git clone https://github.com/<owner>/restaurant-ordering-system.git
cd restaurant-ordering-system
git checkout develop
git pull origin develop
```

Sau đó nhận issue và tạo feature branch.

