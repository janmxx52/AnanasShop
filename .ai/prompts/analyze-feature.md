# Analyze Feature Prompt

## Step 1 — Read minimum required context

Chỉ đọc các file thật sự cần thiết:

### Always read
- .ai/tasks/current.md
- .ai/business/business-rules.md
- .ai/project/architecture.md

### Read if needed
- .ai/database/schema.md        (nếu feature liên quan DB)
- .ai/api/routes.md            (nếu feature liên quan API)
- .ai/laravel/conventions.md   (nếu cần kiểm tra coding rules)
- .ai/decisions/*.md           (nếu feature bị ảnh hưởng bởi architectural decisions)

Không đọc file không liên quan.

---

## Step 2 — Understand task

FEATURE_NAME:
{{FEATURE_NAME}}

FEATURE_REQUIREMENTS:
{{FEATURE_REQUIREMENTS}}

---

## Step 3 — Analyze only requested scope

Chỉ phân tích đúng feature được yêu cầu.

KHÔNG:
- code
- generate migration
- sửa file
- phân tích feature khác
- đề xuất ngoài scope

Nếu thiếu thông tin:
- ghi rõ: `Need clarification`
- không tự đoán

---

## Output format

# 1. Goal
Feature này cần đạt gì?

---

# 2. Relevant business rules
Liệt kê các business rules áp dụng trực tiếp.

---

# 3. Dependencies check
Feature này phụ thuộc vào:

- Models nào?
- Tables nào?
- Feature nào phải hoàn thành trước?

Nếu dependency chưa xong → cảnh báo.

---

# 4. Database impact
Bảng bị ảnh hưởng:

- create
- alter
- no change

Cần migration nào?

---

# 5. API impact
Route cần thêm/sửa:

Public:
- ...

Protected:
- ...

Admin:
- ...

---

# 6. Backend components needed

Model:
- ...

Controller:
- ...

Service:
- ...

Repository:
- ...

Request:
- ...

Resource:
- ...

Policy / Middleware:
- ...

Event / Listener:
- ...

---

# 7. Risks & edge cases

Liệt kê:

- Logic bugs
- Race conditions
- Validation risks
- Security risks
- Performance risks

---

# 8. Implementation plan

Step-by-step:

1. ...
2. ...
3. ...

---

# 9. Definition of done

Checklist để feature được xem là hoàn thành:

- [ ]
- [ ]
- [ ]

---

## Rules

- Ưu tiên dùng context hiện có
- Không hallucinate
- Không thêm assumptions nếu không chắc
- Nếu conflict giữa files:
  ưu tiên `business-rules.md`