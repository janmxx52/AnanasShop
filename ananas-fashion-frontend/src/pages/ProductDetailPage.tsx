import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <PagePlaceholder
      title="Product Detail Page"
      description={`Placeholder for product detail and variants. Current slug: ${slug ?? 'unknown'}.`}
    />
  )
}
