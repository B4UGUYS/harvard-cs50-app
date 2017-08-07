import React from 'react';
import { Audio, Video } from 'expo';
import {
  View,
  Dimensions,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Animated,
  Text,
  Slider,
} from 'react-native';
import config from '../utils/config';
import { colors, fontSize } from '../styles/style';

var CONTROL_STATES = {
  SHOWN: 1,
  SHOWING: 2,
  HIDDEN: 3,
  HIDING: 4,
};

export default class VideoPlayer extends React.Component {
  static defaultProps = {
    showingDuration: 200,
    hidingFastDuration: 200,
    hidingSlowDuration: 1000,
    hidingTimerDuration: 4000,
  };

  constructor() {
    super();
    this.state = {
      // All of this state comes from the playbackCallback
      muted: false,
      playbackInstancePosition: null,
      playbackInstanceDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isBuffering: false,
      volume: 1.0,
      poster: false,
      // Other state
      isLoading: true,
      fullscreen: false,
      // Seekbar related state
      isSeeking: false,
      // shouldPlayAtEndOfSeek
      controlsOpacity: new Animated.Value(0),
      controlsState: CONTROL_STATES.HIDDEN,
      // Replay state,
      replayState: false,
    };
  }

  async componentDidMount() {
    // Set audio mode to play even in silent mode (like the YouTube app)
    try {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // TODO(Abi): Switch back to INTERRUPTION_MODE_IOS_DO_NOT_MIX
        playsInSilentModeIOS: config.muteVideo ? false : true,
        shouldDuckAndroid: true, // TODO(Abi): Is this the common behavior on Android?
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });
    } catch (e) {
      // TODO: Handle rejection of the returned promise
      // Show a message to the user that Audio could not be setup
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPortrait !== this.props.isPortrait) {
      this.setState({ fullscreen: !nextProps.isPortrait });
    }

    if (
      nextProps.playFromPositionMillis !== this.props.playFromPositionMillis &&
      config.autoplayVideo &&
      this._playbackInstance !== null
    ) {
      // TODO: Ignore errors here?
      this._playbackInstance.playFromPositionAsync(
        nextProps.playFromPositionMillis
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this.controlsTimer);
  }

  _playbackCallback(playbackStatus) {
    try {
      this.props.playbackCallback &&
        this.props.playbackCallback(playbackStatus);
    } catch (e) {
      // TODO
      console.error('Error in user playbackCallback', e);
    }

    if (!playbackStatus.isLoaded) {
      // TODO: Handle playback errors
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
      }
    } else {
      // TODO: Handle playback errors
      this.setState({
        playbackInstancePosition: playbackStatus.positionMillis,
        playbackInstanceDuration: playbackStatus.durationMillis,
        isLoading: false,
        shouldPlay: playbackStatus.shouldPlay,
        isPlaying: playbackStatus.isPlaying,
        isBuffering: playbackStatus.isBuffering,
        muted: playbackStatus.isMuted,
        volume: playbackStatus.volume,
      });

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        this.setState({ replayState: true });
      }
    }
  }

  // Seeking
  _getSeekSliderPosition() {
    if (
      this._playbackInstance != null &&
      this.state.playbackInstancePosition != null &&
      this.state.playbackInstanceDuration != null
    ) {
      return (
        this.state.playbackInstancePosition /
        this.state.playbackInstanceDuration
      );
    }
    return 0;
  }

  _onSeekSliderValueChange = value => {
    if (this._playbackInstance != null && !this.state.isSeeking) {
      this.setState({ isSeeking: true });
      this.setState({ shouldPlayAtEndOfSeek: this.state.shouldPlay });
      this._playbackInstance.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async value => {
    if (this._playbackInstance != null) {
      this.setState({ isSeeking: false });
      const seekPosition = value * this.state.playbackInstanceDuration;
      if (this.state.shouldPlayAtEndOfSeek) {
        this._playbackInstance.playFromPositionAsync(seekPosition);
      } else {
        this._playbackInstance.setPositionAsync(seekPosition);
      }
    }
  };

  _onSeekBarTap = value => {};

  // Controls view
  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  }

  // Controls Behavior

  _replay() {
    this._playbackInstance.setStatusAsync({
      shouldPlay: true,
      positionMillis: 0,
    });
    this.setState({ replayState: false });
  }

  _togglePlay() {
    this.state.isPlaying
      ? this._playbackInstance.pauseAsync()
      : this._playbackInstance.playAsync();
  }

  _toggleControls = () => {
    switch (this.state.controlsState) {
      case CONTROL_STATES.SHOWN:
        this.setState({ controlsState: CONTROL_STATES.HIDING });
        this._hideControls(true);
        break;
      case CONTROL_STATES.HIDDEN:
        this._showControls();
        this.setState({ controlsState: CONTROL_STATES.SHOWING });
        break;
      case CONTROL_STATES.HIDING:
        this.setState({ controlsState: CONTROL_STATES.SHOWING });
        this._showControls();
        break;
      case CONTROL_STATES.SHOWING:
        break;
    }
  };

  _showControls = () => {
    this.showingAnimation = Animated.timing(this.state.controlsOpacity, {
      toValue: 1,
      duration: this.props.showingAnimation,
      useNativeDriver: true,
    });

    this.showingAnimation.start(({ finished }) => {
      if (finished) {
        this.setState({ controlsState: CONTROL_STATES.SHOWN });
        this.controlsTimer = setTimeout(
          this._onTimerDone.bind(this),
          this.props.hidingTimerDuration
        );
      }
    });
  };

  _hideControls = (immediate = false) => {
    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
    }
    this.hideAnimation = Animated.timing(this.state.controlsOpacity, {
      toValue: 0,
      duration: immediate
        ? this.props.hidingFastDuration
        : this.props.hidingSlowDuration,
      useNativeDriver: true,
    });
    this.hideAnimation.start(({ finished }) => {
      if (finished) {
        this.setState({ controlsState: CONTROL_STATES.HIDDEN });
      }
    });
  };

  _onTimerDone = () => {
    this.setState({ controlsState: CONTROL_STATES.HIDING });
    this._hideControls();
  };

  _resetControlsTimer = () => {
    // TODO: Handle the fact that a control can be touched, when in CONTROL_STATES.HIDING
    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
    }
    this.controlsTimer = setTimeout(
      this._onTimerDone.bind(this),
      this.props.hidingTimerDuration
    );
  };

  render() {
    const videoWidth = Dimensions.get('window').width;
    const videoHeight = videoWidth * (9 / 16);
    const centerIconWidth = 48;

    const showSpinner =
      this.state.isBuffering ||
      this.state.isLoading ||
      (this.state.shouldPlay && !this.state.isPlaying);

    const hidePlayPauseButton = this.state.isSeeking;

    const showPauseButton =
      this.state.isPlaying ||
      (this.state.isSeeking && this.state.shouldPlayAtEndOfSeek);

    const overlayTextStyle = {
      color: colors.complementary,
      fontFamily: 'roboto-light',
      fontSize: fontSize(0),
    };

    const Control = ({ callback, children, ...otherProps }) =>
      <TouchableHighlight
        {...otherProps}
        underlayColor="transparent"
        hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
        activeOpacity={0.3}
        onPress={() => {
          this._resetControlsTimer();
          callback();
        }}>
        {children}
      </TouchableHighlight>;

    const CenterIcon = ({ children }) =>
      <View
        style={{
          position: 'absolute',
          left: (videoWidth - centerIconWidth) / 2,
          top: (videoHeight - centerIconWidth) / 2,
        }}>
        {children}
      </View>;

    return (
      <TouchableWithoutFeedback onPress={() => this._toggleControls()}>
        <View
          style={{
            marginBottom: 20,
            backgroundColor: 'black',
          }}>
          <Video
            source={{
              uri: this.props.uri,
            }}
            ref={component => (this._playbackInstance = component)}
            resizeMode={Video.RESIZE_MODE_CONTAIN}
            callback={this._playbackCallback.bind(this)}
            style={{
              width: videoWidth,
              height: videoHeight,
            }}
            shouldPlay={config.autoplayVideo}
            isMuted={config.muteVideo}
          />

          {showSpinner &&
            <CenterIcon>
              {this.props.spinner}
            </CenterIcon>}

          {this.state.replayState &&
            <CenterIcon>
              <Control callback={this._replay.bind(this)}>
                {this.props.replayIcon}
              </Control>
            </CenterIcon>}

          {!showSpinner &&
            !hidePlayPauseButton &&
            <Animated.View
              pointerEvents={
                this.state.controlsState === CONTROL_STATES.HIDDEN
                  ? 'none'
                  : 'auto'
              }
              style={{
                opacity: this.state.controlsOpacity,
                position: 'absolute',
                left: (videoWidth - centerIconWidth) / 2,
                top: (videoHeight - centerIconWidth) / 2,
              }}>
              <Control callback={this._togglePlay.bind(this)}>
                {showPauseButton ? this.props.pauseIcon : this.props.playIcon}
              </Control>
            </Animated.View>}

          <Animated.View
            pointerEvents={
              this.state.controlsState === CONTROL_STATES.HIDDEN
                ? 'none'
                : 'auto'
            }
            style={{
              alignItems: 'stretch',
              flex: 2,
              justifyContent: 'flex-start',
              width: videoWidth,
              position: 'absolute',
              bottom: 0,
              opacity: this.state.controlsOpacity,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={[overlayTextStyle, { marginLeft: 5 }]}>
                {this._getMMSSFromMillis(this.state.playbackInstancePosition)}
              </Text>
              <Slider
                style={{ flex: 2, marginRight: 10, marginLeft: 10 }}
                trackImage={this.props.trackImage}
                thumbImage={this.props.thumbImage}
                value={this._getSeekSliderPosition()}
                onValueChange={this._onSeekSliderValueChange}
                onSlidingComplete={this._onSeekSliderSlidingComplete}
                disabled={this.state.isLoading}
              />
              <Text style={[overlayTextStyle, { marginRight: 5 }]}>
                {this._getMMSSFromMillis(this.state.playbackInstanceDuration)}
              </Text>
              <Control
                callback={() => {
                  this.props.isPortrait
                    ? this.props.onFullscreen()
                    : this.props.onUnFullscreen();
                }}>
                {this.state.fullscreen
                  ? this.props.fullscreenExitIcon
                  : this.props.fullscreenEnterIcon}
              </Control>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
