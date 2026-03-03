import { useAppDispatch } from "@/store/hooks";
import UseJwtAuth from "@auth/services/jwt/useJwtAuth";
import useUser from "@auth/useUser";
import useFuseLayoutSettings from "@fuse/core/FuseLayout/useFuseLayoutSettings";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { FuseSettingsConfigType } from "@fuse/core/FuseSettings/FuseSettings";
import {
  changeThemeMode,
  useMainTheme,
} from "@fuse/core/FuseSettings/hooks/fuseThemeHooks";
import useFuseSettings from "@fuse/core/FuseSettings/hooks/useFuseSettings";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Link from "@fuse/core/Link";
import useI18n from "@i18n/useI18n";
import Popover, { PopoverProps } from "@mui/material/Popover/Popover";
import clsx from "clsx";
import { useState } from "react";
import { selectFuseNavbar } from "src/components/theme-layouts/components/navbar/navbarSlice";
import { useAppSelector } from "src/store/hooks";

type UserMenuProps = {
  className?: string;
  popoverProps?: Partial<PopoverProps>;
  arrowIcon?: string;
};

/**
 * The user menu.
 */
function UserMenu(props: UserMenuProps) {
  const jwtAuthContext = UseJwtAuth();
  const { signOut } = jwtAuthContext;
  const { className, popoverProps, arrowIcon: _arrowIcon } = props;
  const { data: user, isGuest, updateUserSettings } = useUser();
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
  const { setSettings, data: currentSettings } = useFuseSettings();
  const mainTheme = useMainTheme();
  const isDarkMode = mainTheme.palette.mode === "dark";
  const { languages, changeLanguage } = useI18n();
  const dispatch = useAppDispatch();
  const [langMenu, setLangMenu] = useState<HTMLElement | null>(null);
  const navbar = useAppSelector(selectFuseNavbar);
  const { config } = useFuseLayoutSettings();
  const folded = config?.navbar?.folded;
  const foldedClosed = Boolean(folded && !navbar.foldedOpen);

  const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenu(event.currentTarget);
  };

  const userMenuClose = () => {
    setUserMenu(null);
  };

  const handleDarkModeToggle = async () => {
    const newMode = isDarkMode ? "light" : "dark";
    const newTheme = changeThemeMode(currentSettings.theme.main, newMode);
    const _newSettings = setSettings({
      theme: {
        main: newTheme,
        navbar: newTheme,
        toolbar: newTheme,
        footer: newTheme,
      },
    } as Partial<FuseSettingsConfigType>);

    if (!isGuest) {
      const updatedUserData = await updateUserSettings(_newSettings);

      if (updatedUserData) {
        dispatch(
          showMessage({
            message:
              newMode === "dark"
                ? "Modo oscuro activado"
                : "Modo claro activado",
          }),
        );
      }
    }
  };

  const handleLanguageChange = (langId: string) => {
    changeLanguage(langId);
    setLangMenu(null);
    userMenuClose();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* ── Bottom user trigger button ── */}
      <button
        type="button"
        className={clsx(
          "group user-menu flex items-center w-full shrink-0 rounded-xl p-2.5 gap-3 text-left cursor-pointer transition-all duration-200",
          "hover:bg-gray-100/80 dark:hover:bg-white/[0.06]",
          "active:scale-[0.98]",
          className,
        )}
        onClick={userMenuClick}
      >
        {/* Avatar */}
        {user?.photoURL ? (
          <img
            className={`avatar w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-white/10 transition-all ${foldedClosed ? "ml-2.5" : ""}`}
            src={user.photoURL}
            alt="user photo"
          />
        ) : (
          <div
            className={`avatar w-10 h-10 rounded-full bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-white/10 transition-all ${foldedClosed ? "ml-2.5" : ""}`}
          >
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Name + email */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="title text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
            ¡{user?.displayName}!
          </span>
          <span className="subtitle text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5">
            {user?.email}
          </span>
        </div>

        {/* Chevron icon (hidden when navbar is folded+closed) */}
        {!foldedClosed && (
          <span className="arrow flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 shrink-0 border border-gray-200 dark:bg-gray-400 dark:border-white/20">
            <img
              src="/assets/icons/arrow-left-double.png"
              alt="menu"
              className="w-3.5 h-3.5 opacity-50 rotate-180"
            />
          </span>
        )}
      </button>

      {/* ── Main popover ── */}
      <Popover
        open={Boolean(userMenu)}
        anchorEl={userMenu}
        onClose={userMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              borderRadius: "14px",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
              border: "5px solid #f7f7f7",
              minWidth: 220,
              maxWidth: 260,
              p: 2,
              ml: "220px",
              overflow: "hidden",
              backdropFilter: "blur(20px)",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              ...theme.applyStyles("dark", {
                border: "5px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(30, 30, 30, 0.9)",
              }),
            }),
          },
        }}
        {...popoverProps}
      >
        {isGuest ? (
          <div className="flex flex-col">
            <Link
              to="/sign-in"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors no-underline text-inherit"
              onClick={userMenuClose}
            >
              <FuseSvgIcon
                size={18}
                className="text-gray-500 dark:text-gray-400"
              >
                heroicons-outline:lock-closed
              </FuseSvgIcon>
              <span className="text-[13px] font-medium">Sign In</span>
            </Link>
            <Link
              to="/sign-up"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors no-underline text-inherit"
              onClick={userMenuClose}
            >
              <FuseSvgIcon
                size={18}
                className="text-gray-500 dark:text-gray-400"
              >
                heroicons-outline:user-plus
              </FuseSvgIcon>
              <span className="text-[13px] font-medium">Sign up</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* ── Mi Perfil ── */}
            {/* <button
              type="button"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer bg-transparent border-none w-full text-left"
              onClick={userMenuClose}
            >
              <FuseSvgIcon
                size={18}
                className="text-gray-500 dark:text-gray-400 shrink-0"
              >
                heroicons-outline:user
              </FuseSvgIcon>
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 flex-1">
                Mi Perfil
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-[15px] font-semibold tracking-tight shrink-0">
                &#xBB;&#x203A;
              </span>
            </button> */}

            {/* ── ajuste (highlighted pill) ── */}
            {/* <div className="px-2 py-0.5">
              <button
                type="button"
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border-none w-full text-left transition-all duration-200",
                  "bg-[#f7f7f7] dark:bg-white/[0.12]",
                  "dark:hover:bg-white/[0.18]",
                  "active:scale-[0.98]",
                )}
                onClick={userMenuClose}
              >
                <FuseSvgIcon
                  size={18}
                  className="text-black/90 dark:text-white/90 shrink-0"
                >
                  heroicons-outline:cog-6-tooth
                </FuseSvgIcon>
                <span className="text-[13px] font-semibold text-black dark:text-white flex-1">
                  ajuste
                </span>
              </button>
            </div> */}

            {/* ── modo oscuro ── */}
            {/* <button
              type="button"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer bg-transparent border-none w-full text-left"
              onClick={handleDarkModeToggle}
            >
              <FuseSvgIcon
                size={18}
                className="text-gray-500 dark:text-gray-400 shrink-0"
              >
                {isDarkMode
                  ? "heroicons-outline:moon"
                  : "heroicons-outline:sun"}
              </FuseSvgIcon>
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 flex-1">
                modo oscuro
              </span> */}
            {/* Toggle switch */}
            {/* <div
                role="switch"
                aria-checked={isDarkMode}
                className={clsx(
                  "relative w-[36px] h-[20px] rounded-full shrink-0 transition-colors duration-200 cursor-pointer",
                  isDarkMode ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDarkModeToggle();
                }}
              >
                <div
                  className={clsx(
                    "absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200",
                    isDarkMode ? "translate-x-[18px]" : "translate-x-[2px]",
                  )}
                />
              </div> */}
            {/* </button> */}

            {/* ── Idioma ── */}
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer bg-transparent border-none w-full text-left"
              onClick={(e) => setLangMenu(e.currentTarget)}
            >
              <FuseSvgIcon
                size={18}
                className="text-gray-500 dark:text-gray-400 shrink-0"
              >
                heroicons-outline:globe-alt
              </FuseSvgIcon>
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 flex-1">
                Idioma
              </span>
            </button>

            {/* ── Cerrar sesión Perfil ── */}
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer bg-transparent border-none w-full text-left"
              onClick={() => {
                signOut();
                userMenuClose();
              }}
            >
              <FuseSvgIcon
                size={18}
                className="text-gray-500 dark:text-gray-400 shrink-0"
              >
                heroicons-outline:arrow-right-on-rectangle
              </FuseSvgIcon>
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 flex-1">
                Cerrar sesión Perfil
              </span>
            </button>
          </div>
        )}
      </Popover>

      {/* ── Language sub-popover ── */}
      <Popover
        open={Boolean(langMenu)}
        anchorEl={langMenu}
        onClose={() => setLangMenu(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
              border: "1px solid",
              borderColor: "divider",
              minWidth: 170,
              py: 0.75,
              overflow: "hidden",
            },
          },
        }}
      >
        {languages.map((lng) => (
          <button
            key={lng.id}
            type="button"
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none w-full text-left"
            onClick={() => handleLanguageChange(lng.id)}
          >
            <img
              className="w-5 h-5 rounded-sm object-cover shrink-0"
              src={`/assets/images/flags/${lng.flag}.svg`}
              alt={lng.title}
            />
            <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
              {lng.title}
            </span>
          </button>
        ))}
      </Popover>
    </>
  );
}

export default UserMenu;
