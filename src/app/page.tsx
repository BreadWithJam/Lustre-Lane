import Link from 'next/link'
import Image from 'next/image'
import { FloatingBubbles } from '@/components/FloatingBubbles'
import warmCaramel from '@assets/images/warm caramel layers.jpg'
import sleekBob from '@assets/images/sleek bob with copper gloss.jpg'
import dimensionalBalayage from '@assets/images/dimensional balayage.jpg'
import editorialUpdo from '@assets/images/editorial updo.jpg'

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
  { src: warmCaramel, alt: 'Warm caramel layers' },
  { src: sleekBob, alt: 'Sleek bob with copper gloss' },
  { src: dimensionalBalayage, alt: 'Dimensional balayage' },
  { src: editorialUpdo, alt: 'Editorial updo' },
]

const contactChannels = [
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
      <section className="relative isolate overflow-hidden h-[70vh] min-h-[500px] flex items-center">
        {/* Background image */}
        <Image
          src="/salon.png"
          alt="Lustre Lane Salon interior"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient overlay — heavier left, fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/10" aria-hidden="true" />

        {/* Content — left aligned */}
        <div className="relative z-10 px-10 md:px-16 max-w-[520px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-salon-gold mb-3">
            Lustre Lane Salon
          </p>
          <h1 className="font-serif leading-[1.15] text-[2.6rem] md:text-[3rem]">
            <span className="font-bold text-white">Premium Hair &amp;</span>
            <br />
            <span className="italic font-bold text-salon-gold">Beauty</span>
          </h1>
          <p className="mt-4 text-[13.5px] leading-[1.7] text-white/75 max-w-[320px]">
            Expert stylists. Personalised care. Unforgettable results. Discover the ritual of
            self-care in an environment designed for total tranquility.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-salon-gold px-6 py-[11px] text-[13.5px] font-semibold text-salon-brown hover:bg-salon-gold/90 transition-colors"
            >
              Book a Consultation →
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center rounded-full px-6 py-[11px] text-[13.5px] font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Explore Services
            </Link>
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
        <div className="mx-auto max-w-6xl rounded-[32px] bg-salon-gold p-10 md:p-14" style={{ color: '#3a2800' }}>
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'rgba(58,40,0,0.55)' }}>
                Messaging
              </p>
              <h2 className="text-4xl font-serif font-bold leading-tight">
                Talk to a stylist<br />before you commit.
              </h2>
              <p className="mt-5 text-[13.5px] leading-[1.8] max-w-[320px]" style={{ color: 'rgba(58,40,0,0.65)' }}>
                Send inspiration photos, ask about maintenance, or confirm availability. Replies arrive via in-app message plus email notifications.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/chat"
                  className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
                  style={{ color: '#3a2800' }}
                >
                  Open Messenger
                </Link>
                <a
                  href="mailto:hello@salon.example"
                  className="rounded-full border px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/20 transition-colors"
                  style={{ color: '#3a2800', borderColor: 'rgba(58,40,0,0.25)', background: 'rgba(255,255,255,0.15)' }}
                >
                  Send Email
                </a>
              </div>
            </div>

            {/* Floating chat bubbles */}
            <FloatingBubbles />
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
