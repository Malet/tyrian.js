module.exports = class HomingBullet {
  constructor(state, props) {
    return Object.assign(
      this._initialObject(state, props),
      props
    );
  }

  _initialObject(state, props) {
    let bullet = {
      x: props.x,
      y: props.y,
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
    let initial = { x: props.x, y: props.y };
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
};
