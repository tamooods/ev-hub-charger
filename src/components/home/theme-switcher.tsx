import { useMapContext } from "@/components/map/map-context";
import { MAP_THEMES } from "@/lib/map";

export function ThemeSwitcher() {
  const { themeId, setThemeId } = useMapContext();

  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1 rounded-lg bg-white p-1 shadow-lg">
      {MAP_THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setThemeId(theme.id)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            themeId === theme.id
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {theme.label}
        </button>
      ))}
    </div>
  );
}
