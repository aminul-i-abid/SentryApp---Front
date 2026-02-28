import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import useUser from "@auth/useUser";
import { useMediaQuery, useTheme } from "@mui/material";

export default function TopbarHeader() {
  const { data: user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const firstName = user?.displayName?.split(" ")[0] || "";

  return (
    <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-white/6">
      <div className="flex items-center gap-4">
        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            ¡Bienvenido de nuevo, {firstName}!
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Que tengas un buen dia. Consulte su Panel de Control.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-black dark:bg-gray-700 text-white dark:text-white flex items-center justify-center font-bold text-md">
            {firstName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="hidden lg:block">
            <p className="text-lg text-slate-700 font-bold dark:text-slate-100 leading-tight mb-0.5">
              ¡{user?.displayName || ""}!
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-400">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
