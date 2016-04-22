module.exports = class BasicEnemy {
  constructor(state, props) {
    return Object.assign(
      {
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
          state.enemies[state.enemies.indexOf(enemy)] = enemy;

          return state;
        }
      },
      props
    );
  }
};
