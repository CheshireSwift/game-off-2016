import * as _ from 'lodash'
import { ScriptConfig } from './Script'
import colourHash from './colourHash'

interface Player {
  data: PlayerData;
  paddle?: Paddle;
  keys?: PlayerKeyMap<Phaser.Key>;
}

interface PlayerData {
  xPos: number;
  scriptConfig: ScriptConfig;
  keys: PlayerKeyMap<number>;
}

interface Paddle extends Phaser.Sprite {
  ballTint: number;
}

interface PlayerKeyMap<T> { up: T; down: T; }

interface RenderLibrary   { [key: string]: (graphics: Phaser.Graphics) => void }
interface TextureLibrary  { [key: string]: PIXI.Texture }

interface Players {
  left: Player;
  right: Player;
  each(f: (player: Player) => void);
  populate(field: String, computation: (data: PlayerData) => any);
  map<T>(f: string | ((player: Player) => T)): T[];
  both?: Player[];
}

var textureLib: TextureLibrary
var ball: Phaser.Sprite
var emitter: Phaser.Particles.Arcade.Emitter
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

    players.populate('paddle', createPaddle)
    players.populate('keys', data => game.input.keyboard.addKeys(data.keys))

    game.physics.arcade.velocityFromAngle(30, 600, ball.body.velocity)
    ball.body.maxVelocity = 600

    emitter = game.add.emitter(game.world.centerX, game.world.centerY, 100)
    emitter.makeParticles(textureLib['particle'])
    emitter.setAlpha(1, 0, 400)
    emitter.gravity = 0
    emitter.start(false, 400, 10)

      /* Functions */

    function applyPhysicsDefaults(sprite: Phaser.Sprite) {
      sprite.anchor.set(0.5, 0.5)
      game.physics.enable(sprite, Phaser.Physics.ARCADE)
      sprite.checkWorldBounds = true
      sprite.body.collideWorldBounds = true
    }

    function createPaddle(data: PlayerData) {
      var paddle: Paddle = _.assign<Phaser.Sprite, Paddle>(
        game.add.sprite(data.xPos, game.world.centerY, textureLib['paddle']),
        { ballTint: colourHash(data.scriptConfig) }
      )
      applyPhysicsDefaults(paddle)
      paddle.body.immovable = true
      return paddle
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
            keys: { up: Phaser.KeyCode.W, down: Phaser.KeyCode.S }
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
            keys: { up: Phaser.KeyCode.UP, down: Phaser.KeyCode.DOWN }
          }
        },
        each: function(f) {
          _.forEach(this.both, f)
        },
        populate: function(field, computation: (data: PlayerData) => any) {
          this.each(player => {
            _.set(player, field, computation(player.data))
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
    emitter.maxParticleSpeed = Phaser.Point.add(halfBall, new Phaser.Point(25, 25))
    emitter.minParticleSpeed = Phaser.Point.add(halfBall, new Phaser.Point(-25, -25))
    emitter.emitX = ball.x
    emitter.emitY = ball.y

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
      ball.tint = paddle.ballTint
      emitter.setAll('tint', paddle.ballTint)
    })

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
