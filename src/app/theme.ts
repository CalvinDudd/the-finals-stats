import { extendTheme } from "@chakra-ui/react";
import "@fontsource/saira"; // Import the font

const theme = extendTheme({
  fonts: {
    heading: "'Saira', sans-serif", // Set as a default heading font
    body: "system-ui, sans-serif",
  },
});

export default theme;
