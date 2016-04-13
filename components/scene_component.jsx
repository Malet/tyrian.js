let React = require('react');
let ReactDOM = require('react-dom');
let classnames = require('classnames');
let Mousetrap = require('mousetrap');
let ShipComponent = require('./ship_component.jsx');
let BulletComponent = require('./bullet_component.jsx');
let EnemyComponent = require('./enemy_component.jsx');
let EffectComponent = require('./effect_component.jsx');
let LevelComponent = require('./level_component.jsx');
let $ = require('jquery-browserify');
let Game = require('../models/game');

module.exports = class SceneComponent extends React.Component {
  constructor(props) {
    super(props);
    this.userInput = {
      firing: false,
      pointer: { x: 0, y: 0 }
    };
    this.state = { game: new Game(props) };
    this.state.gameState = this.state.game.state;
  }

  _pointerLocked(e) {
    return !!(document.pointerLockElement || document.mozPointerLockElement);
  }

  _getPointerMovement(e) {
    if (e.movementX !== undefined) {
      return {
        movementX: e.movementX,
        movementY: e.movementY
      }
    } else {
      return {
        movementX: e.mozMovementX,
        movementY: e.mozMovementY
      }
    }
  }

  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    let offset = $(domNode).offset();

    $(document).on('mousemove.game', e => {
      var x, y;
      if (this._pointerLocked(e)) {
        let m = this._getPointerMovement(e.originalEvent);
        x = this.state.gameState.ship.x + m.movementX;
        y = this.state.gameState.ship.y - m.movementY;
      } else {
        x = Math.round(e.pageX - offset.left);
        y = this.props.height - Math.round(e.pageY - offset.top);
      }

      this.userInput.pointer = {
        x: Math.max(0, Math.min(x, this.props.width - this.state.gameState.ship.width)),
        y: Math.max(0, Math.min(y, this.props.height - this.state.gameState.ship.height))
      };
    });

    // Keyboard firing
    $(document).on('keydown.space', e => {
      if (e.keyCode == 32) { this.userInput.firing = true; }
    });
    $(document).on('keyup.space', e => {
      if (e.keyCode == 32) { this.userInput.firing = false; }
    });

    // Mouse firing
    $(document).on('mousedown.fire', e => {
      this.userInput.firing = true;
    });
    $(document).on('mouseup.fire', e => {
      this.userInput.firing = false;
    });

    $(document).on('click.game', _ => {
      this._enablePointerLock();
    });

    this.state.game.level1();
    this._tick();
  }

  _tick(elapsedTime) {
    if (this.state.gameState.levelEndedOn || this.state.gameState.level.complete) {
      // Deregister any click handlers etc
      $(document).off('click.game');
      $(document).off('mousemove.game');
      $(document).off('keydown.space');
      $(document).off('keyup.space');
      $(document).off('mousedown.fire');
      $(document).off('mouseup.fire');
    } else {
      let newState = { gameState: this.state.game.tick(this.userInput).state };
      let reactTickKey = `reactTick ${newState.tickNum}`;
      console.time(reactTickKey);
      this.setState(newState);
      console.timeEnd(reactTickKey);
      requestAnimationFrame(this._tick.bind(this));
    }
  }

  render() {
    let levelComplete = <div className="levelcomplete">
      <h1>Level 1 complete</h1>
      <h2>You scored {this.state.gameState.points} points!</h2>
      <p>That's the end of the demo for now!</p>
    </div>

    let gameOver = <div className="gameover">
      <h1>GAME OVER</h1>
      <p>Your score was {this.state.gameState.points}</p>
    </div>;

    let bullets = this.state.gameState.bullets.map(bullet => {
      return <BulletComponent x={bullet.x} y={bullet.y} height={bullet.height} width={bullet.width} key={bullet.key}/>
    });

    let enemies = this.state.gameState.enemies.map(enemy => {
      return <EnemyComponent attrs={enemy} key={enemy.key}/>
    });

    let effects = this.state.gameState.effects.map(effect => {
      return <EffectComponent attrs={effect} key={effect.key}/>
    });

    return <div style={{
      width: `${this.props.width}px`,
      height: `${this.props.height}px`
    }} className={classnames({
      scene: true,
      'scene-gameover': !!this.state.gameState.ship.destroyedOn,
      'scene-levelcomplete': !!this.state.gameState.level.complete
    })}>
      <div className="text points">{this.state.gameState.points}</div>
      <div className="text armor">ARMOR <strong>{this.state.gameState.ship.armor}</strong></div>
      <div className="bulletsContainer">{bullets}</div>
      <div className="enemiesContainer">{enemies}</div>
      <ShipComponent ship={this.state.gameState.ship}/>
      <div className="effectsContainer">{effects}</div>
      <LevelComponent level={this.state.gameState.level} sceneWidth={this.props.width}/>
      {gameOver}
      {levelComplete}
    </div>;
  }

  _enablePointerLock() {
    if (!document.pointerLockElement) {
      let el = ReactDOM.findDOMNode(this);
      el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock;
      el.requestPointerLock();
    }
  }
};
