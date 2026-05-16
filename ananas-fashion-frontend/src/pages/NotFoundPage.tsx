import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function NotFoundPage() {
  return (
    <PagePlaceholder title="404 - Không tìm thấy trang" description="Đường dẫn bạn truy cập không tồn tại trong ứng dụng.">
      <Link className="text-sm font-medium text-slate-900 underline" to="/">
        Quay lại trang chủ
      </Link>
    </PagePlaceholder>
  )
}
