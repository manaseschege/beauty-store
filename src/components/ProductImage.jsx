import clsx from 'clsx'

const GRADIENTS = [
  ['#f9e9e6', '#e7b3ab'],
  ['#f6ede3', '#e2c3a0'],
  ['#efe9f4', '#c9b3dc'],
  ['#e9f1ec', '#aecdb8'],
  ['#fbeee8', '#f0b9a6'],
  ['#f3ecea', '#cfa9a3'],
]

function hash(str = '') {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** Shopify image with a CDN-sized src, or a soft branded placeholder when a product has no photo. */
export default function ProductImage({ image, alt, seed, width = 800, className, hoverImage }) {
  if (image?.url) {
    const sized = (url) => `${url}${url.includes('?') ? '&' : '?'}width=${width}`
    return (
      <div className={clsx('relative overflow-hidden bg-blush-100', className)}>
        <img
          src={sized(image.url)}
          alt={image.altText || alt}
          loading="lazy"
          className={clsx('h-full w-full object-cover transition duration-700', hoverImage && 'group-hover:opacity-0')}
        />
        {hoverImage?.url && (
          <img
            src={sized(hoverImage.url)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100"
          />
        )}
      </div>
    )
  }

  const [from, to] = GRADIENTS[hash(seed || alt) % GRADIENTS.length]
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx('relative flex items-center justify-center overflow-hidden', className)}
      style={{ background: `radial-gradient(circle at 30% 20%, ${from}, ${to})` }}
    >
      <svg viewBox="0 0 120 160" className="h-1/2 w-1/2 drop-shadow-lg transition duration-700 group-hover:scale-105">
        <rect x="45" y="8" width="30" height="22" rx="4" fill="#2b1f22" opacity="0.85" />
        <rect x="50" y="28" width="20" height="10" fill="#ffffff" opacity="0.7" />
        <rect x="28" y="38" width="64" height="112" rx="16" fill="#ffffff" opacity="0.75" />
        <rect x="40" y="78" width="40" height="30" rx="4" fill={to} opacity="0.9" />
      </svg>
      {width > 200 && <span className="absolute bottom-3 left-0 right-0 truncate px-3 text-center font-display text-sm text-ink/60">
        {alt}
      </span>}
    </div>
  )
}
