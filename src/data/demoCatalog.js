// Sample catalogue used only while no Storefront token is configured (demo mode).
// Objects mirror the Shopify Storefront API shape so the UI treats both sources the same.
// Images are null on purpose: the UI draws a styled placeholder instead.

const USD = (amount) => ({ amount: String(amount), currencyCode: 'USD' })

const collections = [
  { handle: 'skincare', title: 'Skincare', description: 'Serums, cleansers and moisturisers for every skin type.' },
  { handle: 'makeup', title: 'Makeup', description: 'Lightweight colour that lets your skin breathe.' },
  { handle: 'haircare', title: 'Haircare', description: 'Nourishing oils and masks for soft, shiny hair.' },
  { handle: 'body-care', title: 'Body Care', description: 'Rich butters, scrubs and mists from head to toe.' },
].map((c, i) => ({ ...c, id: `gid://demo/Collection/${i + 1}`, image: null }))

function product(n, p) {
  const optionName = p.optionName ?? 'Size'
  const values = p.values ?? ['Standard']
  const variants = values.map((v, i) => ({
    id: `gid://demo/ProductVariant/${n}${i}`,
    title: v,
    availableForSale: !(p.soldOut ?? []).includes(v),
    selectedOptions: [{ name: optionName, value: v }],
    price: USD(p.prices?.[i] ?? p.price),
    compareAtPrice: p.compareAt ? USD(p.compareAt) : null,
    image: null,
  }))
  const prices = variants.map((v) => Number(v.price.amount))
  return {
    id: `gid://demo/Product/${n}`,
    handle: p.handle,
    title: p.title,
    vendor: 'Lumière',
    productType: p.type,
    collection: p.collection,
    tags: p.tags ?? [],
    createdAt: `2026-0${(n % 9) + 1}-01`,
    bestSellerRank: p.rank ?? 99,
    availableForSale: variants.some((v) => v.availableForSale),
    description: p.description,
    descriptionHtml: `<p>${p.description}</p><ul>${(p.bullets ?? []).map((b) => `<li>${b}</li>`).join('')}</ul>`,
    featuredImage: null,
    images: { nodes: [] },
    options: [{ name: optionName, optionValues: values.map((name) => ({ name })) }],
    priceRange: { minVariantPrice: USD(Math.min(...prices)), maxVariantPrice: USD(Math.max(...prices)) },
    compareAtPriceRange: { minVariantPrice: USD(p.compareAt ?? 0) },
    variants: { nodes: variants },
    seo: { title: p.title, description: p.description },
  }
}

