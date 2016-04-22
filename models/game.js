let PublicState = require('../lib/public_state');
let Ship = require('./ship');
let Level = require('./level');
let Promise = require('bluebird');
let Enemy = require('./enemy');

class Game {
  constructor(props) {
    this.reset(props);
    return Promise.join(
      require('../sounds/loader')('sounds/effects/laser.mp3'),
      require('../sounds/loader')('sounds/effects/explode.mp3'),
      require('../sounds/loader')('sounds/effects/shipDamage.mp3'),
      (laser, explode, shipDamage) => {
        this.sounds = {
          laser: laser,
          explode: explode,
          shipDamage: shipDamage
        };
      }
    )
    .then(_ => this);
  }

  reset(props) {
    this._state = this._initialState(props);
  }

  _initialState(props) {
    let ship = new Ship(props);

    return {
      tickNum: 0,
      paused: false,
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
        loaded: false,
        progress: 0,
        complete: false,
        parallax: 0
      },
      scene: props
    };
  }

  get state() { return this._state; }

  level1() {
    let levelData = require('../maps/level1');

    let width = levelData.mapWidth * levelData.tileWidth;
    let height = Math.floor(levelData.tiles.length / levelData.mapWidth) * levelData.tileHeight;

    Object.assign(this._state.level, {
      loaded: true,
      parallaxScale: 40,
      data: levelData,
      height: height,
      width: width,
      progress: 0,
      complete: false,
      events: levelData.events,
      finishOn: height - this._state.scene.height
    });
  }

  tick(userInput) {
    this._state.userInput = userInput;
    this._state.tickNum += 1;
    // let tickKey = `stateTick ${this._state.tickNum}`;
    // console.time(tickKey);
    this._state = this._tick(this._state);
    // console.timeEnd(tickKey);
    return this;
  }

  _tick(startState) {
    return [
      this._updateShipPosition,
      this._replenishShields,
      this._fireGun,
      this._propelEnemies,
      this._removeOutOfBounds,
      this._checkCollisions,
      this._removeOldEffects,
      this._progressLevel
    ].reduce((state, mutator) => mutator.bind(this)(state), startState);
  }

  _replenishShields(state) {
    if (state.tickNum % 30 == 0){
      state.ship.shield.current = Math.min(state.ship.shield.max, state.ship.shield.current + 3);
    }
    return state;
  }

  _fireBullet(state) {
    let bullet = {
      key: state.bulletSeq,
      x: state.ship.x + (state.ship.width / 2),
      y: state.ship.y + state.ship.height,
      width: 9,
      height: 23,
      speed: 5,
      damage: 5,
      tick: (state, bullet) => {
        bullet.y += bullet.speed;
        state.bullets[state.bullets.indexOf(bullet)] = bullet;
        return state;
      }
    };

    // Center the bullet from the ship
    bullet.x -= Math.round(bullet.width / 2);
    bullet.y -= bullet.height;

    state.bullets.push(bullet);
    state.bulletSeq += 1;
    this.sounds.laser.play();

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
      spawnedOn: state.tickNum,
      ttl: 38
    };

    state.effects.push(newExplosion);
    state.effectsSeq += 1;
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
        }

        // Damage ship
        if (!state.godMode) {
          let newShield = state.ship.shield.current - enemy.collisionDamage;
          if (newShield <= 0) {
            state.ship.armor = Math.max(0, state.ship.armor + newShield);
          }
          state.ship.shield.current = Math.max(0, newShield);
        }
        if (state.ship.armor === 0) {
          // Use this tick to set a slight delay on the respawn, or game over.
          state.ship.destroyedOn = state.tickNum;
          state.levelEndedOn = state.tickNum;
        }

        // TODO: Repel ship
        this.sounds.shipDamage.play();
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
            this.sounds.explode.play();
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
    state.effects = state.effects.filter(effect => (effect.spawnedOn + effect.ttl) > state.tickNum);
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
    return state.enemies.concat(state.bullets).reduce(
      (state, enemy) => {
        return enemy.tick(state, enemy);
      },
      state
    );
  }

  _removeOutOfBounds(state) {
    state.enemies = state.enemies.filter(enemy => {
      let outOfX = (enemy.x > (state.scene.width + state.cullMargin)) ||
        ((enemy.x + enemy.width + state.cullMargin) < 0);
      let outOfY = (enemy.y > (state.scene.height + state.cullMargin)) ||
        ((enemy.y + enemy.height + state.cullMargin) < 0);

      return !(outOfX || outOfY);
    });
    return state;
  }

  _fireGun(state) {
    state.ship.gun.firing = state.userInput.firing;
    let shouldFire = state.ship.gun.firing &&
      (state.tickNum >= (state.ship.gun.lastFired + state.ship.gun.firingInterval));

    if (shouldFire) {
      state = this._fireBullet(state);
      state.ship.gun.lastFired = state.tickNum;
    }

    return state;
  }

  _updateShipPosition(state) {
    if (state.userInput.pointer) {
      state.ship = Object.assign(state.ship, state.userInput.pointer);
    }
    return state;
  }

  _progressLevel(state) {
    let previousParallax = state.level.parallax;
    state.level.progress += 0.5;
    if (state.level.progress >= state.level.finishOn) {
      state.level.complete = true;
    }

    // Calculate parallax
    state.level.parallax = (state.ship.x / (state.scene.width - state.ship.width));
    // Update rest of entities with this parallax
    let parallaxShift = entity => {
      entity.x += (previousParallax - (state.level.parallax)) * state.level.parallaxScale;
      return entity;
    }

    state.enemies = state.enemies.map(parallaxShift);
    state.bullets = state.bullets.map(parallaxShift);
    state.effects = state.effects.map(parallaxShift);

    if (state.level.events.hasOwnProperty(state.tickNum)) {
      state = state.level.events[state.tickNum](state);
    }

    return state;
  }
}

module.exports = Game;
