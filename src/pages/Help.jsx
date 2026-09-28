import { Collapse } from 'antd'
import { useTitle } from '../hooks/useTitle'

// Edit these answers to match your suppliers' real processing and delivery times.
const SECTIONS = [
  {
    id: 'shipping',
    title: 'Shipping',
    faqs: [
      ['How long does shipping take?', 'Orders are processed within 1–3 business days. Standard delivery usually takes 7–14 business days depending on your location.'],
      ['How much does shipping cost?', 'Shipping is free on orders over $50. Below that, the exact rate is shown at checkout before you pay.'],
      ['Do you ship internationally?', 'Yes — available countries and rates are shown at checkout once you enter your address.'],
    ],
  },
  {
    id: 'orders',
    title: 'Orders & tracking',
    faqs: [
      ['How do I track my order?', 'As soon as your order ships you’ll get an email from us with a tracking link. You can also open the order status page linked in your order confirmation email.'],
      ['Can I change or cancel my order?', 'Contact us within 12 hours of placing your order and we’ll do our best to update or cancel it before it ships.'],
      ['Which payment methods do you accept?', 'All major credit and debit cards, Shop Pay, Apple Pay and Google Pay. Payments are processed securely by Shopify — we never see your card details.'],
    ],
  },
  {
    id: 'returns',
    title: 'Returns & refunds',
    faqs: [
      ['What is your return policy?', 'If you’re not completely happy, you can request a return within 30 days of delivery. Items must be unused and in original packaging for hygiene reasons.'],
      ['My item arrived damaged — what now?', 'We’re sorry! Email us a photo within 7 days of delivery and we’ll send a replacement or full refund, no return needed.'],
      ['When will I get my refund?', 'Refunds go back to your original payment method within 5–10 business days of approval.'],
    ],
  },
]

export default function Help() {
  useTitle('Help & FAQ')
  return (
    <div className="container-page max-w-3xl py-14">
      <header className="mb-12 text-center">
        <p className="eyebrow mb-2">We’re here to help</p>
        <h1 className="text-5xl font-semibold sm:text-6xl">Help & FAQ</h1>
      </header>
      <div className="space-y-12">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="mb-4 text-3xl font-semibold">{s.title}</h2>
            <Collapse
              expandIconPlacement="end"
              className="bg-white"
              items={s.faqs.map(([q, a], i) => ({ key: i, label: <span className="font-medium">{q}</span>, children: <p className="text-muted">{a}</p> }))}
            />
          </section>
        ))}
      </div>
    </div>
  )
}
