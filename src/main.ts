import * as States from './States'
import * as PongGame from './PongGame'

window['main'] = function() {
  var screensaverMode = false
  var debugElem = document.getElementById('debug')
  var theGame = new Phaser.Game(800, 600, Phaser.CANVAS, '')
  var pongGame = {
    preload: PongGame.preloader(),
    create: PongGame.creator(screensaverMode),
    update: PongGame.updater(debugElem)
  }

  theGame.state.add('Title', new States.Title(screensaverMode))
  theGame.state.add('PongGame', pongGame)
  theGame.state.start('Title')
}

