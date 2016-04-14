let React = require('react');

module.exports = class InterfaceComponent extends React.Component {
  render() {
    return <div className="interface">
      <div className="shield"></div>
      <div className="armor" style={this._armorStyle()}></div>
    </div>;
  }

  _armorStyle() {
    return {
      height: Math.round((this.props.armor/100) * 58)
    };
  }
};
