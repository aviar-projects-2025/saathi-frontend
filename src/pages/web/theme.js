import { createTheme } from '@mui/material/styles';

// Brand palette pulled from the Saathi reference design
// Values below were sampled directly (eyedropper) from the reference
// screenshot to match the source as closely as possible.
const colors = {
  navy: '#0B2350',        // primary deep navy (buttons, banner bg) - sampled rgb(5,32,75)-(13,39,76)
  navyDark: '#04122C',    // darker navy for hover / darkest sampled text rgb(0,5,43)
  navyText: '#04122C',    // headline text color
  orange: '#FA6423',      // primary accent orange - sampled rgb(253,100,37)
  orangeDark: '#E85315',
  green: '#1E8F3F',        // "approved" green - sampled rgb(25,126,60)
  skyLight: '#E7F0FB',    // light blue-tinted background - sampled rgb(229,238,247)
  paper: '#FFFFFF',
  textSecondary: '#5B6B7C',
  border: '#E3EAF1',
};

const theme = createTheme({
  palette: {
    primary: { main: colors.navy, dark: colors.navyDark },
    secondary: { main: colors.orange, dark: colors.orangeDark },
    background: { default: '#FFFFFF', paper: colors.paper },
    text: { primary: colors.navy, secondary: colors.textSecondary },
    divider: colors.border,
  },
  custom: colors,
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

export default theme;
export { colors };