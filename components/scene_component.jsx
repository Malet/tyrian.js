let React = require('react');
let classnames = require('classnames');

module.exports = class SceneComponent extends React.Component {
  render() {
    return <div className={classnames({scene: true})}></div>;
  }
};
