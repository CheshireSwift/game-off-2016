import TextureLibrary from './TextureLibrary'
import { PlayerData, buildLeftData, buildRightData } from './PlayerData'

class Title extends Phaser.State {
  private textureLib: TextureLibrary
  private p1readysign: Phaser.Sprite
  private p2readysign: Phaser.Sprite

  constructor(private screensaverMode: boolean = false) { super() }

  preload() {
    this.textureLib = new TextureLibrary(this.game, {
      playerSquareFilled: function(graphics) { graphics.drawRect(0, 0, 16, 16) },
      playerSquareHollow: function(graphics) {
        graphics.drawRect(0, 0, 16, 16)
        graphics.endFill()
        graphics.beginFill(0x000000)
        graphics.drawRect(1, 1, 14, 14)
      }
    })
  }

  create() {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.game.scale.pageAlignVertically = true
    this.game.scale.pageAlignHorizontally = true

    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.physics.arcade.checkCollision.left = this.screensaverMode
    this.game.physics.arcade.checkCollision.right = this.screensaverMode

    this.p1readysign = this.buildPlayerTitle(buildLeftData, 'left', 'S')
    this.p2readysign = this.buildPlayerTitle(buildRightData, 'right', 'DOWN')

    this.game.add.text(
      0, 175,
      'ModPong',
      { font: '72px Monoton', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle' }
    ).setTextBounds(0, 0, 800, 0).smoothed = false
  }

  private buildPlayerTitle(dataBuilder: (game: Phaser.Game) => PlayerData, boundsAlignH: string, keytext: string) {
    var data = dataBuilder(this.game)

    var text = this.game.add.text(
      0, this.game.world.height - 25,
      `Press ${keytext} when ready`,
      { font: '24px Monofett', fill: '#fff', boundsAlignH, boundsAlignV: 'middle' }
    ).setTextBounds(45, 0, this.game.world.width - 90, 0)
    text.tint = data.tint
    text.smoothed = false

    var sign = this.game.add.sprite(data.xPos, this.game.world.height - 25, this.textureLib['playerSquareHollow'])
    sign.tint = data.tint
    sign.anchor.set(0.5, 0.5)
    return sign
  }

  update() {
    var p1ready = this.game.input.keyboard.isDown(Phaser.KeyCode.S)
    var p2ready = this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)

    this.p1readysign.loadTexture(this.textureLib[p1ready ? 'playerSquareFilled' : 'playerSquareHollow'])
    this.p2readysign.loadTexture(this.textureLib[p2ready ? 'playerSquareFilled' : 'playerSquareHollow'])

    if (p1ready && p2ready) this.game.state.start('PongGame')
  }
}

export {
  Title
}

