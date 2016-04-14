let React = require('react');
let SceneComponent = require('./scene_component.jsx');
let InterfaceComponent = require('./interface_component.jsx');
let OptionsPanel = require('./options_panel.jsx');
let ReactDOM = require('react-dom');
let Game = require('../models/game');

module.exports = class MainComponent extends React.Component {
  constructor() {
    super();
    this.userInput = {
      firing: false,
      paused: false
    };
    this.state = {
      game: new Game({
        width: 263,
        height: 184
      })
    };
    this.state.gameState = this.state.game.state;
  }

  render() {
    return <div className="main">
      <div className="game">
        <SceneComponent game={this.state.gameState}/>
        <InterfaceComponent armor={this.state.gameState.ship.armor}/>
      </div>
      <OptionsPanel
        checked={this.state.godMode}
        onChange={_ => {
          this.state.godMode = !this.state.godMode;
          this.setState(this.state);
        }}
      />
    </div>;
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
        y = this.state.gameState.scene.height - Math.round(e.pageY - offset.top);
      }

      this.userInput.pointer = {
        x: Math.max(0, Math.min(x, this.state.gameState.scene.width - this.state.gameState.ship.width)),
        y: Math.max(0, Math.min(y, this.state.gameState.scene.height - this.state.gameState.ship.height))
      };
    });

    // Keyboard firing
    $(document).on('keydown.space', e => {
      if (e.keyCode == 32) { this.userInput.firing = true; }
    });
    $(document).on('keyup.space', e => {
      if (e.keyCode == 32) { this.userInput.firing = false; }
    });

    $(document).on('keypress.p', e => {
      if (e.keyCode == 112) {
        this.userInput.paused = !this.userInput.paused;
        if (!this.userInput.paused) {
          this._tick();
        }
      }
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
    if (
      this.state.gameState.levelEndedOn ||
      this.state.gameState.level.complete ||
      this.userInput.paused
    ) {
      // Deregister any click handlers etc
      // $(document).off('click.game');
      // $(document).off('mousemove.game');
      // $(document).off('keydown.space');
      // $(document).off('keyup.space');
      // $(document).off('mousedown.fire');
      // $(document).off('mouseup.fire');
    } else {
      let newState = { gameState: this.state.game.tick(this.userInput).state };
      // let reactTickKey = `reactTick ${newState.tickNum}`;
      // console.time(reactTickKey);
      this.setState(newState);
      // console.timeEnd(reactTickKey);
      requestAnimationFrame(this._tick.bind(this));
    }
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

  _enablePointerLock() {
    if (!document.pointerLockElement) {
      let el = ReactDOM.findDOMNode(this);
      el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock;
      el.requestPointerLock();
    }
  }
};
