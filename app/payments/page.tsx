import Link from "next/link";

export default function PaymentsOverview() {
  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-12 flex flex-col md:flex-row items-center gap-12 shadow-sm mb-10">
        <div className="flex-1 space-y-8">
          <div>
            <p className="text-slate-500 font-bold text-sm mb-2">
              Square Invoices
            </p>
            <h1 className="text-6xl font-bold leading-tight tracking-tight">
              Send your first invoice and get paid faster
            </h1>
          </div>
          <Link
            href="/payments/invoices/new"
            className="inline-block bg-black text-white px-10 py-3.5 rounded-full font-bold hover:bg-zinc-800 transition-all text-sm"
          >
            Create an invoice
          </Link>
        </div>
        <div className="flex-1 bg-blue-50 rounded-2xl aspect-video border border-blue-100 flex items-center justify-center">
          <div className="w-2/3 h-2/3 bg-white rounded shadow-lg border p-4">
            <div className="h-2 w-12 bg-slate-100 mb-4" />
            <div className="h-4 w-24 bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Facilitate quicker payments",
            link: "Create an invoice",
            href: "/payments/invoices/new",
          },
          {
            title: "Protect your business",
            link: "Explore contracts",
            href: "#",
          },
          { title: "Win more work", link: "Create an estimate", href: "#" },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white border rounded-[32px] p-8 space-y-4"
          >
            <div className="h-40 bg-slate-50 rounded-2xl mb-6" />
            <h3 className="font-bold text-xl">{f.title}</h3>
            <Link
              href={f.href}
              className="text-sm font-bold border-b-2 border-black inline-block pb-0.5"
            >
              {f.link}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
