let React = require('react');
let ReactDOM = require('react-dom');

module.exports = class LevelComponent extends React.Component {
  componentDidMount() {
    let canvas = ReactDOM.findDOMNode(this);
    canvas.height = this.props.level.height;
    canvas.width = this.props.level.width;
    let context = canvas.getContext('2d');
    let tilesImage = $('#tiles1')[0];
    var i = 0, j = 0;
    let levelData = this.props.level.data;

    // Resize the canvas to fit the new map
    levelData.tiles.forEach(tileNum => {
      tileNum -= 1; // Tiles counts from 1;
      context.drawImage(
        tilesImage,
        (tileNum % levelData.spriteWidth) * levelData.tileWidth,
        Math.floor(tileNum / levelData.spriteWidth) * levelData.tileHeight,
        levelData.tileWidth,
        levelData.tileHeight,
        i * levelData.tileWidth,
        j * levelData.tileHeight,
        levelData.tileWidth,
        levelData.tileHeight
      );

      if (i === levelData.mapWidth - 1) {
        i = 0;
        j += 1;
      } else {
        i += 1;
      }
    });
  }

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
