import { useLocation } from "react-router-dom";
import workItems from "../entities/SideBar/WorkItems";
import NavLink from "./NavLink";
import IconSettings from "./icons/SideBar/IconSettings";
import IconLogout from "./icons/SideBar/IconLogout";
import IconScissors from "./icons/SideBar/IconScissors";
import IconBox from './icons/SideBar/IconBox';

export default function SidebarNav({
  isOpen,
  onClose,
  clinicShortName,
  clinicName,
  clinicLogo,
  userName,
  userRole,
  onLogout,
  counters,
}) {
  const location = useLocation();
  const pathname = location.pathname;

  const shortName = clinicShortName || clinicName;
  const logoLetter = clinicName?.[0]?.toUpperCase() || "P";
  const userInitials = (userName || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const catalogItems = [
    { href: "/services", label: "Услуги", icon: <IconScissors /> },
    { href: "/products", label: "Товары", icon: <IconBox /> },
  ];

  const otherItems = [
    { href: "/settings", label: "Настройки", icon: <IconSettings /> },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-49" onClick={onClose} />
      )}

      <aside
        className={[
          "fixed top-0 left-0 h-screen w-55 z-50 flex flex-col",
          "bg-zinc-50 border-r border-zinc-200",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:sticky md:top-0",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5 px-4 py-5.5 border-b border-zinc-200 shrink-0">
          <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-[13px] shrink-0 overflow-hidden">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt="logo"
                className="w-full h-full object-contain block"
              />
            ) : (
              logoLetter
            )}
          </div>
          <span className="font-semibold text-sm text-zinc-900 truncate">
            {shortName}
          </span>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto p-2">
          <SectionLabel>Работа</SectionLabel>
          {workItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          <SectionLabel>Каталог</SectionLabel>
          {catalogItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          <SectionLabel>Прочее</SectionLabel>
          {otherItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-200 shrink-0">
          <div className="flex items-center gap-2.5 p-1.5 rounded-md">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-[12px] shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-zinc-900 truncate">
                {userName}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {userRole}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Выйти"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 transition-colors [&_svg]:w-3.5 [&_svg]:h-3.5"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.5px] text-zinc-400 font-medium px-2 pt-2 pb-1.5">
      {children}
    </p>
  );
}
