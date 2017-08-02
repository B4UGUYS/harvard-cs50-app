import React from 'react';
import { Text, View } from 'react-native';
import styles, { colors, fontSize } from '../styles/style';
import { EvilIcons } from '@expo/vector-icons';
import CrossTouchable from './CrossTouchable';

class Row extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pressed: false };
  }

  render() {
    return (
      <CrossTouchable
        onPress={this.props.onPress}
        underlayColor={colors.primary}
        onPressIn={() => {
          this.setState({ pressed: true });
        }}
        onPressOut={() => {
          this.setState({ pressed: false });
        }}>
        <View
        style={{
          justifyContent: 'center',
          paddingTop: 20,
          paddingBottom: 20,
          marginLeft: styles.mainViewStyle.marginLeft,
          borderBottomWidth: 1,
          borderBottomColor: colors.primary,
        }}>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontFamily: 'roboto-light',
              fontSize: fontSize(1),
              color: this.state.pressed
                ? colors.complementary
                : colors.secondary,
              alignSelf: 'flex-start',
            }}>
            {this.props.text}
          </Text>
          <EvilIcons
            name="chevron-right"
            size={32}
            color={this.state.pressed ? colors.complementary : colors.secondary}
          />
        </View>
        </View>
      </CrossTouchable>
    );
  }
}

export default Row;
