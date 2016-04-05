let React = require('react');
let classnames = require('classnames');

module.exports = class BulletComponent extends React.Component {
  constructor(props) {
    super(props);
    this.bulletWidth = 6;
  }

  render() {
    return <div className="bullet" style={{
      left: this.props.x - (this.bulletWidth / 2),
      bottom: this.props.y
    }}></div>;
  }
};
