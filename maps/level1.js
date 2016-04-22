var Enemy = require('../models/enemy');
var BasicEnemy = require('../models/enemies/basic');
var PaperclipEnemy = require('../models/enemies/paperclip');
var Level = require('../models/level');

let level = {
  tiles: [187, 200, 187, 180, 179, 187, 200, 180, 177, 179, 200, 187, 199, 189, 187, 200, 187, 190, 189, 190, 197, 199, 199, 189, 177, 179, 200, 200, 187, 180, 179, 180, 177, 178, 35, 186, 200, 187, 200, 187, 190, 189, 200, 190, 189, 180, 177, 179, 187, 200, 187, 200, 188, 186, 187, 188, 196, 197, 189, 190, 187, 200, 200, 187, 188, 186, 200, 188, 176, 177, 179, 180, 187, 187, 200, 187, 180, 179, 200, 180, 179, 200, 187, 200, 197, 199, 189, 187, 187, 187, 200, 200, 187, 200, 190, 197, 177, 177, 179, 187, 200, 187, 187, 187, 187, 187, 188, 34, 187, 200, 200, 187, 200, 200, 200, 187, 200, 187, 180, 178, 189, 187, 200, 187, 190, 199, 189, 200, 200, 187, 187, 180, 196, 197, 189, 190, 198, 35, 196, 189, 200, 200, 200, 190, 178, 176, 179, 180, 177, 177, 177, 179, 200, 187, 187, 180, 188, 186, 190, 189, 200, 200, 200, 200, 190, 189, 187, 187, 180, 179, 180, 179, 200, 200, 187, 190, 198, 186, 187, 190, 200, 190, 199, 189, 187, 187, 190, 198, 176, 179, 190, 198, 200, 188, 176, 179, 187, 187, 180, 177, 179, 200, 180, 177, 190, 198, 196, 189, 200, 187, 200, 187, 187, 200, 200, 200, 188, 31, 33, 196, 189, 187, 190, 199, 199, 199, 197, 199, 188, 41, 45, 33, 196, 197, 198, 31, 32, 32, 32, 32, 198, 41, 12, 45, 32, 32, 32, 44, 15, 22, 22, 14, 32, 44, 15, 22, 22, 22, 14, 15, 23, 63, 65, 11, 22, 14, 13, 80, 81, 81, 21, 23, 63, 61, 75, 21, 65, 21, 23, 76, 77, 76, 63, 64, 61, 74, 62, 64, 75, 79, 63, 65, 63, 65, 73, 74, 72, 84, 71, 72, 85, 76, 73, 75, 83, 85, 83, 71, 62, 65, 83, 85, 76, 66, 83, 85, 63, 64, 65, 83, 71, 75, 66, 63, 63, 64, 64, 65, 73, 74, 62, 64, 61, 75, 66, 73, 73, 72, 84, 85, 83, 84, 84, 84, 71, 75, 77, 83, 61, 75, 78, 81, 80, 66, 66, 79, 83, 85, 76, 66, 74, 62, 65, 66, 66, 67, 81, 66, 66, 77, 81, 81, 71, 74, 62, 64, 65, 80, 67, 76, 76, 77, 63, 65, 83, 84, 71, 74, 62, 64, 65, 81, 78, 79, 73, 75, 2, 3, 83, 84, 84, 84, 85, 77, 76, 76, 73, 62, 54, 5, 2, 3, 79, 77, 66, 66, 66, 81, 83, 84, 41, 12, 12, 13, 80, 79, 77, 67, 67, 78, 80, 66, 51, 54, 42, 13, 67, 1, 2, 2, 2, 3, 76, 77, 35, 51, 54, 5, 2, 4, 12, 12, 42, 13, 77, 78, 34, 34, 51, 52, 54, 12, 42, 15, 22, 23, 80, 77, 34, 34, 34, 34, 41, 12, 12, 13, 1, 2, 3, 78, 35, 176, 178, 34, 51, 54, 12, 5, 4, 12, 13, 67, 177, 179, 188, 34, 34, 41, 42, 12, 42, 12, 5, 2, 197, 189, 188, 35, 35, 51, 52, 52, 52, 52, 54, 12, 34, 196, 198, 34, 34, 35, 176, 178, 35, 35, 41, 12, 35, 34, 35, 176, 177, 177, 179, 188, 35, 31, 44, 15, 178, 35, 176, 179, 187, 190, 199, 198, 35, 41, 12, 13, 188, 35, 196, 199, 197, 198, 35, 34, 35, 41, 42, 13, 180, 177, 178, 34, 34, 35, 35, 35, 31, 44, 12, 13, 187, 187, 188, 34, 35, 35, 35, 34, 41, 12, 15, 23, 189, 200, 180, 178, 34, 34, 34, 31, 44, 12, 13, 78, 186, 200, 187, 188, 35, 35, 34, 41, 42, 42, 13, 66, 186, 200, 200, 180, 178, 35, 34, 51, 54, 42, 13, 67, 179, 187, 190, 199, 198, 34, 35, 35, 51, 54, 13, 67, 200, 200, 188, 34, 34, 34, 34, 35, 34, 41, 5, 3, 187, 187, 180, 177, 177, 177, 178, 34, 34, 41, 42, 13, 187, 187, 200, 187, 187, 200, 180, 178, 34, 41, 42, 5, 189, 200, 200, 187, 200, 190, 197, 198, 35, 41, 12, 42, 186, 200, 200, 187, 200, 188, 34, 35, 35, 41, 42, 42, 179, 200, 200, 187, 190, 198, 35, 176, 178, 41, 42, 42, 200, 187, 200, 187, 188, 35, 34, 196, 198, 51, 54, 12, 200, 200, 187, 190, 198, 35, 34, 35, 35, 35, 51, 52, 187, 200, 200, 188, 35, 35, 176, 177, 178, 35, 35, 176, 197, 189, 187, 188, 35, 35, 186, 190, 198, 34, 35, 186, 35, 186, 187, 180, 178, 35, 196, 198, 176, 177, 177, 179, 35, 186, 200, 187, 188, 35, 35, 34, 186, 190, 197, 197, 35, 186, 187, 190, 198, 35, 35, 176, 179, 180, 178, 35, 35, 186, 200, 180, 178, 176, 177, 179, 200, 187, 180, 178, 35, 196, 189, 187, 180, 179, 187, 200, 200, 200, 187, 180, 35, 35, 196, 199, 189, 200, 187, 190, 199, 189, 187, 187, 32, 32, 32, 33, 186, 200, 187, 188, 35, 186, 187, 200, 22, 22, 14, 43, 196, 189, 187, 180, 178, 196, 189, 200, 64, 65, 11, 43, 35, 186, 187, 200, 188, 35, 186, 187, 74, 75, 11, 45, 33, 196, 189, 200, 188, 35, 196, 189, 72, 85, 21, 14, 43, 35, 196, 197, 198, 35, 35, 196, 62, 64, 65, 11, 43, 35, 35, 35, 35, 35, 35, 35, 74, 74, 75, 11, 43, 35, 35, 35, 35, 35, 35, 35, 74, 74, 75, 11, 45, 33, 35, 35, 35, 35, 31, 32, 74, 74, 75, 21, 14, 45, 33, 35, 35, 31, 44, 15, 74, 74, 62, 65, 21, 14, 43, 35, 31, 44, 15, 23, 74, 74, 74, 62, 65, 11, 45, 32, 44, 15, 23, 77, 74, 72, 71, 74, 75, 21, 22, 22, 22, 23, 79, 67, 74, 75, 73, 74, 62, 64, 64, 64, 65, 79, 66, 76, 74, 75, 73, 74, 74, 74, 74, 74, 62, 64, 65, 78, 74, 62, 61, 74, 74, 74, 74, 74, 74, 74, 62, 65, 84, 71, 74, 74, 74, 74, 74, 74, 74, 74, 74, 75, 3, 83, 84, 84, 71, 74, 74, 72, 84, 71, 74, 62, 5, 3, 79, 63, 61, 74, 74, 75, 76, 83, 84, 71, 15, 23, 76, 73, 74, 72, 84, 85, 67, 67, 76, 73, 23, 1, 3, 83, 84, 85, 66, 66, 80, 80, 80, 83, 3, 21, 23, 67, 77, 67, 77, 79, 78, 81, 80, 67, 13, 67, 78, 80, 81, 67, 76, 77, 66, 80, 81, 66, 13, 67, 67, 66, 66, 66, 63, 64, 64, 65, 76, 63, 5, 3, 81, 77, 76, 63, 61, 74, 74, 62, 64, 61, 12, 5, 3, 63, 64, 61, 74, 74, 74, 74, 74, 74, 15, 14, 13, 83, 84, 71, 74, 74, 74, 72, 84, 84, 5, 4, 5, 2, 3, 83, 84, 84, 84, 85, 1, 2, 42, 42, 42, 42, 5, 2, 2, 2, 2, 2, 4, 12, 42, 42, 42, 12, 15, 22, 22, 22, 14, 12, 15, 22, 12, 42, 12, 42, 5, 2, 3, 77, 11, 12, 5, 3, 42, 12, 12, 12, 42, 42, 5, 2, 4, 12, 42, 5],
  tileHeight: 28,
  tileWidth: 24,
  mapWidth: 12,
  spriteWidth: 10,
  spriteSheet: 'images/sprites/tiles1.png',
  events: {}
};

let addEvent = (tick, ...mutators) => {
  level.events[tick] = level.events[tick] || [];
  level.events[tick] = level.events[tick].concat(mutators);
};

for(var i = 1; i < 6; i++) {
  // Central column
  addEvent(
    i * 15,
    state => {
      let paperclip = new PaperclipEnemy(state, {
        x: state.level.centerGuide
      });
      paperclip.x -= paperclip.width / 2;
      return Level.addEnemy(state, paperclip);
    }
  );

  // Left column
  addEvent(
    (2 * 60) + i * 15,
    state => {
      let paperclip = new PaperclipEnemy(state, {
        x: state.level.leftGuide,
        direction: 'right'
      });
      return Level.addEnemy(state, paperclip);
    }
  );

  // Right column
  addEvent(
    (4 * 60) + i * 15,
    state => {
      let paperclip = new PaperclipEnemy(state, {
        x: state.level.rightGuide,
        direction: 'left'
      });
      paperclip.x -= paperclip.width;
      return Level.addEnemy(state, paperclip);
    }
  );
}

module.exports = level;
