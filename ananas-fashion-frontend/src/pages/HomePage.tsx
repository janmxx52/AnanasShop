import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function HomePage() {
  return (
    <PagePlaceholder
      title="Trang chủ"
      description="Nền tảng frontend đã sẵn sàng. Bước tiếp theo là kết nối đầy đủ từng trang với API và component UI."
    >
      <div className="flex flex-wrap gap-2">
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/products">
          Xem sản phẩm
        </Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/cart">
          Mở giỏ hàng
        </Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/admin/dashboard">
          Bảng điều khiển quản trị
        </Link>
      </div>
    </PagePlaceholder>
  )
}
