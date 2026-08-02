import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          EV
        </span>
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
