let React = require('react');
let ReactDOM = require('react-dom');

module.exports = class LevelComponent extends React.Component {
  render() {
    return <canvas id="level" style={this._style()}></canvas>;
  }

  _style() {
    return {
      bottom: -this.props.level.progress,
      left: (this.props.level.parallax *
        -(this.props.level.width - this.props.sceneWidth)) || 0
    }
  }
};
