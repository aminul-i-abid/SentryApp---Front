import FuseScrollbars from "@fuse/core/FuseScrollbars";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { memo } from "react";
import NavbarPinToggleButton from "src/components/theme-layouts/components/navbar/NavbarPinToggleButton";
import Navigation from "src/components/theme-layouts/components/navigation/Navigation";
import UserMenu from "src/components/theme-layouts/components/UserMenu";
import Logo from "../../../../components/Logo";

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  color: theme.palette.text.primary,
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.background.default,
  }),
  "& ::-webkit-scrollbar-thumb": {
    boxShadow: `inset 0 0 0 20px ${"rgba(255, 255, 255, 0.24)"}`,
    ...theme.applyStyles("light", {
      boxShadow: `inset 0 0 0 20px ${"rgba(0, 0, 0, 0.24)"}`,
    }),
  },
  "& ::-webkit-scrollbar-thumb:active": {
    boxShadow: `inset 0 0 0 20px ${"rgba(255, 255, 255, 0.37)"}`,
    ...theme.applyStyles("light", {
      boxShadow: `inset 0 0 0 20px ${"rgba(0, 0, 0, 0.37)"}`,
    }),
  },
}));

const StyledContent = styled(FuseScrollbars)(() => ({
  overscrollBehavior: "contain",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 40px, 100% 10px",
  backgroundAttachment: "local, scroll",
}));

type NavbarStyle2ContentProps = {
  className?: string;
};

/**
 * The navbar style 2 content.
 */
function NavbarStyle2Content(props: NavbarStyle2ContentProps) {
  const { className = "" } = props;

  return (
    <Root
      className={clsx(
        "flex h-full flex-auto flex-col overflow-hidden",
        className,
      )}
    >
      {/* Top section: Logo + collapse button + search wrapped in bordered card */}
      <div className="shrink-0 px-3 pt-3 pb-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 p-2">
          {/* Logo row */}
          <div className="flex items-center gap-1.5 my-2">
            <div className="flex-1 min-w-0">
              <Logo />
            </div>
            <NavbarPinToggleButton
              className="w-8 h-8 border border-gray-200 dark:border-white/20 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] shrink-0 p-0"
              sx={{ borderRadius: "50% !important" }}
            >
              <img
                src="/assets/icons/arrow-left-double.png"
                alt="collapse"
                className="w-4 h-4 opacity-50"
              />
            </NavbarPinToggleButton>
          </div>

          {/* Search bar */}
          {/* <InputBase
            placeholder="Buscar..."
            startAdornment={
              <FuseSvgIcon size={18} className="mr-2" color="action">
                heroicons-outline:magnifying-glass
              </FuseSvgIcon>
            }
            sx={(theme) => ({
              width: "100%",
              height: 36,
              borderRadius: "8px",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "#F3F4F6",
              padding: "0 12px",
              fontSize: "13px",
              "& input::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
            })}
          /> */}
        </div>
      </div>

      <StyledContent
        className="flex min-h-0 flex-1 flex-col pt-4"
        option={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <Navigation layout="vertical" />
      </StyledContent>

      <div className="px-3 pb-3 pt-1 w-full">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 p-1.5">
          <UserMenu className="w-full" />
        </div>
      </div>
    </Root>
  );
}

export default memo(NavbarStyle2Content);
