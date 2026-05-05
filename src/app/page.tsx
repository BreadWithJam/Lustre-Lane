import Link from 'next/link'
import Image from 'next/image'
import { SearchBar } from '@/components/navigation/SearchBar'

const serviceHighlights = [
  {
    title: 'Signature Cuts',
    description: 'Tailored cuts designed around bone structure, lifestyle, and daily ritual.',
    duration: '45–60 min',
    price: 'from $120',
  },
  {
    title: 'Color Studio',
    description: 'Balayage, glossing, and tonal work with scalp-safe products.',
    duration: '90–150 min',
    price: 'from $220',
  },
  {
    title: 'Treatment Rituals',
    description: 'Repair, hydrate, and protect with keratin + bond-building services.',
    duration: '60–90 min',
    price: 'from $160',
  },
]

const galleryPreview = [
  { src: '/gallery/look-01.jpg', alt: 'Warm caramel layers' },
  { src: '/gallery/look-02.jpg', alt: 'Sleek bob with copper gloss' },
  { src: '/gallery/look-03.jpg', alt: 'Dimensional balayage' },
  { src: '/gallery/look-04.jpg', alt: 'Editorial updo' },
]

const contactChannels = [
  { label: 'Call', icon: '📞', href: 'tel:+15555550100' },
  { label: 'Message', icon: '💬', href: '/chat', isLink: true },
  { label: 'Email', icon: '✉️', href: 'mailto:hello@salon.example' },
  {
    label: 'Directions',
    icon: '📍',
    href: 'https://maps.google.com/?q=Lustre+Lane+Salon',
    external: true,
  },
]

