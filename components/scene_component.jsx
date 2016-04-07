let React = require('react');
let ReactDOM = require('react-dom');
let classnames = require('classnames');
let Mousetrap = require('mousetrap');
let ShipComponent = require('./ship_component.jsx');
let BulletComponent = require('./bullet_component.jsx');
let EnemyComponent = require('./enemy_component.jsx');
let $ = require('zepto-browserify').Zepto;
let laserSound = new Audio('/sounds/effects/laser.mp3');

module.exports = class SceneComponent extends React.Component {
  constructor(props) {
    navigator.pointer = navigator.pointer || navigator.webkitPointer;
    super(props);

    let ship = {
      x: 0,
      y: 0,
      width: 18,
      height: 25
    };
    ship.x = (this.props.width / 2) - (ship.width / 2);

    this.state = {
      ship: ship,
      bullets: [],
      enemies: [],
      bulletCounter: 0,
      enemyCounter: 0,
      points: 0
    };
  }

  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    let offset = $(domNode).offset();

    $(document).mousemove(mouseEvent => {
      var x, y;
      if (document.pointerLockElement) {
        x = this.state.ship.x + mouseEvent.movementX;
        y = this.state.ship.y - mouseEvent.movementY;
      } else {
        x = Math.round(mouseEvent.pageX - offset.left);
        y = this.props.height - Math.round(mouseEvent.pageY - offset.top);
      }

      let ship = Object.assign(
        this.state.ship,
        {
          x: Math.max(0, Math.min(x, this.props.width - this.state.ship.width)),
          y: Math.max(0, Math.min(y, this.props.height - this.state.ship.height))
        }
      );

      this.setState({ ship: ship
      });
    });

    Mousetrap.bind('space', _ => this._fireBullet())

    $(document).click(_ => {
      this._enablePointerLock();
      this._fireBullet();
    });

    this.tick = 0;
    this.ticker = (elapsedTime) => {
      if (this.tick === (60 * 30)) {
        alert(`You scored ${this.state.points} points. GAME OVER`);
      } else {
        requestAnimationFrame(this.ticker);
        this.tick += 1;
        this._propelBullets();
        this._propelEnemies();
        this._checkCollisions();
        if (this.tick % 30 == 0) {
          this._spawnEnemy(Math.random() * this.props.width);
        }
      }
    };

    this.ticker();
  }

  render() {
    return <div style={{
      width: this.props.width,
      height: this.props.height
    }} className={classnames({scene: true})}>
      <div className="text">POINTS <strong>{this.state.points}</strong></div>
      {this.state.bullets.map(bullet => {
        return <BulletComponent x={bullet.x} y={bullet.y} height={bullet.height} width={bullet.width} key={bullet.key}/>
      })}
      {this.state.enemies.map(enemy => {
        return <EnemyComponent x={enemy.x} y={enemy.y} width={enemy.width} height={enemy.height} key={enemy.key}/>
      })}
      <ShipComponent ship={this.state.ship}/>
    </div>;
  }

  _fireBullet(clickEvent) {
    let key = this.state.bulletCounter;
    let bullet = {
      key: key,
      x: this.state.ship.x + (this.state.ship.width / 2),
      y: this.state.ship.y + this.state.ship.height,
      width: 9,
      height: 23,
      speed: 5
    };

    // Center the bullet from the ship
    bullet.x -= Math.round(bullet.width / 2);
    bullet.y -= bullet.height;

    this.setState({
      bullets: this.state.bullets.concat(bullet),
      bulletCounter: key + 1
    });

    laserSound.cloneNode().play();
  }

  _spawnEnemy(x) {
    let key = this.state.enemyCounter;
    this.setState({
      enemies: this.state.enemies.concat({
        key: key,
        x: x,
        y: this.props.height,
        width: 22,
        height: 25,
        points: 100,
        speed: 1
      }),
      enemyCounter: key + 1
    });
  }

  _checkCollisions() {
    let enemyRemovalList = [];
    let bulletRemovalList = [];
    this.state.enemies.forEach(enemy => {
      let collision = false;
      this.state.bullets.forEach(bullet => {
        if (collision) { return; }

        collision = this._collided(bullet, enemy);

        if (collision) {
          // Add to removal list
          enemyRemovalList.push(enemy.key);
          bulletRemovalList.push(bullet.key);
        }
      });
    });

    // Add side-effects for removed enemies/bullets (explosions|powerups)
    let points = enemyRemovalList.map(key => {
      return this.state.enemies.find(e => key === e.key).points;
    })
    .reduce(((a, i) => Number(a) + Number(i)), 0);

    this.setState({
      enemies: this.state.enemies.filter(enemy => enemyRemovalList.indexOf(enemy.key) === -1),
      bullets: this.state.bullets.filter(bullet => bulletRemovalList.indexOf(bullet.key) === -1),
      points: Number(this.state.points) + points
    })
  }

  _collided(obj1, obj2) {
    return this._overlapping(
      [obj1.x, obj1.x + obj1.width],
      [obj2.x, obj2.x + obj2.width]
    ) && this._overlapping(
      [obj1.y, obj1.y + obj1.height],
      [obj2.y, obj2.y + obj2.height]
    );
  }

  _overlapping(x1, x2) {
    return x1[0] < x2[1] && x1[1] > x2[0];
  }

  _propelEnemies() {
    this.setState({
      enemies: this.state.enemies.map(enemy => {
        enemy.y -= enemy.speed;
        return enemy;
      }).filter(enemy => enemy.y > (0 - enemy.height))
    });
  }

  _propelBullets() {
    this.setState({
      bullets: this.state.bullets.map(bullet => {
        bullet.y += bullet.speed;
        return bullet;
      }).filter(bullet => bullet.y < this.props.height)
    });
  }

  _enablePointerLock() {
    if (!document.pointerLockElement) {
      let el = ReactDOM.findDOMNode(this);
      el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock;
      el.requestPointerLock();
    }
  }
};
