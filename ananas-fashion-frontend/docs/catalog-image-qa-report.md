# Catalog Image QA Report

> Date: 2026-05-18  
> Scope: QA catalog seed + image mapping sau khi seed DB mới

## 1) Kiểm tra `image_url` từ seed dữ liệu

- Nguồn kiểm tra: bảng `product_images` sau `migrate:fresh --seed`
- Tổng số ảnh DB đã kiểm tra: **381**
- Số path lỗi (file không tồn tại trong `ananas-fashion-frontend/public`): **0**

Kết luận: toàn bộ `product_images.url` hiện tại đều map tới file thật.

## 2) Kiểm tra `productImageMap` path tồn tại thật

- File kiểm tra: `ananas-fashion-frontend/src/data/productImageMap.ts`
- Tổng số path unique đã kiểm tra: **382**  
  (bao gồm cả fallback trong `/ananas-assets/misc`)
- Số path lỗi: **0**

Kết luận: toàn bộ path trong mapping hiện có file thật.

## 3) QA logic ưu tiên ảnh `ProductCard`

Yêu cầu chuẩn:

1. API images nếu có
2. Local mapping nếu cần
3. Fallback cuối cùng

Fix đã áp dụng:

- Cập nhật `ananas-fashion-frontend/src/lib/product-images.ts` để `resolveProductCardImages` ưu tiên **API trước mapping**.

## 4) QA gallery `ProductDetailPage`

Fix đã áp dụng tại `ananas-fashion-frontend/src/lib/product-images.ts`:

- Chuẩn hóa danh sách ảnh bằng `normalizeImageList`:
  - loại bỏ giá trị rỗng
  - loại bỏ ảnh trùng URL
- Áp dụng cho cả source API và source mapping.

Kết quả:

- Tránh duplicate ảnh ở gallery detail.
- Ảnh chính luôn là phần tử đầu đã chuẩn hóa.

## 5) QA trường hợp product không match code/sku

- Resolver vẫn fallback an toàn:
  - API images (nếu có) → mapping (nếu match) → fallback category/global.
- Không có thay đổi gây crash trong flow này.

## 6) Tóm tắt chỉnh sửa

- `ananas-fashion-frontend/src/lib/product-images.ts`
  - đổi thứ tự ưu tiên ảnh cho `ProductCard`
  - thêm chuẩn hóa/deduplicate image list cho API + mapping.

Không thay đổi business logic backend, không đổi API contract, không redesign UI lớn.
