import colourHash from './colourHash'
import { PlayerData } from './PlayerData'

export default class Paddle extends Phaser.Sprite {
  ballTint: number;

  constructor(game: Phaser.Game, data: PlayerData, texture) {
    super(game, data.xPos, game.world.centerY, texture)

    game.add.existing(this)

    this.tint = data.tint
    this.ballTint = colourHash(data.scriptConfig)

    this.anchor.set(0.5, 0.5)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.checkWorldBounds = true
    this.body.collideWorldBounds = true
    this.body.immovable = true
  }
}

