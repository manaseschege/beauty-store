# Beauty Store — headless Shopify storefront

A React storefront for a Shopify dropshipping beauty store. **Shopify stays the back office:**
products, prices, inventory, orders, payments, taxes, shipping rates and customer emails
are all managed in Shopify admin. This site displays the catalogue and builds the cart,
then sends shoppers to Shopify's hosted, secure checkout.

```
Customer ──► this site (React) ──Storefront API──► Shopify
                 │                                  ├─ products / collections / stock
                 └── "Secure checkout" ───────────► ├─ checkout + payment
                                                    └─ order created in admin → supplier app fulfils
```

**Stack:** Vite · React 19 (JSX) · Ant Design 6 · Tailwind CSS 4 · TanStack Query · React Router · Framer Motion

## Run it

```bash
npm install
cp .env.example .env    # already done once; edit the values
npm run dev             # http://localhost:5173
npm run build           # production build in dist/
```

Without a token the site runs in **demo mode** on sample products (a yellow banner says so),
and checkout is disabled.

## Connect your Shopify store (about 5 minutes)

You do **not** need to share your Shopify password with anyone. The site only needs a
public, read-only *Storefront API token*.

1. In Shopify admin open **Sales channels → + → search "Headless"** and install the free
   **Headless** app by Shopify.
2. Open **Headless → Create storefront**.
3. In the storefront, go to **Storefront API → Manage** and make sure these permissions
   are on (they are by default): read products/variants/collections, read and modify
   checkouts/carts.
4. Copy the **Public access token**.
5. Put it in `.env`:
   ```
   VITE_SHOPIFY_STORE_DOMAIN=dkzv0p-4g.myshopify.com
   VITE_SHOPIFY_STOREFRONT_TOKEN=<public access token>
   VITE_STORE_NAME=Your Brand Name
   ```
6. Restart `npm run dev`. The demo banner disappears and your real products load.

### Make products show up
- Products must be **Active** and published to the **Headless** sales channel
  (product page → *Publishing* / *Sales channels*). Products imported by
  DSers / CJ / Shopify Collective need this too.
- Categories in the menu come from **Products → Collections**. Create collections such as
  `Skincare`, `Makeup`, `Haircare`, `Body Care`, and publish them to Headless too.
  Their handle becomes the URL: `/collections/skincare`.
- Tag a product `new` to show a "New" badge. A *compare-at price* shows a "Sale" badge.
- Inventory: if a variant has tracked stock at 0 (and "continue selling" is off),
  it shows as **Sold out** automatically.

### Payments
Enable payment providers in **Settings → Payments** (Shopify Payments, PayPal, etc.).
Because checkout runs on Shopify, whatever you enable there works here automatically.

## Deploying

`npm run build` produces a static site in `dist/`. Host it on Vercel, Netlify,
Cloudflare Pages or any static host. It's a single-page app, so configure the host to
serve `index.html` for unknown routes (Vercel/Netlify: "SPA fallback" / `_redirects` with
`/* /index.html 200`). Set the same `VITE_*` variables in the host's environment settings.

Then, in Shopify, go to **Settings → Domains** and **Online Store → Preferences**,
and point your custom domain at the new site. Also set the Online Store password
page / redirect so shoppers don't land on the default Shopify theme.

## Project layout

```
src/
  lib/shopify.js        Storefront API client, GraphQL queries, money formatting
  lib/catalog.js        product/collection reads (Shopify or demo data)
  context/CartContext   Shopify Cart API: add / update / remove / checkout / buy now
  data/demoCatalog.js   sample products used only in demo mode
  components/           Header, Footer, CartDrawer, ProductCard, ProductImage, …
  pages/                Home, Shop (all / collection / search), ProductPage, Help, NotFound
```

## Things to customise
- Hero text, perks and "Our promise" section: `src/pages/Home.jsx`
- Shipping/returns FAQ (match your supplier's real delivery times!): `src/pages/Help.jsx`
- Free-shipping threshold shown in the cart: `FREE_SHIPPING` in `src/components/CartDrawer.jsx`
  (set the matching rule in Shopify **Settings → Shipping**)
- Colours and fonts: `src/index.css` (`@theme`) and `src/theme.js` (AntD)
- Social links: `src/components/Footer.jsx`
- The newsletter form on the home page is UI only. Connect it to Shopify Email,
  Klaviyo or similar before relying on it.
