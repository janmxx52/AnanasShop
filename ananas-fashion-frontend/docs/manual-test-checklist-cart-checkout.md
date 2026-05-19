# Manual Test Checklist — Cart & Checkout

## Chuẩn bị
- Chạy frontend local (`npm run dev`) và backend local.
- Có sẵn dữ liệu sản phẩm/variant còn hàng.
- Có thể test cả guest và user đăng nhập.

## Cart UI / Data
- [ ] Guest thêm sản phẩm vào giỏ -> vào `/cart` thấy ảnh + tên + variant + giá + số lượng + thành tiền.
- [ ] User thêm sản phẩm vào giỏ -> vào `/cart` thấy ảnh + tên + variant + giá + số lượng + thành tiền.
- [ ] Ảnh ưu tiên từ dữ liệu item (nếu có), fallback mapping không bị vỡ.
- [ ] Layout desktop: danh sách sản phẩm bên trái, tóm tắt đơn hàng bên phải.
- [ ] Layout mobile: item hiển thị dạng card, summary nằm phía dưới, không vỡ UI.

## Quantity / Remove
- [ ] Bấm `+` tăng số lượng và giỏ cập nhật đúng.
- [ ] Bấm `-` giảm số lượng và giỏ cập nhật đúng.
- [ ] Nhập trực tiếp số lượng rồi blur/Enter -> cập nhật đúng.
- [ ] Nhập `0` -> item bị xóa khỏi giỏ.
- [ ] Bấm nút `Xóa` -> item bị xóa và có toast.
- [ ] Khi API trả lỗi stock/validation -> hiển thị lỗi rõ ràng.

## Empty State
- [ ] Xóa hết item -> hiển thị `Giỏ hàng của bạn đang trống`.
- [ ] Nút `Tiếp tục mua sắm` ở empty state điều hướng về `/products`.

## Checkout CTA
- [ ] Khi giỏ có item, bấm `Thanh toán` ở CartPage -> chuyển đúng sang `/checkout`.
- [ ] CartPage không submit order, không gọi checkout API trực tiếp.

## Checkout Regression
- [ ] `/checkout` vẫn load giỏ đúng sau khi điều hướng từ cart.
- [ ] Voucher vẫn apply ở CheckoutPage như cũ.
- [ ] Checkout success vẫn chuyển trang success như cũ.

## Guest/User Cart Regression
- [ ] Guest cart với `X-Guest-Token` vẫn hoạt động.
- [ ] User cart với `Bearer token` vẫn hoạt động.
