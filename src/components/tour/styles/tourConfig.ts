import { Styles } from "react-joyride";
import { COLORS } from "../../../constants/theme";

export const TOUR_STYLES: Styles = {
  options: {
    arrowColor: COLORS.primary.DEFAULT,
    backgroundColor: "#fff",
    overlayColor: "rgba(8, 60, 56, 0.85)",
    primaryColor: COLORS.primary.DEFAULT,
    textColor: COLORS.primary.DEFAULT,
    zIndex: 1000,
    spotlightPadding: 16,
  },
  tooltipContainer: {
    textAlign: "left",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)",
    maxWidth: "420px",
    width: "100%",
    backgroundColor: "#fff",
    border: "1px solid rgba(0, 0, 0, 0.1)",
  },
  buttonNext: {
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: COLORS.primary.DEFAULT,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: COLORS.primary[700],
      transform: "translateY(-1px)",
    },
  },
  buttonBack: {
    marginRight: "10px",
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "transparent",
    border: `1px solid ${COLORS.primary.DEFAULT}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    color: COLORS.primary.DEFAULT,
    transition: "all 0.2s",
    "&:hover": {
      borderColor: COLORS.primary[700],
      color: COLORS.primary[700],
      transform: "translateY(-1px)",
    },
  },
  buttonSkip: {
    padding: "10px",
    fontSize: "14px",
    color: COLORS.primary.DEFAULT,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
    "&:hover": {
      color: COLORS.primary[700],
    },
  },
  tooltip: {
    fontSize: "14px",
    lineHeight: 1.6,
  },
  tooltipTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "12px",
    color: "#111827",
  },
  tooltipContent: {
    marginBottom: "20px",
    color: "#4B5563",
    fontSize: "15px",
  },
  spotlight: {
    backgroundColor: "transparent",
    border: `2px solid ${COLORS.primary.DEFAULT}`,
    borderRadius: "12px",
  },
};

export const TOUR_LOCALE = {
  back: "Previous",
  close: "Close",
  last: "Got it!",
  next: "Next",
  skip: "Skip tour",
};
