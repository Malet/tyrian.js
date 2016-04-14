let React = require('react');

module.exports = class InterfaceComponent extends React.Component {
  render() {
    return <div className="interface">
      <div className="shield" style={this._shieldStyle()}></div>
      <div className="armor" style={this._armorStyle()}></div>
    </div>;
  }

  _armorStyle() {
    return {
      height: Math.round((this.props.armor / 100) * 58)
    };
  }
  _shieldStyle() {
    return {
      height: Math.round((this.props.shield.current / 100) * 58)
    };
  }
};
