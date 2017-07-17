import React from 'react';
import { ScreenOrientation } from 'expo';
import _ from 'lodash';
import { Text, View, Dimensions, ScrollView } from 'react-native';
import styles from '../styles/style';
import VideoPlayer from '../components/VideoPlayer';
import Row from '../components/Row';

class WeekScreen extends React.Component {
  state = {
    isPortrait: true,
  };

  static navigationOptions = ({ navigation }) => ({
    title: `Week ${navigation.state.params.weekNum}`,
    headerTintColor: styles.headerTintColor,
    headerStyle: styles.headerStyle,
  });

  constructor() {
    super();
    this.orientationChangeHandler = this.orientationChangeHandler.bind(this);
    this.saveToDisk = this.saveToDisk.bind(this);
  }

  saveToDisk(url) {
    console.log('Save to disk', url);
  }

  orientationChangeHandler(dims) {
    const { width, height } = dims.window;
    this.setState({ isPortrait: height > width });
  }

  // Only on this screen, allow landscape orientations
  componentDidMount() {
    ScreenOrientation.allow(ScreenOrientation.Orientation.ALL);
    Dimensions.addEventListener('change', this.orientationChangeHandler);
  }

  componentWillUnmount() {
    ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT);
    Dimensions.removeEventListener('change', this.orientationChangeHandler);
  }

  onButtonPress = url => {
    this.props.navigation.navigate('Link', { url: url });
  };

  render() {
    const data = this.props.navigation.state.params.data;

    var linkKeys = ['slides', 'source code', 'notes'];
    var links = _.pickBy(data, (v, k) => linkKeys.includes(k));

    return (
      <ScrollView
        containerStyle={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexDirection: 'column',
          paddingTop: 20,
        }}>
        <VideoPlayer
          sources={data.videos}
          id={data.title}
          isPortrait={this.state.isPortrait}
        />
        {/*
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
          }}>
          <TouchableHighlight
            style={{ display: this.state.isPortrait ? 'flex' : 'none' }}
            onPress={() => {
              this.saveToDisk(this.props.sources['240p']);
            }}>
            <Text>
              save for offline {this.state.isPortrait.toString()}
            </Text>
          </TouchableHighlight>
        </View>*/}
        <View
          style={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexDirection: 'column',
            display: this.state.isPortrait ? 'flex' : 'none',
            marginLeft: 20,
            marginRight: 20,
          }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
            course materials
          </Text>
          {_.map(links, (url, name) => {
            return (
              <Row
                key={url}
                text={name}
                onPress={() => this.onButtonPress(url)}
              />
            );
          })}
        </View>
      </ScrollView>
    );
  }
}

export default WeekScreen;
