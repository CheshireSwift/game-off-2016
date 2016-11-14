import colourHash from './colourHash'
import { PlayerData } from './PlayerData'

export default class Paddle extends Phaser.Sprite {
  private _modTint: number;
  private halo: Phaser.Sprite
  private surface: Phaser.Sprite
  private haloEmitter: Phaser.Particles.Arcade.Emitter

  constructor(
      game: Phaser.Game,
      data: PlayerData,
      texture: PIXI.Texture,
      haloTexture: PIXI.Texture) {
    super(game, data.xPos, game.world.centerY, texture)

    game.add.existing(this)

    this.tint = data.tint
    this.modTint = colourHash(data.scriptConfig)

    this.anchor.set(0.5, 0.5)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.checkWorldBounds = true
    this.body.collideWorldBounds = true
    this.body.immovable = true

    this.haloEmitter = this.createHaloEmitter(haloTexture)
    this.halo = this.addChildSprite(haloTexture, this.modTint)
    this.surface = this.addChildSprite(texture, this.tint)
  }

  set modTint(newTint: number) {
    this._modTint = newTint
  }

  get modTint(): number {
    return this._modTint
  }

  set spriteTint(newTint: number) {
    this.tint = newTint
  }

  get spriteTint(): number {
    return this.tint
  }

  private createHaloEmitter(texture: PIXI.Texture): Phaser.Particles.Arcade.Emitter {
    var emitter = this.game.add.emitter(0, 0, 10)
    emitter.makeParticles(texture)
    var lifetime = 500
    emitter.setAlpha(0.8, 0, lifetime)
    emitter.gravity = 0
    emitter.setAll('tint', this.modTint)
    emitter.start(false, lifetime, 750)
    emitter.setRotation()
    emitter.setXSpeed(0, 0)
    emitter.setYSpeed(0, 0)
    emitter.setScale(1, 2, 1, 1.2, lifetime)
    this.addChild(emitter)
    return emitter
  }

  private addChildSprite(texture: PIXI.Texture, tint: number = 0xffffff): Phaser.Sprite {
    var sprite = new Phaser.Sprite(this.game, 0, 0, texture)
    sprite.anchor.set(0.5, 0.5)
    sprite.tint = tint
    this.addChild(sprite)
    return sprite
  }
}

