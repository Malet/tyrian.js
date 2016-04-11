let React = require('react');
let ReactDOM = require('react-dom');
let classnames = require('classnames');
let Mousetrap = require('mousetrap');
let ShipComponent = require('./ship_component.jsx');
let BulletComponent = require('./bullet_component.jsx');
let EnemyComponent = require('./enemy_component.jsx');
let EffectComponent = require('./effect_component.jsx');
let $ = require('jquery-browserify');

var laserSound, explodeSound, shipDamageSound;
require('../sounds/loader')('sounds/effects/laser.mp3')
.then(func => laserSound = func);
require('../sounds/loader')('sounds/effects/explode.mp3')
.then(func => explodeSound = func);
require('../sounds/loader')('sounds/effects/shipDamage.mp3')
.then(func => shipDamageSound = func);

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
      destroyedOn: null,
      gun: {
        firing: false,
        firingInterval: 7,
        lastFired: 0
      }
    };
    ship.x = (this.props.width / 2) - (ship.width / 2);
    this.pointer = { x: ship.x, y: ship.y };
    this.firing = false;
    this.state = {
      godMode: false,
      levelEndedOn: null,
      ship: ship,
      bullets: [],
      enemies: [],
      effects: [],
      bulletSeq: 0,
      enemySeq: 0,
      effectsSeq: 0,
      points: 0,
      cullMargin: 10,
      level: {
        progress: 0,
        complete: false
      }
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
        let m = this._getPointerMovement(e.originalEvent);
        x = this.state.ship.x + m.movementX;
        y = this.state.ship.y - m.movementY;
      } else {
        x = Math.round(e.pageX - offset.left);
        y = this.props.height - Math.round(e.pageY - offset.top);
      }

      this.pointer = {
        x: Math.max(0, Math.min(x, this.props.width - this.state.ship.width)),
        y: Math.max(0, Math.min(y, this.props.height - this.state.ship.height))
      };
    });

    // Keyboard firing
    $(document).on('keydown.space', e => {
      if (e.keyCode == 32) { this.firing = true; }
    });
    $(document).on('keyup.space', e => {
      if (e.keyCode == 32) { this.firing = false; }
    });

    // Mouse firing
    $(document).on('mousedown.fire', e => {
      this.firing = true;
    });
    $(document).on('mouseup.fire', e => {
      this.firing = false;
    });

    let clickHandler = $(document).on('click.game', _ => {
      this._enablePointerLock();
    });

    this.tick = 0;
    this.level1();
    this._tick();
  }

  level1() {
    let levelData = require('../maps/level1');
    let canvas = $('#level')[0];
    let context = canvas.getContext('2d');
    let tilesImage = $('#tiles1')[0];
    var i = 0, j = 0;
    // Resize the canvas to fit the new map
    canvas.width = levelData.mapWidth * levelData.tileWidth;
    canvas.height = Math.floor(levelData.tiles.length / levelData.mapWidth) * levelData.tileHeight;

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

    this.state.level = {
      height: canvas.height,
      width: canvas.width,
      progress: 0,
      complete: false,
      finishOn: canvas.height - this.props.height
    };
  };

  _fireGun(state) {
    state.ship.gun.firing = this.firing;
    let shouldFire = state.ship.gun.firing &&
      (this.tick >= (state.ship.gun.lastFired + state.ship.gun.firingInterval));

    if (shouldFire) {
      state = this._fireBullet(state);
      state.ship.gun.lastFired = this.tick;
    }

    return state;
  }

  _updateShipPosition(state) {
    state.ship = Object.assign(state.ship, this.pointer);
    return state;
  }

  _progressLevel(state) {
    state.level.progress += 1;
    if (state.level.progress >= state.level.finishOn) {
      state.level.complete = true;
    }
    return state;
  }

  _tick(elapsedTime) {
    if (this.state.levelEndedOn || this.state.level.complete) {
      // Deregister any click handlers etc
      $(document).off('click.game');
      $(document).off('mousemove.game');
      $(document).off('keydown.space');
      $(document).off('keyup.space');
      $(document).off('mousedown.fire');
      $(document).off('mouseup.fire');
    } else {
      this.tick += 1;
      let tickKey = `stateTick ${this.tick}`;
      console.time(tickKey);

      let state = this._progressLevel(
        this._spawnEnemies(
          this._removeOldEffects(
            this._checkCollisions(
              this._removeOutOfBounds(
                this._propelEnemies(
                  this._propelBullets(
                    this._fireGun(
                      this._updateShipPosition(this.state)
                    )
                  )
                )
              )
            )
          )
        )
      );

      console.timeEnd(tickKey);

      let reactTickKey = `reactTick ${this.tick}`;
      console.time(reactTickKey);
      this.setState(state);
      console.timeEnd(reactTickKey);
      requestAnimationFrame(this._tick.bind(this));
    }
  }

  _spawnEnemies(state) {
    if (this.tick % 60 == 0)
      return this._spawnEnemy(Math.random() * this.props.width, state);
    return state;
  }

  render() {
    let levelComplete = <div className="levelcomplete">
      <h1>Level 1 complete</h1>
      <h2>You scored {this.state.points} points!</h2>
      <p>That's the end of the demo for now!</p>
    </div>

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

    let effects = this.state.effects.map(effect => {
      return <EffectComponent attrs={effect} key={effect.key}/>
    });

    return <div style={{
      width: `${this.props.width}px`,
      height: `${this.props.height}px`
    }} className={classnames({
      scene: true,
      'scene-gameover': !!this.state.ship.destroyedOn,
      'scene-levelcomplete': !!this.state.level.complete
    })}>
      <div className="text points">{this.state.points}</div>
      <div className="text armor">ARMOR <strong>{this.state.ship.armor}</strong></div>
      <div className="bulletsContainer">{bullets}</div>
      <div className="enemiesContainer">{enemies}</div>
      <ShipComponent ship={this.state.ship}/>
      <div className="effectsContainer">{effects}</div>
      <canvas id="level" style={{ bottom: -this.state.level.progress }}></canvas>
      {gameOver}
      {levelComplete}
    </div>;
  }

  _fireBullet(state) {
    let bullet = {
      key: state.bulletSeq,
      x: state.ship.x + (state.ship.width / 2),
      y: state.ship.y + state.ship.height,
      width: 9,
      height: 23,
      speed: 5,
      damage: 5
    };

    // Center the bullet from the ship
    bullet.x -= Math.round(bullet.width / 2);
    bullet.y -= bullet.height;

    state.bullets.push(bullet);
    state.bulletSeq += 1;
    laserSound.play();

    return state;
  }

  _spawnEnemyBullet(x, y, state) {
    let bullet = {
      key: state.enemySeq++,
      x: x,
      y: y,
      width: 7,
      height: 7,
      points: 0,
      speed: 1,
      collisionDamage: 5,
      bullet: true,
      image: 'images/bullets/enemy_bullet.gif',
      tick: (bullet, state) => {
        bullet.y += bullet.normalVector.y;
        bullet.x += bullet.normalVector.x;

        state.enemies[state.enemies.indexOf(bullet)] = bullet;

        return state;
      }
    };

    let target = { x: state.ship.x, y: state.ship.y };
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

    state.enemies.push(bullet);
    return state;
  }

  _spawnExplosion(x, y, w, h, state) {
    let newExplosion = {
      key: state.effectsSeq,
      x: x,
      y: y,
      width: w || 13,
      height: h || 12,
      image: 'images/effects/small_explosion.gif',
      spawnedOn: this.tick,
      ttl: 38
    };

    state.effects.push(newExplosion);
    state.effectsSeq += 1;
    return state;
  }

  _spawnEnemy(x, state) {
    let newEnemy = {
      sinOffset: Math.random() * Math.PI * 2,
      key: state.enemySeq,
      x: x,
      y: this.props.height,
      width: 22,
      height: 25,
      points: 100,
      speed: 0.5,
      collisionDamage: 1,
      health: 10,
      image: 'images/ships/Gencore_Phoenix.gif',
      tick: (enemy, state) => {
        enemy.y -= enemy.speed;
        enemy.x += Math.sin((enemy.y / 20) + enemy.sinOffset) * enemy.speed;
        state.enemies[state.enemies.indexOf(enemy)] = enemy;

        if((this.tick + enemy.key) % 120 === 0) {
          state = this._spawnEnemyBullet(
            enemy.x + ( enemy.width / 2 ),
            enemy.y + 7,
            state
          );
        }
        return state;
      }
    };
    state.enemies.push(newEnemy);
    state.enemySeq += 1;
    return state;
  }

  _checkCollisions(state) {
    let enemyRemovalList = [];
    let bulletRemovalList = [];
    let newEffects = [];
    var levelEndedOn = null;

    // Use local object, we only want one setState for this entire call
    state.enemies.forEach(enemy => {
      let collision = false;
      // Check if an collided with the ship
      if (this._collided(enemy, state.ship)) {
        if (enemy.bullet) { // Bullets are removed on collision
          enemyRemovalList.push(enemy);
          newEffects.push(
            state => this._spawnExplosion(enemy.x, enemy.y, null, null, state)
          );
          shipDamageSound.play();
        }

        // Damage ship
        let newArmor = state.godMode ?
          state.ship.armor :
          Math.max(0, state.ship.armor - enemy.collisionDamage);

        state.ship.armor = newArmor;
        if (state.ship.armor === 0) {
          // Use this tick to set a slight delay on the respawn, or game over.
          state.ship.destroyedOn = this.tick;
          state.levelEndedOn = this.tick;
        }

        // TODO: Repel ship
      }

      // Check if a friendly bullet has hit an enemy
      state.bullets.forEach(bullet => {
        if (collision) { return; }

        if (enemy.bullet !== true) {
          collision = this._collided(bullet, enemy);

          if (collision) {
            // Add to removal list
            newEffects.push(
              state => {
                return this._spawnExplosion(
                  bullet.x + (bullet.width / 2),
                  bullet.y + bullet.height,
                  null,
                  null,
                  state
                );
              }
            );
            if ((enemy.health -= bullet.damage) <= 0) {
              newEffects.push(
                state => {
                  return this._spawnExplosion(
                    enemy.x,
                    enemy.y,
                    enemy.width,
                    enemy.height,
                    state
                  );
                }
              );
              enemyRemovalList.push(enemy);
            } else {
              state.enemies[state.enemies.indexOf(enemy)] = enemy;
            }
            explodeSound.play();
            bulletRemovalList.push(bullet);
          }
        }
      });
    });

    // Add side-effects for removed enemies/bullets (explosions|powerups)
    state.points += enemyRemovalList
      .map(enemy => enemy.points)
      .reduce(((total, points) => Number(total) + Number(points)), 0);
    state.enemies = state.enemies
      .filter(enemy => enemyRemovalList.indexOf(enemy) === -1);
    state.bullets = state.bullets
      .filter(bullet => bulletRemovalList.indexOf(bullet) === -1);
    newEffects.forEach(effect => state = effect(state));

    return state;
  }

  _removeOldEffects(state) {
    state.effects = state.effects.filter(effect => (effect.spawnedOn + effect.ttl) > this.tick);
    return state;
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

  _propelEnemies(state) {
    return state.enemies.reduce(
      (state, enemy) => {
        return enemy.tick(enemy, state);
      },
      state
    );
  }

  _removeOutOfBounds(state) {
    state.enemies = state.enemies.filter(enemy => {
      let outOfX = (enemy.x > (this.props.width + state.cullMargin)) ||
        ((enemy.x + enemy.width + state.cullMargin) < 0);
      let outOfY = (enemy.y > (this.props.height + state.cullMargin)) ||
        ((enemy.y + enemy.height + state.cullMargin) < 0);

      return !(outOfX || outOfY);
    });
    return state;
  }

  _propelBullets(state) {
    let bullets = state.bullets
      .map(bullet => {
        bullet.y += bullet.speed;
        return bullet;
      })
      .filter(bullet => bullet.y < this.props.height);

    return Object.assign(state, { bullets: bullets });
  }

  _enablePointerLock() {
    if (!document.pointerLockElement) {
      let el = ReactDOM.findDOMNode(this);
      el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock;
      el.requestPointerLock();
    }
  }
};
