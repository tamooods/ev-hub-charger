import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-slate-200 bg-white px-4 py-2.5">
      <Link href="/" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="EV Hub Charger"
          className="h-7 w-7 rounded-full object-cover"
        />
        <span className="text-sm font-bold text-slate-900">
          EV Hub Charger
        </span>
      </Link>
      <nav className="flex items-center gap-0.5 text-sm">
        <Link
          href="/"
          className="rounded-md px-2.5 py-1.5 font-medium text-blue-600 hover:bg-blue-50"
        >
          แผนที่
        </Link>
        <Link
          href="/planner"
          className="rounded-md px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
        >
          วางแผนเส้นทาง
        </Link>
        <Link
          href="/add-station"
          className="rounded-md px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
        >
          เพิ่มสถานี
        </Link>
      </nav>
    </header>
  );
}
