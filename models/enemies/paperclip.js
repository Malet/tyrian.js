var BounceLeftEnemy = require('./bounce_left');

module.exports = class PaperclipEnemy extends BounceLeftEnemy {
  constructor(state, props) {
    return Object.assign(
      super(state, props),
      {
        image: 'images/ships/paperclip.gif',
        speed: 2
      }
    )
  }
}
