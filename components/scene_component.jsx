let React = require('react');
let ReactDOM = require('react-dom');
let classnames = require('classnames');
let Mousetrap = require('mousetrap');
let ShipComponent = require('./ship_component.jsx');
let BulletComponent = require('./bullet_component.jsx');
let $ = require('zepto-browserify').Zepto;

module.exports = class SceneComponent extends React.Component {
  constructor(props) {
    super(props);

    this.shipWidth = 18;
    this.shipHeight = 25;
    this.sizing = {
      width: this.props.width,
      height: this.props.height
    };
    this.ticker = setInterval(
      _ => {
        this._fireBullet();
        this._propelBullets();
      },
      1000 / 60
    )

    this.state = {
      shipPositionX: (this.props.width / 2) - (this.shipWidth / 2),
      bullets: [],
      bulletCounter: 0
    };
  }

  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    let offset = $(domNode).offset();

    $(document).mousemove(mouseEvent => {
      let x = Math.round(mouseEvent.pageX - offset.left);
      let shipPosition = Math.max(
        0,
        Math.min(x, this.props.width - this.shipWidth)
      );
      this.setState({ shipPositionX: shipPosition });
    });

    $(document).click(this._fireBullet.bind(this));
  }

  render() {
    return <div style={this.sizing} className={classnames({scene: true})}>
      {this.state.bullets.map(bullet => {
        return <BulletComponent x={bullet.x} y={bullet.y} key={bullet.key}/>
      })}
      <ShipComponent x={this.state.shipPositionX}/>
      <div className="text">
        Bullets fired: <strong>{this.state.bulletCounter}</strong>
      </div>
      <div className="text">
        Elements on screen: <strong>{this.state.bullets.length}</strong>
      </div>
    </div>;
  }

  _moveShip(by) {
    this.setState({shipPositionX: this.state.shipPositionX + (by * 5)});
  }

  _fireBullet(clickEvent) {
    let key = this.state.bulletCounter;
    let bullet = {
      key: key,
      x: this.state.shipPositionX + (this.shipWidth / 2),
      y: this.shipHeight
    };

    this.setState({
      bullets: this.state.bullets.concat(bullet),
      bulletCounter: key + 1
    });
  }

  _propelBullets() {
    this.setState({
      bullets: this.state.bullets.map(bullet => {
        bullet.y += 2;
        return bullet;
      }).filter(bullet => bullet.y < this.props.height)
    });
  }
};
