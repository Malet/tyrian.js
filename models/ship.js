class Ship {
  constructor(props) {
    let initialState = this._initialState(props);
    Object.keys(initialState).forEach(key => {
      this[key] = initialState[key];
    });
  }

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
