import { Link } from 'react-router-dom'
import { App, Button, Tag, Tooltip } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import ProductImage from './ProductImage'
import Price from './Price'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, index = 0 }) {
  const { addItem, openCart } = useCart()
  const { message } = App.useApp()
  const min = product.priceRange.minVariantPrice
  const max = product.priceRange.maxVariantPrice
  const compareAt = product.compareAtPriceRange?.minVariantPrice
  const onSale = compareAt && Number(compareAt.amount) > Number(min.amount)
  const variants = product.variants?.nodes ?? []
  // Quick add only makes sense when there is a single variant (no shade/size to pick).
  const quickVariant = variants.length === 1 ? variants[0] : null

  async function quickAdd(e) {
    e.preventDefault()
    try {
      await addItem(quickVariant.id, 1, {
        price: min,
        variantTitle: 'Default Title',
        productTitle: product.title,
        handle: product.handle,
        image: product.featuredImage,
      })
      openCart()
    } catch (err) {
      message.error(err.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
    >
      <Link to={`/products/${product.handle}`} className="group block">
        <div className="relative">
          <ProductImage
            image={product.featuredImage}
            hoverImage={product.images?.nodes?.[1]}
            alt={product.title}
            seed={product.handle}
            width={600}
            className="aspect-[4/5] rounded-2xl"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {!product.availableForSale && <Tag color="default" className="m-0">Sold out</Tag>}
            {product.availableForSale && onSale && <Tag color="#b4536a" className="m-0">Sale</Tag>}
            {product.tags?.includes('new') && <Tag className="m-0 bg-white">New</Tag>}
          </div>
          {quickVariant && product.availableForSale && quickVariant.availableForSale !== false && (
            <Tooltip title="Add to bag">
              <Button
                shape="circle"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={quickAdd}
                aria-label={`Add ${product.title} to bag`}
                className="!absolute bottom-3 right-3 translate-y-2 opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100"
              />
            </Tooltip>
          )}
        </div>
        <div className="mt-3 space-y-1 px-1">
          {product.productType && <p className="text-xs uppercase tracking-wider text-muted">{product.productType}</p>}
          <h3 className="font-sans text-[15px] font-medium leading-snug group-hover:text-rosewood">{product.title}</h3>
          <Price price={min} compareAt={onSale ? compareAt : null} from={min.amount !== max.amount} className="text-sm" />
        </div>
      </Link>
    </motion.div>
  )
}
