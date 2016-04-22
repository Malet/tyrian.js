var BasicEnemy = require('./basic');

module.exports = class BounceLeftEnemy extends BasicEnemy {
  constructor(state, props) {
    return Object.assign(
      super(state, props),
      {
        ascend: false,
        tick: (state, enemy) => {
          enemy.ascending = enemy.ascending || (enemy.y + enemy.height) <= 0;
          if (enemy.ascending) {
            // Normalise the vector(-1, -2)
            let vector = { x: -1, y: 2 };
            let magnitude = Math.abs(vector.x) + Math.abs(vector.y);
            enemy.speed = enemy.speed * 1.05;
            enemy.x += (vector.x / magnitude) * enemy.speed;
            enemy.y += (vector.y / magnitude) * enemy.speed;
          } else {
            enemy.y -= enemy.speed;
          }
          state.enemies[state.enemies.indexOf(enemy)] = enemy;

          return state;
        }
      }
    )
  }
}
