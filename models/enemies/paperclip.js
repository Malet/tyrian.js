var BounceEnemy = require('./bounce');

module.exports = class PaperclipEnemy extends BounceEnemy {
  constructor(state, props) {
    return Object.assign(
      super(state, {}),
      {
        image: 'images/ships/paperclip.gif',
        width: 15,
        height: 19,
        speed: 1.5
      },
      props
    );
  }
}
