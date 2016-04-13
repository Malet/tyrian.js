let PublicState = require('../lib/public_state');

class Ship extends PublicState {
  _initialState(props) {
    let ship = {
      x: 0,
      y: 0,
      width: 18,
      height: 25,
      armor: 100,
      destroyedOn: null,
      gun: {
        firing: false,
        firingInterval: 7,
        lastFired: 0
      }
    };
    ship.x = (props.width / 2) - (ship.width / 2);

    return ship;
  }
}

module.exports = Ship;
