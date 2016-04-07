let React = require('react');
let classnames = require('classnames');

module.exports = class ShipComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="ship" style={this._position()}></div>;
  }

  _position() {
    return {
      left: this.props.ship.x,
      bottom: this.props.ship.y,
      width: this.props.ship.width,
      height: this.props.ship.height
    }
  }
};
