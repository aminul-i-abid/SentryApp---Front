import GoToDocBox from "@/components/theme-layouts/components/GoToDocBox";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import FuseScrollbars from "@fuse/core/FuseScrollbars";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { memo } from "react";
import Navigation from "src/components/theme-layouts/components/navigation/Navigation";
import UserMenu from "src/components/theme-layouts/components/UserMenu";
import Logo from "../../../../components/Logo";

const Root = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
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

type NavbarStyle1ContentProps = {
  className?: string;
};

/**
 * The navbar style 1 content.
 */
function NavbarStyle1Content(props: NavbarStyle1ContentProps) {
  const { className = "" } = props;

  return (
    <Root
      className={clsx(
        "flex h-full flex-auto flex-col overflow-hidden",
        className,
      )}
    >
      <div className="px-3 pt-3 pb-1 w-full">
        <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 p-1.5">
          <div className="flex-1 min-w-0">
            <Logo />
          </div>
          <NavbarToggleButton className="w-8 h-8 rounded-full border-none bg-gray-100 hover:bg-gray-200 dark:hover:bg-white/[0.06] shrink-0">
            <img
              src="/assets/icons/arrow-left-double.png"
              alt="collapse"
              className="w-4 h-4 opacity-60"
            />
          </NavbarToggleButton>
        </div>
      </div>

      <StyledContent
        className="flex min-h-0 flex-1 flex-col"
        option={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <Navigation layout="vertical" />

        <div className="shrink-0 flex items-center justify-center py-12 opacity-10">
          <img
            className="w-full max-w-16"
            src="/assets/images/logo/logo.svg"
            alt="footer logo"
          />
        </div>
      </StyledContent>

      <GoToDocBox className="mx-3 my-4" />

      <div className="px-3 pb-3 pt-1 w-full">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 p-1.5">
          <UserMenu className="w-full" />
        </div>
      </div>
    </Root>
  );
}

export default memo(NavbarStyle1Content);
