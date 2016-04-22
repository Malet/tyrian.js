module.exports = {
  addEnemy: (state, enemy) => {
    enemy.key = state.enemySeq;
    state.enemies.push(enemy);
    state.enemySeq += 1;
    return state;
  }
};
