import { useAppSelector } from "@/store/hooks";
import useFuseLayoutSettings from "@fuse/core/FuseLayout/useFuseLayoutSettings";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import logo from "../../../assets/logo/logo_2.png";
import { selectFuseNavbar } from "./navbar/navbarSlice";
const Root = styled("div")(({ theme }) => ({
  "& > .logo-icon": {
    transition: theme.transitions.create(["width", "height"], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  "& > .badge": {
    transition: theme.transitions.create("opacity", {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}));

/**
 * The logo component.
 */
function Logo() {
  const navbar = useAppSelector(selectFuseNavbar);
  const { config } = useFuseLayoutSettings();
  const folded = config?.navbar?.folded;
  const foldedClosed = Boolean(folded && !navbar.foldedOpen);
  return (
    <Root className="flex flex-1 items-center">
      <div className="flex flex-1 items-center gap-2 px-2.5 transition-all duration-200">
        <img
          className={`logo-icon h-8 w-8 shrink-0 transition-all duration-200 ${foldedClosed ? "ml-2.5" : ""}`}
          src={logo}
          alt="logo"
        />
        <div className="logo-text flex flex-col flex-auto gap-0.5 transition-all duration-200 overflow-hidden">
          <Typography className="text-[15px] tracking-tight font-semibold leading-none whitespace-nowrap">
            Entrada
          </Typography>
          <Typography
            className="text-[11px] font-normal leading-none whitespace-nowrap"
            color="text.secondary"
          >
            Bienes raíces
          </Typography>
        </div>
      </div>
    </Root>
  );
}

export default Logo;
