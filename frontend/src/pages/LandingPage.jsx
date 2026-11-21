const upcomingCards = [
  {
    title: 'Dashboard',
    description:
      'Live stock totals and low-stock alerts for your organization.',
    hint: 'Coming in Step 9',
  },
  {
    title: 'Products',
    description: 'Create, update, and manage your inventory products.',
    hint: 'Coming in Step 10',
  },
  {
    title: 'Settings',
    description: 'Organization preferences and low-stock thresholds.',
    hint: 'Coming later',
  },
]

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Welcome
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          StockFlow
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A SaaS inventory management workspace. The frontend foundation is in
          place and will connect to the Django REST API in the upcoming steps.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {card.title}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Soon
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <p className="mt-4 text-xs font-medium text-indigo-600">
              {card.hint}
            </p>
          </article>
        ))}
      </section>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500">
        The dashboard and product management screens will become available in
        later steps once the API integration is added.
      </div>
    </div>
  )
}
