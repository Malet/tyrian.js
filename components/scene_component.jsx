let React = require('react');
let classnames = require('classnames');
let Mousetrap = require('mousetrap');
let ShipComponent = require('./ship_component.jsx');
let BulletComponent = require('./bullet_component.jsx');
let EnemyComponent = require('./enemy_component.jsx');
let EffectComponent = require('./effect_component.jsx');
let LevelComponent = require('./level_component.jsx');
let $ = require('jquery-browserify');

module.exports = class SceneComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let levelComplete = <div className="levelcomplete">
      <h1>Level 1 complete</h1>
      <h2>You scored {this.props.game.points} points!</h2>
      <p>That's the end of the demo for now!</p>
    </div>

    let gameOver = <div className="gameover">
      <h1>GAME OVER</h1>
      <p>Your score was {this.props.game.points}</p>
    </div>;

    let bullets = this.props.game.bullets.map(bullet => {
      return <BulletComponent x={bullet.x} y={bullet.y} height={bullet.height} width={bullet.width} key={bullet.key}/>
    });

    let enemies = this.props.game.enemies.map(enemy => {
      return <EnemyComponent attrs={enemy} key={enemy.key}/>
    });

    let effects = this.props.game.effects.map(effect => {
      return <EffectComponent attrs={effect} key={effect.key}/>
    });

    let level = this.props.game.level.loaded ?
      <LevelComponent
        level={this.props.game.level}
        sceneWidth={this.props.game.scene.width}/> :
      null;

    return <div style={{
      width: `${this.props.game.scene.width}px`,
      height: `${this.props.game.scene.height}px`
    }} className={classnames({
      scene: true,
      'scene-gameover': !!this.props.game.ship.destroyedOn,
      'scene-levelcomplete': !!this.props.game.level.complete
    })}>
      <div className="text points">{this.props.game.points}</div>
      <div className="bulletsContainer">{bullets}</div>
      <div className="enemiesContainer">{enemies}</div>
      <ShipComponent ship={this.props.game.ship}/>
      <div className="effectsContainer">{effects}</div>
      {level}
      {gameOver}
      {levelComplete}
    </div>;
  }
};
