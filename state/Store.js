import { createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { REHYDRATE } from 'redux-persist/constants';
import { AsyncStorage } from 'react-native';

const CURRENT_REDUX_VERSION = 1;

const reducer = (state = 0, action) => {
  const { type, id } = action;

  if (type === REHYDRATE) {
    if (persistedStateIsInvalid(action.payload)) {
      console.log(getInitialState());
      return getInitialState();
    } else {
      // if (CURRENT_REDUX_VERSION != action.payload._version) {
      //   // Run migrations
      //   // Copy playback, courseData
      //   // For offline, you can change the states, etc.
      // }
      console.log(action.payload);
      return action.payload;
    }
  } else {
    let entry = {};
    switch (type) {
      case 'OFFLINE':
        entry[id] = action.state;
        let newState = {
          ...state,
          offline: { ...state.offline, ...entry },
        };
        return newState;
      case 'PLAYBACK':
        entry[id] = action.time;
        return {
          ...state,
          playback: { ...state.playback, ...entry },
        };
      case 'SET_DATA':
        return {
          ...state,
          courseData: action.data,
        };
      default:
        return state;
    }
  }
};

const getInitialState = () => {
  return {
    offline: {},
    playback: {},
    courseData: {},
    _version: CURRENT_REDUX_VERSION,
  };
};

function persistedStateIsInvalid(state) {
  return Object.keys(state).length === 0;
}

const Store = createStore(
  reducer,
  getInitialState(),
  autoRehydrate({ log: true })
);

Store.rehydrateAsync = () => {
  return new Promise(resolve => {
    persistStore(
      Store,
      { storage: AsyncStorage, debounce: 500, blacklist: ['courseData'] },
      () => {
        resolve();
      }
    );
  });
};

export default Store;
