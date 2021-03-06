let React = require('react');
let classnames = require('classnames');

module.exports = class BulletComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="bullet" style={this._position()}></div>;
  }

  _position() {
    return {
      left: this.props.x,
      bottom: this.props.y,
      width: this.props.width,
      height: this.props.height
    }
  }
};
