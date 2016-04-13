let PublicState = require('../lib/public_state');
let Ship = require('./ship');

class Game extends PublicState {
  _initialState(props) {
    let ship = new Ship(props);

    this.pointer = { x: ship.x, y: ship.y };
    this.firing = false;

    return {
      paused: false,
      godMode: false,
      levelEndedOn: null,
      ship: ship,
      bullets: [],
      enemies: [],
      effects: [],
      bulletSeq: 0,
      enemySeq: 0,
      effectsSeq: 0,
      points: 0,
      cullMargin: 10,
      level: {
        progress: 0,
        complete: false,
        parallax: 0
      }
    };
  }
}

module.exports = Game;
