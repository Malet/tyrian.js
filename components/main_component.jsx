let React = require('react');
let SceneComponent = require('./scene_component.jsx');
let InterfaceComponent = require('./interface_component.jsx');
let OptionsPanel = require('./options_panel.jsx');
let ReactDOM = require('react-dom');
let GameLoader = require('../models/game');
let gameProps = {
  width: 263,
  height: 184
};
let gameBounds = {
  width: 320,
  height: 200
};
var viewScale = 2;
var offset = {
  left: 0,
  top: 0
};
var doneRescale = false;

module.exports = class MainComponent extends React.Component {
  constructor() {
    super();
    this.userInput = {
      firing: false,
      paused: false
    };
    this.loaded = false;

    new GameLoader(gameProps)
    .then(game => {
      this.state = { game: game };
      this.loaded = true;
      this.start();
    });
  }

  _style() {
    let isChrome = !!window.chrome && !!window.chrome.webstore;
    let style = {
      marginLeft: ((window.innerWidth - (viewScale * gameBounds.width)) / 2) / viewScale
    };

    if (isChrome) {
      style.zoom = viewScale;
    } else {
      style.transform = `scale(${viewScale})`;
    }
    return style;
  }

  start() {
    window.cancelAnimationFrame(this.lastAnimationFrame);
    this.state.game.reset(gameProps);
    this.state.game.level1();
    this.state.gameState = this.state.game.state;
    this._tick();
  }

  render() {
    var game;
    if (this.loaded) {
      game = <div>
        <div className="game noselect" style={this._style()}>
          <SceneComponent game={this.state.gameState}/>
          <InterfaceComponent
            armor={this.state.gameState.ship.armor}
            shield={this.state.gameState.ship.shield}
            />
        </div>
      </div>;
    } else {
      game = null;
    }

    return <div className="main">
      {game}
    </div>;
  }

  componentDidUpdate() {
    if (!doneRescale) {
      this.rescale();
      doneRescale = true;
    }
  }

  rescale() {
    viewScale = Math.min(
      window.innerWidth / gameBounds.width,
      window.innerHeight / gameBounds.height
    );
  }

  componentDidMount() {
    var resizeDebouncer;
    let domNode = ReactDOM.findDOMNode(this);

    $(window).on('resize', (e) => {
      clearTimeout(resizeDebouncer);
      resizeDebouncer = setTimeout(this.rescale.bind(this), 100);
    });

    $(domNode).on('mousemove.game touchmove.game', e => {
      var x, y;
      offset = $(domNode.childNodes[0].childNodes[0].childNodes[0]).offset();
      offset.left = (offset.left + (this.state.gameState.ship.width / 2)) * viewScale;
      offset.top = offset.top * viewScale;

      if (this._pointerLocked(e)) {
        let m = this._getPointerMovement(e.originalEvent);
        x = this.state.gameState.ship.x + m.movementX;
        y = this.state.gameState.ship.y - m.movementY;
      } else if (e.type === 'touchmove') {
        x = Math.round((e.originalEvent.changedTouches[0].pageX - offset.left) / viewScale);
        y = this.state.gameState.scene.height - Math.round((e.originalEvent.changedTouches[0].pageY - offset.top) / viewScale);
        this.userInput.firing = true;
        e.preventDefault();
      } else {
        x = Math.round((e.pageX - offset.left) / viewScale);
        y = this.state.gameState.scene.height - Math.round((e.pageY - offset.top) / viewScale);
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

    $(document).on('keypress.r', e => {
      if (e.keyCode == 114) {
        this.start();
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
      this.lastAnimationFrame = requestAnimationFrame(this._tick.bind(this));
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
