module.exports = class Coin {
  constructor(state, props) {
    return Object.assign(
      {
        x: 0,
        y: state.scene.height,
        width: 11,
        height: 11,
        points: 50,
        speed: 0.5,
        collisionDamage: 0,
        bullet: true,
        image: 'images/coins/bronze.gif',
        tick: (state, enemy) => {
          enemy.y -= enemy.speed;
          state.enemies[state.enemies.indexOf(enemy)] = enemy;

          return state;
        }
      },
      props
    );
  }
};
