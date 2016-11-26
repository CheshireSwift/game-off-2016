import * as PongGame from './PongGame'

window['main'] = function() {
  var debugElem = document.getElementById('debug')
  var theGame = new Phaser.Game(800, 600, Phaser.CANVAS, '', {
    preload: PongGame.preloader(),
    create: PongGame.creator(false),
    update: PongGame.updater(debugElem)
  })
}