const products = [
  product(1, {
    handle: 'vitamin-c-glow-serum', title: 'Vitamin C Glow Serum', type: 'Serum', collection: 'skincare',
    price: 34, prices: [34, 52], values: ['30 ml', '50 ml'], compareAt: 42, rank: 1, tags: ['bestseller', 'vegan'],
    description: 'A brightening 15% vitamin C serum that fades dark spots and restores a lit-from-within glow.',
    bullets: ['15% stabilised vitamin C', 'Ferulic acid + vitamin E', 'Fragrance free'],
  }),
  product(2, {
    handle: 'hyaluronic-hydra-cream', title: 'Hyaluronic Hydra Cream', type: 'Moisturiser', collection: 'skincare',
    price: 29, rank: 2, tags: ['bestseller'],
    description: 'Whipped gel-cream with three weights of hyaluronic acid for 72-hour hydration without shine.',
    bullets: ['Non-comedogenic', 'Suitable for sensitive skin', '50 ml'],
  }),
  product(3, {
    handle: 'gentle-foaming-cleanser', title: 'Gentle Foaming Cleanser', type: 'Cleanser', collection: 'skincare',
    price: 18, rank: 6, tags: ['vegan'],
    description: 'A pH-balanced amino-acid cleanser that lifts makeup and SPF while keeping the skin barrier happy.',
    bullets: ['Sulphate free', 'Green tea + oat extract', '150 ml'],
  }),
  product(4, {
    handle: 'retinol-night-renewal', title: 'Retinol Night Renewal', type: 'Serum', collection: 'skincare',
    price: 39, rank: 8, tags: ['new'],
    description: 'Encapsulated 0.3% retinol smooths texture and fine lines overnight with minimal irritation.',
    bullets: ['Slow-release retinol', 'Squalane + ceramides', '30 ml'],
  }),
  product(5, {
    handle: 'velvet-matte-lipstick', title: 'Velvet Matte Lipstick', type: 'Lipstick', collection: 'makeup',
    price: 22, optionName: 'Shade', values: ['Rosewood', 'Classic Red', 'Nude Petal', 'Berry'], soldOut: ['Berry'],
    rank: 3, tags: ['bestseller'],
    description: 'Comfortable full-coverage matte colour that stays put for up to 8 hours without drying lips.',
    bullets: ['Shea butter core', 'Transfer resistant', '3.5 g'],
  }),
  product(6, {
    handle: 'skin-tint-spf30', title: 'Dewy Skin Tint SPF 30', type: 'Foundation', collection: 'makeup',
    price: 32, optionName: 'Shade', values: ['Fair', 'Light', 'Medium', 'Tan', 'Deep'], rank: 5, tags: ['new'],
    description: 'Sheer, buildable coverage with broad-spectrum SPF 30 and a natural dewy finish.',
    bullets: ['SPF 30 mineral filters', 'Niacinamide', '40 ml'],
  }),
  product(7, {
    handle: 'lengthening-mascara', title: 'Lift & Lengthen Mascara', type: 'Mascara', collection: 'makeup',
    price: 19, compareAt: 24, rank: 7,
    description: 'A flexible fibre formula that lifts and separates lashes for a clump-free, all-day look.',
    bullets: ['Smudge proof', 'Ophthalmologist tested', '9 ml'],
  }),
  product(8, {
    handle: 'argan-repair-hair-oil', title: 'Argan Repair Hair Oil', type: 'Hair Oil', collection: 'haircare',
    price: 26, rank: 4, tags: ['bestseller', 'vegan'],
    description: 'Cold-pressed argan and camellia oils tame frizz and add mirror shine without weighing hair down.',
    bullets: ['Heat protection to 230°C', 'Silicone free', '100 ml'],
  }),
  product(9, {
    handle: 'deep-conditioning-mask', title: 'Deep Conditioning Mask', type: 'Hair Mask', collection: 'haircare',
    price: 24, rank: 10, soldOut: ['Standard'],
    description: 'A weekly treatment with keratin and shea to repair dry, colour-treated or damaged hair.',
    bullets: ['Colour safe', '5-minute treatment', '200 ml'],
  }),
  product(10, {
    handle: 'whipped-body-butter', title: 'Whipped Body Butter', type: 'Body Butter', collection: 'body-care',
    price: 21, optionName: 'Scent', values: ['Vanilla Bean', 'Coconut', 'Unscented'], rank: 9, tags: ['vegan'],
    description: 'Cloud-light shea and cocoa butter that melts in for soft skin that lasts all day.',
    bullets: ['Fast absorbing', 'Cruelty free', '250 ml'],
  }),
  product(11, {
    handle: 'coffee-body-scrub', title: 'Coffee Body Scrub', type: 'Scrub', collection: 'body-care',
    price: 17, rank: 11, tags: ['new'],
    description: 'Arabica coffee grounds and brown sugar buff away dullness for smoother, brighter skin.',
    bullets: ['Natural exfoliants', 'Sweet almond oil', '200 g'],
  }),
  product(12, {
    handle: 'rose-facial-mist', title: 'Rose Facial Mist', type: 'Toner', collection: 'skincare',
    price: 16, rank: 12,
    description: 'A refreshing Bulgarian rose water mist to hydrate, set makeup and revive skin on the go.',
    bullets: ['Alcohol free', 'Travel friendly', '100 ml'],
  }),
]

export const demoCatalog = { products, collections }
