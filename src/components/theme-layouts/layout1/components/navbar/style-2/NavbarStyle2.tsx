import { styled } from "@mui/material/styles";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import {
  navbarCloseFolded,
  navbarCloseMobile,
  navbarOpenFolded,
  resetNavbar,
  selectFuseNavbar,
} from "src/components/theme-layouts/components/navbar/navbarSlice";
import { useAppDispatch, useAppSelector } from "src/store/hooks";

import { Layout1ConfigDefaultsType } from "@/components/theme-layouts/layout1/Layout1Config";
import useFuseLayoutSettings from "@fuse/core/FuseLayout/useFuseLayoutSettings";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { Theme } from "@mui/system/createTheme";
import { useEffect } from "react";
import NavbarStyle2Content from "./NavbarStyle2Content";

const navbarWidth = 280;

type StyledNavBarPropsProps = {
  theme?: Theme;
  folded: number;
  open: boolean;
};

const Root = styled("div")<StyledNavBarPropsProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  zIndex: 4,
  [theme.breakpoints.up("lg")]: {
    width: navbarWidth,
    minWidth: navbarWidth,
  },
  variants: [
    {
      props: ({ folded }) => folded,
      style: {
        [theme.breakpoints.up("lg")]: {
          width: 76,
          minWidth: 76,
        },
      },
    },
  ],
}));

type StyledNavBarProps = {
  theme?: Theme;
  open?: boolean;
  folded: number;
  foldedandopened: number;
  foldedandclosed: number;
  position?: string;
  anchor?: string;
};

const StyledNavbar = styled("div")<StyledNavBarProps>(({ theme }) => ({
  minWidth: navbarWidth,
  width: navbarWidth,
  maxWidth: navbarWidth,
  maxHeight: "100%",
  transition: theme.transitions.create(["width", "min-width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter,
  }),
  variants: [
    {
      props: {
        position: "left",
      },
      style: {
        borderRight: `1px solid ${theme.palette.divider}`,
        left: 0,
      },
    },
    {
      props: {
        position: "right",
      },
      style: {
        borderLight: `1px solid ${theme.palette.divider}`,
        right: 0,
      },
    },
    {
      props: ({ folded }) => folded,
      style: {
        position: "absolute",
        width: 76,
        minWidth: 76,
        top: 0,
        bottom: 0,
      },
    },
    {
      props: ({ foldedandopened }) => foldedandopened,
      style: {
        width: navbarWidth,
        minWidth: navbarWidth,
      },
    },
    {
      props: ({ foldedandclosed }) => foldedandclosed,
      style: {
        "& .NavbarStyle2-content": {
          "& .logo-section": {
            padding: "12px 8px 12px 8px",
          },
          "& .logo-card": {
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          "& .logo-row": {
            justifyContent: "center",
            gap: 0,
          },
          "& .logo-wrapper": {
            flex: "none",
            minWidth: "auto",
          },
          "& .logo-icon": {
            width: 32,
            height: 32,
          },
          "& .logo-text": {
            opacity: 0,
            width: 0,
            overflow: "hidden",
            display: "none",
          },
          "& .pin-toggle-btn": {
            opacity: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            padding: 0,
            minWidth: 0,
            display: "none",
          },
          "& .react-badge": {
            opacity: 0,
          },
          "& .fuse-list-item": {
            width: 44,
            minHeight: 44,
            borderRadius: "12px",
            padding: "12px",
            justifyContent: "center",
            margin: "0 auto 4px auto",
          },
          "& .fuse-list-item-icon": {
            marginRight: 0,
          },
          "& .fuse-list-item-text, & .arrow-icon, & .item-badge": {
            opacity: 0,
            width: 0,
            overflow: "hidden",
            position: "absolute",
          },
          "& .fuse-list-subheader .fuse-list-subheader-text": {
            opacity: 0,
          },
          "& .fuse-list-subheader:before": {
            content: '""',
            display: "block",
            position: "absolute",
            minWidth: 16,
            borderTop: "2px solid",
            opacity: 0.2,
          },
          "& .collapse-children": {
            display: "none",
          },
          "& .user-section": {
            padding: "4px 8px 12px 8px",
          },
          "& .user-card": {
            padding: "4px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          "& .user-menu": {
            padding: "8px",
            justifyContent: "center",
            alignItems: "center",
            gap: 0,
            "& .avatar": {
              width: 32,
              height: 32,
            },
            "& .user-info": {
              display: "none",
            },
            "& .arrow": {
              display: "none",
            },
          },
        },
      },
    },
  ],
}));

const StyledNavbarMobile = styled(SwipeableDrawer)<StyledNavBarProps>(
  ({ theme }) => ({
    "& > .MuiDrawer-paper": {
      minWidth: navbarWidth,
      width: navbarWidth,
      maxWidth: navbarWidth,
      maxHeight: "100%",
      transition: theme.transitions.create(["width", "min-width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    },
  }),
);

/**
 * The navbar style 2.
 */
function NavbarStyle2() {
  const dispatch = useAppDispatch();

  const settings = useFuseLayoutSettings();
  const config = settings.config as Layout1ConfigDefaultsType;
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const navbar = useAppSelector(selectFuseNavbar);

  const folded = config.navbar?.folded;
  const foldedandclosed = folded && !navbar.foldedOpen;
  const foldedandopened = folded && navbar.foldedOpen;

  useEffect(() => {
    return () => {
      dispatch(resetNavbar());
    };
  }, [dispatch]);

  return (
    <Root
      folded={folded ? 1 : 0}
      open={navbar.open}
      id="fuse-navbar"
      className="sticky top-0 z-20 h-screen shrink-0"
    >
      {!isMobile && (
        <StyledNavbar
          className="hidden lg:flex sticky top-0 z-20 h-screen flex-auto shrink-0 flex-col overflow-hidden shadow-sm"
          position={config?.navbar?.position}
          folded={folded ? 1 : 0}
          foldedandopened={foldedandopened ? 1 : 0}
          foldedandclosed={foldedandclosed ? 1 : 0}
          onMouseEnter={() => foldedandclosed && dispatch(navbarOpenFolded())}
          onMouseLeave={() => foldedandopened && dispatch(navbarCloseFolded())}
        >
          <NavbarStyle2Content className="NavbarStyle2-content" />
        </StyledNavbar>
      )}

      {isMobile && (
        <StyledNavbarMobile
          classes={{
            root: "flex lg:hidden",
            paper: "flex-col flex-auto h-full",
          }}
          folded={folded ? 1 : 0}
          foldedandopened={foldedandopened ? 1 : 0}
          foldedandclosed={foldedandclosed ? 1 : 0}
          anchor={
            config?.navbar?.position as "left" | "top" | "right" | "bottom"
          }
          variant="temporary"
          open={navbar.mobileOpen}
          onClose={() => dispatch(navbarCloseMobile())}
          onOpen={() => {}}
          disableSwipeToOpen
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <NavbarStyle2Content className="NavbarStyle2-content" />
        </StyledNavbarMobile>
      )}
    </Root>
  );
}

export default NavbarStyle2;
