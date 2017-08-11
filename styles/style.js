import { Platform } from 'react-native';
import colors from './colors';

// Use Modular Scale to create harmony between various font sizes that we use (See http://www.modularscale.com/)
const fontSize = n => {
  const baseFontSize = 12;
  const multiplier = Platform.OS === 'ios' ? 1.618 : 1.4;
  if (n > 0) {
    return baseFontSize * (multiplier * n);
  } else if (n === 0) {
    return baseFontSize;
  } else {
    return baseFontSize / (multiplier * Math.abs(n));
  }
};
// TODO: Add font families
// Setup default fontFamily for all <Text> to be Roboto-Light

// Header styles

const headerTintColor = colors.tertiary;

const headerStyle = {
  backgroundColor: colors.primary,
  height: Platform.OS === 'ios' ? 80 : 100,
};

// H1

const h1Style = {
  fontSize: fontSize(2),
  letterSpacing: -1,
  color: colors.primary,
  fontFamily: 'roboto-black',
};

// Margins for all views

const mainViewStyle = {
  marginLeft: 30,
  marginRight: 20,
};

// TODO: Something for vertical rhythm

export default {
  fontSize,
  headerTintColor,
  headerStyle,
  mainViewStyle,
  h1Style,
};
