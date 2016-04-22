var BasicEnemy = require('./basic');

module.exports = class BounceEnemy extends BasicEnemy {
  constructor(state, props) {
    return Object.assign(
      super(state, props),
      {
        ascend: false,
        direction: 'none',
        tick: (state, enemy) => {
          enemy.ascending = enemy.ascending || (enemy.y + enemy.height) <= 0;
          if (enemy.ascending) {
            // Normalise the vector(-1, -2)
            let vector = { x: 1, y: 2 };
            vector.x *= { left: -1, right: 1 }[enemy.direction] || 0;

            let magnitude = Math.abs(vector.x) + Math.abs(vector.y);
            enemy.speed = enemy.speed * 1.02;
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
