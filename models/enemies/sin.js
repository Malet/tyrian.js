let HomingBullet = require('./homing_bullet');
let Level = require('../level');

module.exports = class SinEnemy {
  constructor(state, props) {
    return Object.assign(
      {
        sinOffset: Math.random() * Math.PI * 2,
        x: 0,
        y: state.scene.height,
        width: 22,
        height: 25,
        points: 100,
        speed: 0.5,
        collisionDamage: 1,
        health: 10,
        image: 'images/ships/Gencore_Phoenix.gif',
        fireRate: 120,
        tick: (state, enemy) => {
          enemy.y -= enemy.speed;
          enemy.x += Math.sin((enemy.y / 20) + enemy.sinOffset) * enemy.speed;
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
  }
};
