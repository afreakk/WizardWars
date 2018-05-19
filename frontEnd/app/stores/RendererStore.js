// template : https://github.com/erikras/ducks-modular-redux

const windowSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  stageCenter: {x: window.innerWidth / 2, y: window.innerHeight / 2}
});

const defaultState = {
  canvasHeight: 1920,
  canvasWidth: 1080,
  canvasCenter: {x: 1920 / 2, y: 1080 / 2},
  ...windowSize()
};

const RESIZE = 'seed/animation/TICK';

export default (state = defaultState, action = {}) => {
  switch (action.type) {
    case RESIZE:
      return {...state, ...windowSize()};
    default:
      return state;
  }
};

export const resize = () => ({type: RESIZE});
