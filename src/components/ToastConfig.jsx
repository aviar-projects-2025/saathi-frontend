import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const ToastConfig = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return {
    position: isMobile ? "top-center" : "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeButton: false,
    style: {
      width: isMobile ? "90vw" : "360px",
      maxWidth: isMobile ? "320px" : "360px",
      fontSize: isMobile ? "13px" : "15px",
      padding: isMobile ? "8px 12px" : "12px 16px",
      borderRadius: isMobile ? "8px" : "10px",
      minHeight: isMobile ? "42px" : "52px",
      margin: "0 auto",
    },
  };
};

export default ToastConfig;