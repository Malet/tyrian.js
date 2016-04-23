var BasicEnemy = require('./basic');
let HomingBullet = require('./homing_bullet');
let Level = require('../level');

module.exports = class AcornEnemy extends BasicEnemy {
  constructor(state, props) {
    let acorn = Object.assign(
      super(state),
      {
        direction: 'right',
        width: 25,
        height: 23,
        points: 100,
        speed: 2,
        collisionDamage: 1,
        health: 10,
        fireRate: 120,
        tick: (state, enemy) => {
          enemy.y -= state.level.speed;
          enemy.x += {
            left: -1,
            right: 1
          }[enemy.direction] * enemy.speed;
          state.enemies[state.enemies.indexOf(enemy)] = enemy;

          if ((state.tickNum + enemy.key) % enemy.fireRate === 0) {
            state = Level.addEnemy(
              state,
              new HomingBullet(
                state,
                {
                  x: enemy.x + (state.level.parallax * state.level.parallaxScale) + (enemy.width / 2),
                  y: enemy.y + (enemy.height / 2)
                }
              )
            );
          }

          return state;
        }
      },
      props
    );
    acorn.y = acorn.y || (state.scene.height / 2);
    acorn.x = acorn.x || {
      left: state.scene.width + state.level.parallaxScale, right: -acorn.width
    }[acorn.direction];
    acorn.image = `images/ships/acorn_${acorn.direction}.gif`;

    return acorn;
  }
};
