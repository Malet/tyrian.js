let React = require('react');
let classnames = require('classnames');

module.exports = class ShipComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="ship" style={{left: this.props.x}}></div>;
  }
};
