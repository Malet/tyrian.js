let React = require('react');
let classnames = require('classnames');

module.exports = class EnemyComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="enemy" style={this._position()}></div>;
  }

  _position() {
    return {
      left: this.props.attrs.x,
      bottom: Math.round(this.props.attrs.y),
      width: this.props.attrs.width,
      height: this.props.attrs.height,
      background: `url(${this.props.attrs.image}) no-repeat`
    };
  }
};
