import { Platform } from 'react-native';

// Colors

export const colors = {
  primary: '#6E001C', // crimson
  secondary: '#A41034',
  tertiary: '#FD9E71',
};

// Fonts

export const fontSize = n => {
  const baseFontSize = 12;
  const multiplier = 1.618;
  return baseFontSize * (multiplier * n);
};

export const fonts = {
  'roboto-light': require('../assets/fonts/Roboto-Light.ttf'),
  'roboto-bold': require('../assets/fonts/Roboto-Bold.ttf'),
  'roboto-black': require('../assets/fonts/Roboto-Black.ttf'),
};

// TODO: Add font families
// Setup default fontFamily for all <Text> to be Roboto-Light

// Header styles

export const headerTintColor = colors.tertiary;

export const headerStyle = {
  backgroundColor: colors.primary,
  height: Platform.OS === 'ios' ? 80 : 100,
};

// Margins for all views

export const mainViewStyle = {
  marginLeft: 20,
  marginRight: 20,
};

// TODO: Something for vertical rhythm

export default (styles = {
  colors,
  fontSize,
  fonts,
  headerTintColor,
  headerStyle,
  mainViewStyle,
});
