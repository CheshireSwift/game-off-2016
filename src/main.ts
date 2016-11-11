import * as PongGame from './PongGame'

window['main'] = function() {
  var debugElem = document.getElementById('debug')
  var theGame = new Phaser.Game(800, 600, Phaser.CANVAS, '', {
    preload: PongGame.preloader(),
    create: PongGame.creator(true),
    update: PongGame.updater(debugElem)
  })
}
