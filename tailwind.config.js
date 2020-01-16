module.exports = {
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px"
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.2em"
    },
    inset: {
      "0": 0,
      "1/2": "50%"
    }
  },
  variants: {
    textColor: ["responsive", "hover", "focus", "visited"],
    textDecoration: ["responsive", "hover", "focus", "visited"],
    margin: ["responsive", "first"]
  }
};
