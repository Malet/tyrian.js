let React = require('react');
let ReactDOM = require('react-dom');
let classnames = require('classnames');
let Mousetrap = require('mousetrap');
let ShipComponent = require('./ship_component.jsx');
let BulletComponent = require('./bullet_component.jsx');
let EnemyComponent = require('./enemy_component.jsx');
let $ = require('zepto-browserify').Zepto;
let laserSound = new Audio('sounds/effects/laser.mp3');

module.exports = class SceneComponent extends React.Component {
  constructor(props) {
    navigator.pointer = navigator.pointer || navigator.webkitPointer;
    super(props);

    let ship = {
      x: 0,
      y: 0,
      width: 18,
      height: 25,
      armor: 100,
      destroyedOn: null
    };
    ship.x = (this.props.width / 2) - (ship.width / 2);

    this.newEnemies = [];
    this.state = {
      levelEndedOn: null,
      ship: ship,
      bullets: [],
      enemies: [],
      bulletSeq: 0,
      enemySeq: 0,
      points: 0
    };
  }

  _pointerLocked(e) {
    return !!(document.pointerLockElement || document.mozPointerLockElement);
  }

  _getPointerMovement(e) {
    if (e.movementX !== undefined) {
      return {
        movementX: e.movementX,
        movementY: e.movementY
      }
    } else {
      return {
        movementX: e.mozMovementX,
        movementY: e.mozMovementY
      }
    }
  }

  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    let offset = $(domNode).offset();

    $(document).on('mousemove.game', e => {
      var x, y;
      if (this._pointerLocked(e)) {
        let m = this._getPointerMovement(e)
        x = this.state.ship.x + m.movementX;
        y = this.state.ship.y - m.movementY;
      } else {
        x = Math.round(e.pageX - offset.left);
        y = this.props.height - Math.round(e.pageY - offset.top);
      }

      let ship = Object.assign(
        this.state.ship,
        {
          x: Math.max(0, Math.min(x, this.props.width - this.state.ship.width)),
          y: Math.max(0, Math.min(y, this.props.height - this.state.ship.height))
        }
      );

      this.setState({ ship: ship });
    });

    Mousetrap.bind('space', _ => this._fireBullet())

    let clickHandler = $(document).on('click.game', _ => {
      this._enablePointerLock();
      this._fireBullet();
    });

    this.tick = 0;
    this.ticker = (elapsedTime) => {
      if (this.state.levelEndedOn) {
        // Deregister any click handlers etc
        $(document).off('click.game');
        $(document).off('mousemove.game');
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
    let gameOver = <div className="gameover">
      <h1>GAME OVER</h1>
      <p>Your score was {this.state.points}</p>
    </div>;

    let bullets = this.state.bullets.map(bullet => {
      return <BulletComponent x={bullet.x} y={bullet.y} height={bullet.height} width={bullet.width} key={bullet.key}/>
    });

    let enemies = this.state.enemies.map(enemy => {
      return <EnemyComponent attrs={enemy} key={enemy.key}/>
    });

    return <div style={{
      width: this.props.width,
      height: this.props.height
    }} className={classnames({ scene: true, 'scene-gameover': !!this.state.ship.destroyedOn })}>
      <div className="text">POINTS <strong>{this.state.points}</strong></div>
      <div className="text">ARMOR <strong>{this.state.ship.armor}</strong></div>
      {bullets}
      {enemies}
      <ShipComponent ship={this.state.ship}/>
      {gameOver}
    </div>;
  }

  _fireBullet(clickEvent) {
    let key = this.state.bulletSeq;
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
      bulletSeq: key + 1
    });

    laserSound.cloneNode().play();
  }

  _spawnEnemyBullet(x, y) {
    let bullet = {
      key: this.state.enemySeq++,
      x: x,
      y: y,
      width: 7,
      height: 7,
      points: 0,
      speed: 1,
      collisionDamage: 1,
      bullet: true,
      image: 'images/bullets/enemy_bullet.gif',
      tick: (bullet) => {
        bullet.y += bullet.normalVector.y;
        bullet.x += bullet.normalVector.x;

        return bullet;
      }
    };

    let target = { x: this.state.ship.x, y: this.state.ship.y };
    let initial = { x: x, y: y };
    let vector = {
      x: target.x - initial.x,
      y: target.y - initial.y
    };
    let distance = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    bullet.normalVector = {
      x: vector.x / distance * bullet.speed,
      y: vector.y / distance * bullet.speed
    };

    return bullet;
  }

  _spawnEnemy(x) {
    let key = this.state.enemySeq;
    this.setState({
      enemies: this.state.enemies.concat({
        key: key,
        x: x,
        y: this.props.height,
        width: 22,
        height: 25,
        points: 100,
        speed: 0.5,
        collisionDamage: 1,
        image: 'images/ships/Gencore_Phoenix.gif',
        tick: (enemy) => {
          enemy.y -= enemy.speed;
          enemy.x += Math.sin(enemy.y / 20) * enemy.speed;

          if(this.tick % 120 === 0) {
            this.newEnemies.push(
              this._spawnEnemyBullet(
                enemy.x + ( enemy.width / 2 ),
                enemy.y + 7
              )
            );
          }

          return enemy;
        }
      }),
      enemySeq: key + 1
    });
  }

  _checkCollisions() {
    let enemyRemovalList = [];
    let bulletRemovalList = [];
    var levelEndedOn = null;

    // Use local object, we only want one setState for this entire call
    let ship = this.state.ship;

    this.state.enemies.forEach(enemy => {
      let collision = false;
      // Check if an collided with the ship
      if (this._collided(enemy, this.state.ship)) {
        // Damage ship
        let newArmor = Math.max(0, ship.armor - enemy.collisionDamage);
        ship.armor = newArmor;
        if (ship.armor === 0) {
          // Use this tick to set a slight delay on the respawn, or game over.
          ship.destroyedOn = this.tick;
          levelEndedOn = this.tick;
        }

        // TODO: Repel ship
      }

      // Check if a friendly bullet has hit an enemy
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
      points: Number(this.state.points) + points,
      ship: ship,
      levelEndedOn: levelEndedOn
    });
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
    let enemies = this.state.enemies
      .map(enemy => enemy.tick(enemy))
      .filter(enemy => enemy.y > (0 - enemy.height));

    this.setState({
      enemies: enemies.concat(this.newEnemies),
      enemySeq: this.state.enemySeq
    });

    // Reset for next tick
    this.newEnemies = [];
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
