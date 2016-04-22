let HomingBullet = require('./homing_bullet');
let Level = require('./level');

module.exports = class Enemy {
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
        tick: (state, enemy) => {
          enemy.y -= enemy.speed;
          enemy.x += Math.sin((enemy.y / 20) + enemy.sinOffset) * enemy.speed;
          state.enemies[state.enemies.indexOf(enemy)] = enemy;

          if ((state.tickNum + enemy.key) % 120 === 0) {
            state = Level.addEnemy(
              state,
              new HomingBullet(
                state,
                {
                  x: enemy.x + ( enemy.width / 2 ),
                  y: enemy.y + 7
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
