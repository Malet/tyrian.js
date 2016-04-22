module.exports = {
  addEnemy: (state, enemy) => {
    enemy.key = state.enemySeq;
    enemy.x -= (state.level.parallax * state.level.parallaxScale);
    state.enemies.push(enemy);
    state.enemySeq += 1;
    return state;
  }
};
