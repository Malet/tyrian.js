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
    this.sizing = {
      width: `${this.props.width}px`,
      height: `${this.props.height}px`
    };

    this.state = {
      shipPositionX: (this.props.width / 2) - (this.shipWidth / 2),
      bullets: []
    };
  }

  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    let offset = $(domNode).offset();

    $(document).mousemove(mouseEvent => {
      let x = Math.round(mouseEvent.pageX - offset.left);
      let shipPosition = Math.max(0, Math.min(x, this.props.width - this.shipWidth));
      this.setState({ shipPositionX: shipPosition });
    });

    $(document).click(clickEvent => {
      // Create bullet
      let bullet = {
        x: this.state.shipPositionX + (this.shipWidth / 2)
      };
      this.setState({ bullets: this.state.bullets.concat(bullet) });
    });
  }

  render() {
    return <div style={this.sizing} className={classnames({scene: true})}>
      {this.state.bullets.map(bullet => <BulletComponent x={bullet.x}/>)}
      <ShipComponent x={this.state.shipPositionX}/>
    </div>;
  }

  _moveShip(by) {
    this.setState({shipPositionX: this.state.shipPositionX + (by * 5)});
  }
};