export default function HomePage() {
  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-4 pt-24 pb-16 md:pt-32">
        <div className="mx-auto grid gap-12 md:grid-cols-[1.1fr,0.9fr] max-w-6xl">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-salon-warm-gray mb-4">Lustre Lane</p>
            <h1 className="text-4xl md:text-6xl font-serif leading-tight text-salon-brown">
              Modern hair artistry rooted in ritual and precision.
            </h1>
            <p className="mt-6 text-lg text-salon-warm-gray">
              Browse a curated service menu, preview seasonal color work, and message the studio team in one fluid experience.
            </p>

            <div className="mt-10 space-y-4">
              <SearchBar
                placeholder="Search services or styles"
                scope="global"
                className="shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
              />
              <div className="flex flex-wrap gap-3">
                <Link href="/chat" className="rounded-full bg-salon-brown px-6 py-3 text-sm font-semibold text-white">
                  Book an Appointment
                </Link>
                <Link
                  href="/gallery"
                  className="rounded-full border border-salon-brown px-6 py-3 text-sm font-semibold text-salon-brown hover:bg-salon-brown/5"
                >
                  View Gallery
                </Link>
                <a
                  href="tel:+15555550100"
                  className="rounded-full border border-salon-brown px-6 py-3 text-sm font-semibold text-salon-brown hover:bg-salon-brown/5"
                >
                  Call Studio
                </a>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-br from-salon-cream/40 via-white/30 to-salon-gold/25 opacity-90 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[28px] border border-white/40 bg-salon-cream shadow-[0_30px_80px_rgba(38,20,8,0.18)] flex flex-col gap-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 opacity-90 backdrop-blur-sm" aria-hidden="true" />
              <div className="relative p-8 space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-salon-warm-gray mb-2">Sessions This Week</p>
                  <p className="text-5xl font-serif text-salon-brown">48</p>
                </div>
                <div className="space-y-3">
                  {[ 'Cuts & Shaping', 'Color Studio', 'Editorial Styling' ].map((item) => (
                    <div key={item} className="flex items-center justify-between text-sm text-salon-warm-gray">
                      <span>{item}</span>
                      <span className="text-salon-brown">Available</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-inner backdrop-blur">
                  <p className="text-sm text-salon-warm-gray">Chat directly with a stylist for custom recommendations.</p>
                  <Link
                    href="/chat"
                    className="mt-3 inline-flex items-center text-sm font-semibold text-salon-brown hover:text-salon-gold"
                  >
                    Start a conversation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-salon-cream bg-salon-cream/40 py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {[
            { label: 'Returning guests', value: '82%' },
            { label: 'Average response time', value: '11 min' },
            { label: 'Ratings', value: '4.9 / 5' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-serif text-salon-brown">{stat.value}</p>
              <p className="text-sm uppercase tracking-[0.3em] text-salon-warm-gray">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:items-start">
          <div className="md:w-1/3">
            <p className="text-sm uppercase tracking-[0.3em] text-salon-warm-gray">Services</p>
            <h2 className="mt-4 text-3xl font-serif text-salon-brown">Tailored sessions for every texture.</h2>
            <p className="mt-4 text-salon-warm-gray">
              Explore curated services with transparent pricing and estimated timing. Save favorites or message the team for advice.
            </p>
            <Link href="/services" className="mt-6 inline-flex items-center text-sm font-semibold text-salon-brown">
              View full service menu →
            </Link>
          </div>
          <div className="md:w-2/3 space-y-4">
            {serviceHighlights.map((service) => (
              <article
                key={service.title}
                className="rounded-3xl border border-salon-cream p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-serif text-salon-brown">{service.title}</h3>
                  <span className="text-sm text-salon-warm-gray">{service.duration}</span>
                </div>
                <p className="mt-3 text-salon-warm-gray">{service.description}</p>
                <p className="mt-6 text-sm uppercase tracking-[0.3em] text-salon-brown">{service.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-salon-warm-gray">Style Gallery</p>
              <h2 className="mt-2 text-3xl font-serif text-salon-brown">Seasonal color, cuts, and editorials.</h2>
            </div>
            <Link href="/gallery" className="text-sm font-semibold text-salon-brown">
              Explore gallery →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {galleryPreview.map((item) => (
              <figure key={item.alt} className="group relative overflow-hidden rounded-3xl border border-salon-cream">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={400}
                  height={520}
                  className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white">
                  {item.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Messaging Highlight */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-salon-brown text-white p-10 md:p-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Messaging</p>
              <h2 className="mt-4 text-3xl font-serif">Talk to a stylist before you commit.</h2>
              <p className="mt-4 text-white/80">
                Send inspiration photos, ask about maintenance, or confirm availability. Replies arrive via in-app message plus email notifications.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/chat" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-salon-brown">
                  Open Messenger
                </Link>
                <a
                  href="mailto:hello@salon.example"
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Send Email
                </a>
              </div>
            </div>
            <div className="rounded-[28px] bg-white/5 p-6 backdrop-blur">
              <div className="space-y-4">
                {[
                  'Can I blend this copper tone with my natural base?',
                  'Looking for a low-maintenance cut before summer travel.',
                  'Do you have openings for a treatment + gloss next week?',
                ].map((message) => (
                  <div key={message} className="rounded-2xl bg-white/10 p-4 text-sm text-white/90">
                    {message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="border-t border-salon-cream px-4 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-salon-warm-gray">Visit / Connect</p>
          <h2 className="mt-3 text-3xl font-serif text-salon-brown">The studio is open Tuesday–Sunday.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {contactChannels.map((channel) => {
              const className =
                'flex items-center gap-2 rounded-full border border-salon-brown px-6 py-3 text-sm font-semibold text-salon-brown hover:bg-salon-brown hover:text-white transition-colors'
              if (channel.isLink) {
                return (
                  <Link key={channel.label} href={channel.href} className={className}>
                    <span aria-hidden="true">{channel.icon}</span>
                    {channel.label}
                  </Link>
                )
              }
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={channel.external ? '_blank' : undefined}
                  rel={channel.external ? 'noopener noreferrer' : undefined}
                  className={className}
                >
                  <span aria-hidden="true">{channel.icon}</span>
                  {channel.label}
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
