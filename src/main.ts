import * as States from './States'
import * as PongGame from './PongGame'
import { ScriptConfig } from './Script'

window['leftFileListener'] = function (script: ScriptConfig) { window['leftScript'] = script }
window['rightFileListener'] = function (script: ScriptConfig) { window['rightScript'] = script }
window['fileChanged'] = function(e: Event) {
  var fileInput = <HTMLInputElement>e.target
  var file = fileInput.files[0]
  var reader = new FileReader()

  reader.addEventListener('load', function() {
    var scriptSource: string = reader.result
    var script: ScriptConfig = JSON.parse(scriptSource)
    window[fileInput.id + 'Listener'](script)
  })

  if (file) {
    reader.readAsText(file)
  }
}

window['main'] = function() {
  var screensaverMode = false
  var theGame = new Phaser.Game(800, 600, Phaser.CANVAS, '')
  var pongGame = {
    preload: PongGame.preloader(),
    create: PongGame.creator(screensaverMode),
    update: PongGame.updater()
  }

  theGame.state.add('Title', new States.Title(screensaverMode))
  theGame.state.add('PongGame', pongGame)
  theGame.state.start('Title')
}

