<!-- Đọc các file:

- .ai/business/business-rules.md
- .ai/laravel/conventions.md
- .ai/project/architecture.md

Review đoạn code sau:

{{PASTE_CODE}}

Kiểm tra:

1. Có vi phạm business rule không?
2. Có sai Laravel convention không?
3. Có bug logic không?
4. Có race condition không?
5. Có security issue không?
6. Có duplicate code không?
7. Có thể refactor gì?

Trả về:

- Critical issues
- Warnings
- Suggestions -->




# Review Code Prompt

## Step 1 — Read context

Chỉ đọc các file cần thiết:

### Always read
- .ai/business/business-rules.md
- .ai/laravel/conventions.md
- .ai/project/architecture.md

### Read if needed
- .ai/database/schema.md
- .ai/api/routes.md
- .ai/decisions/*.md

---

## Step 2 — Review code

Review đoạn code sau:

{{PASTE_CODE}}

---

## Checklist

### 1. Business Rule Compliance

Kiểm tra:

- Có vi phạm business rules không?
- Có bỏ sót business rule nào không?
- Logic có đúng domain không?

---

### 2. Laravel Convention Compliance

Kiểm tra:

- File placement đúng chưa
- Naming đúng chưa
- Thin controller
- FormRequest cho validation
- Service/Repository đúng vai trò
- Resource cho response
- Dependency injection đúng
- Không dùng anti-pattern

---

### 3. Logic Correctness

Kiểm tra:

- Bug logic
- Edge cases
- Null handling
- Validation gaps
- Error handling

---

### 4. Database & Query Review

Kiểm tra:

- Foreign key usage
- Indexes
- Unique constraints
- Soft delete
- Cascade rules
- Query efficiency
- N+1 query risk
- Transaction missing
- Race condition

---

### 5. Security Review

Kiểm tra:

- Authentication
- Authorization
- Mass assignment
- Sensitive data exposure
- File upload validation
- Input sanitization
- Rate limiting

---

### 6. API Contract Review

Kiểm tra:

- HTTP status codes
- Response format consistency
- Error response consistency
- Pagination format
- Resource structure

---

### 7. Code Quality

Kiểm tra:

- Duplicate code
- Readability
- SOLID
- SRP
- Refactor opportunities

---

### 8. Test Coverage Review

Kiểm tra:

- Có test chưa
- Thiếu happy path nào
- Thiếu unhappy path nào
- Thiếu edge case nào

---

## Output format

# Critical Issues (must fix before merge)

- ...

---

# Warnings (should fix)

- ...

---

# Suggestions (optional improvements)

- ...

---

# Missing Tests

- ...

---

## Rules

- Không rewrite toàn bộ code
- Chỉ chỉ ra vấn đề
- Ưu tiên lỗi nghiêm trọng trước
- Giải thích ngắn gọn, cụ thể