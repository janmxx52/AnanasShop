# Manual Test Checklist â€” Phase 5 (Wishlist + Reviews)

## Preconditions
- Run backend API server and frontend dev server.
- Prepare at least:
  - 1 guest session
  - 1 customer account
  - Products with active variants
  - Delivered order item data for review creation tests

## 1) Wishlist

### 1.1 Guest cannot wishlist
- Open product list/detail as guest.
- Click `Add wishlist`.
- Expected:
  - Redirect to `/login` (or login required flow).
  - No wishlist mutation without login.

### 1.2 User toggle wishlist
- Login as customer.
- From product list/detail, click `Add wishlist`.
- Expected:
  - Success message shown.
  - Button changes to `Remove wishlist`.
- Click again.
- Expected:
  - Product removed from wishlist.
  - Button changes back to `Add wishlist`.

### 1.3 Wishlist list/remove
- Open `/wishlist`.
- Expected:
  - Only current user's wishlist items.
  - Pagination works when many items.
- Click `Remove` on an item.
- Expected:
  - Item disappears after reload/refetch.

## 2) Reviews (public + authenticated actions)

### 2.1 Public review list
- Open product detail as guest.
- Expected:
  - Review list visible (public).
  - Loading/error/empty states render correctly.

### 2.2 Create review with delivered order item
- Login as customer.
- Open product detail.
- Fill review form:
  - `order_item_id` from delivered order item of current user
  - rating 1-5
  - optional comment
- Submit.
- Expected:
  - Success message.
  - Review list refetches and includes new review.

### 2.3 Rating invalid
- Submit rating outside range (or force invalid payload).
- Expected:
  - Validation error shown for `rating`.

### 2.4 Max 3 images
- Attach 4+ images in review form.
- Expected:
  - Frontend keeps max 3 selected.
  - Backend validation errors shown if payload still invalid.

### 2.5 Delete own review
- On own review item, click `Delete`.
- Expected:
  - API delete success.
  - Review list refetches and removed review no longer appears.
- Verify cannot delete other users' review (button hidden / API rejects).
