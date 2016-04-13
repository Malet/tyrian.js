class PublicState {
  constructor(props) {
    Object.assign(this, this._initialState(props));
  }

  _initialState(props) {
    return {};
  }
}

module.exports = PublicState;
