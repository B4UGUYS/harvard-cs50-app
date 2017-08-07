import React from 'react';
import {
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  Platform,
  Image,
} from 'react-native';
import { colors, fontSize } from '../styles/style';
import CrossTouchable from './CrossTouchable';

class WeekBox extends React.Component {
  render() {
    const textStyle = { color: colors.primary, fontSize: fontSize(2) };
    return (
      <CrossTouchable onPress={this.props.onPress}>
        <View
          style={{
            paddingTop: 50,
            paddingBottom: 50,
            marginTop: 10,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: colors.primary,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: this.props.imageWidth,
              alignItems: 'center',
            }}>
            <Image
              source={require('../assets/memory.png')}
              fadeDuration={0}
              style={{ width: 50, height: 60 }}
            />
            {/* <AnimatedIcon /> */}
          </View>
          <View
            style={{
              width: this.props.textWidth,
              alignItems: 'flex-start',
            }}>
            <Text style={textStyle} numberOfLines={1}>
              {this.props.title}
            </Text>
            <Text style={textStyle} numberOfLines={1}>
              {this.props.desc}
            </Text>
          </View>
        </View>
      </CrossTouchable>
    );
  }
}

export default WeekBox;
