import { Link } from "react-router-dom";

export default function NavLink({ item, pathname }) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      to={item.href}
      className={[
        "relative w-full flex items-center gap-2.5 px-2 py-1.75 rounded-md text-[13px] mb-px transition-colors duration-100",
        "[&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0",
        isActive
          ? "bg-blue-50 text-blue-600 font-medium [&_svg]:opacity-100"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 [&_svg]:opacity-70",
      ].join(" ")}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 rounded-full -ml-2" />
      )}

      {item.icon}

      <span className="flex-1 min-w-0 truncate">{item.label}</span>

      {item.counter && (
        <span
          className={[
            "inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold shrink-0 leading-none",
            item.counter.tone === "muted"
              ? "bg-zinc-100 text-zinc-500"
              : item.counter.tone === "warning"
              ? "bg-amber-500 text-white"
              : "bg-blue-600 text-white",
          ].join(" ")}
        >
          {item.counter.text}
        </span>
      )}
    </Link>
  );
}