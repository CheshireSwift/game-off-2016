import * as _ from 'lodash'
import Paddle from './Paddle'
import { PlayerData, PlayerKeyMap } from './PlayerData'

interface Player {
  data: PlayerData;
  paddle?: Paddle;
  keys?: PlayerKeyMap<Phaser.Key>;
}

type RenderFunc = (graphics: Phaser.Graphics) => void
interface RenderLibrary   { [key: string]: RenderFunc }
interface TextureLibrary  { [key: string]: PIXI.Texture }

interface Players {
  left: Player;
  right: Player;
  each(f: (player: Player) => void);
  populate(field: String, computation: (data: PlayerData, paddle?: Paddle) => any);
  map<T>(f: string | ((player: Player) => T)): T[];
  both?: Player[];
}

var textureLib: TextureLibrary
var ball: Phaser.Sprite
var ballSurface: Phaser.Sprite
var trailEmitter: Phaser.Particles.Arcade.Emitter
var haloEmitter: Phaser.Particles.Arcade.Emitter
var players: Players

export function preloader() {
  return function(game) {
    var renderLib: RenderLibrary = {
      ball: function(graphics) {
        graphics.drawRect(0, 0, 12, 12)
      },
      paddle: function(graphics) {
        graphics.drawRect(0, 0, 12, 72)
      },
      halo: function(graphics) {
        graphics.drawRect(0, 0, 16, 76)
      },
      particle: function(graphics) {
        graphics.drawRect(0, 0, 12, 12)
      }
    }

    textureLib = _.mapValues(renderLib, renderTexture)

    /* Functions */

    function renderTexture(graphicsCommands: (graphics: Phaser.Graphics) => void): PIXI.Texture {
      var graphics = new Phaser.Graphics(game)
      graphics.beginFill(0xffffff)
      graphicsCommands(graphics)
      graphics.endFill()
      return graphics.generateTexture()
    }
  }
}

export function creator() {
  return function(game) {
    players = createPlayers()

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.pageAlignVertically = true
    game.scale.pageAlignHorizontally = true

    game.physics.startSystem(Phaser.Physics.ARCADE)

    ball = game.add.sprite(game.world.centerX, game.world.centerY, textureLib['ball'])
    applyPhysicsDefaults(ball)
    ball.body.bounce.set(1)

    players.populate('paddle', data => new Paddle(game, data, textureLib['paddle'], textureLib['halo']))
    players.populate('keys', data => game.input.keyboard.addKeys(data.keys))

    game.physics.arcade.velocityFromAngle(30, 600, ball.body.velocity)
    ball.body.maxVelocity = 600

    trailEmitter = game.add.emitter(game.world.centerX, game.world.centerY, 100)
    trailEmitter.makeParticles(textureLib['particle'])
    trailEmitter.setAlpha(1, 0, 400)
    trailEmitter.gravity = 0
    trailEmitter.start(false, 400, 10)

    haloEmitter = game.add.emitter(0, 0, 100)
    haloEmitter.makeParticles(textureLib['particle'])
    haloEmitter.setAlpha(1, 0, 400)
    haloEmitter.gravity = 0
    haloEmitter.start(false, 400, 10)
    ball.addChild(haloEmitter)
    ballSurface = game.make.sprite(0, 0, textureLib['ball'])
    ballSurface.anchor.set(0.5, 0.5)
    ball.addChild(ballSurface)

    /* Functions */

    function applyPhysicsDefaults(sprite: Phaser.Sprite) {
      sprite.anchor.set(0.5, 0.5)
      game.physics.enable(sprite, Phaser.Physics.ARCADE)
      sprite.checkWorldBounds = true
      sprite.body.collideWorldBounds = true
    }

    function createPlayers() {
      var retval: Players = {
        left: {
          data: {
            xPos: 25,
            scriptConfig: {
              property1: Math.random() * 256,
              property2: Math.random() * 256,
              property3: Math.random() * 256,
              property4: Math.random() * 256,
              property5: Math.random() * 256,
              property6: Math.random() * 256
            },
            keys: { up: Phaser.KeyCode.W, down: Phaser.KeyCode.S },
            tint: 0xff1111
          }
        },
        right: {
          data: {
            xPos: game.world.width - 25,
            scriptConfig: {
              property1: Math.random() * 256,
              property2: Math.random() * 256,
              property3: Math.random() * 256,
              property4: Math.random() * 256,
              property5: Math.random() * 256,
              property6: Math.random() * 256
            },
            keys: { up: Phaser.KeyCode.UP, down: Phaser.KeyCode.DOWN },
            tint: 0x11ffff
          }
        },
        each: function(f) {
          _.forEach(this.both, f)
        },
        populate: function(field, computation: (data: PlayerData, paddle?: Paddle) => any) {
          this.each(player => {
            _.set(player, field, computation(player.data, player.paddle))
          })
        },
        map: function(f) { return _.map(this.both, f) }
      }
      retval.both = [retval.left, retval.right]
      return retval
    }
  }
}

export function updater(debugElem?: HTMLElement) {
  return function(game) {
    var debugText = ''
    var halfBall = ball.body.velocity.clone().multiply(0.3, 0.3)
    trailEmitter.maxParticleSpeed = Phaser.Point.add(halfBall, new Phaser.Point(25, 25))
    trailEmitter.minParticleSpeed = Phaser.Point.add(halfBall, new Phaser.Point(-25, -25))
    trailEmitter.emitX = ball.x
    trailEmitter.emitY = ball.y

    players.each(player => {
      player.paddle.body.velocity = new Phaser.Point()
      if (player.keys.up.isDown) {
        player.paddle.body.velocity.y -= 500
      }
      if (player.keys.down.isDown) {
        player.paddle.body.velocity.y += 500
      }
    })

    game.physics.arcade.collide(ball, players.map('paddle'), function (ball: Phaser.Sprite, paddle: Paddle) {
      ballSurface.tint = paddle.modTint
      trailEmitter.setAll('tint', paddle.tint)
      haloEmitter.setAll('tint', paddle.modTint)
    })

    game.time.advancedTiming = false
    debugDisplay(game.time.fps)
    game.time.slowMotion = game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) ? 6.0 : 1.0
    game.time.desiredFps = 60 * game.time.slowMotion

    debugDisplay(JSON.stringify(ball.position, null, 2))

    if (debugElem) {
      debugElem.innerText = debugText
    }

    /* Functions */

    function debugDisplay(s: string) {
      debugText += s + '\n'
    }

  }
}

