import Paddle from './Paddle'
import { Player, Players } from './Player'
import { PlayerData, PlayerKeyMap } from './PlayerData'
import { ScriptConfig } from './Script'
import TextureLibrary from './TextureLibrary'

var textureLib: TextureLibrary
var ball: Phaser.Sprite
var ballSurface: Phaser.Sprite
var currentScript: ScriptConfig
var trailEmitter: Phaser.Particles.Arcade.Emitter
var haloEmitter: Phaser.Particles.Arcade.Emitter
var players: Players

export function preloader() {
  return function(game) {
    textureLib = new TextureLibrary(game, {
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
    })
  }
}

export function creator(screensaverMode: boolean = false) {
  return function(game) {
    players = Player.createPlayers(game, textureLib)

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.pageAlignVertically = true
    game.scale.pageAlignHorizontally = true

    game.physics.startSystem(Phaser.Physics.ARCADE)
    game.physics.arcade.checkCollision.left = screensaverMode;
    game.physics.arcade.checkCollision.right = screensaverMode;

    ball = game.add.sprite(game.world.centerX, game.world.centerY, textureLib['ball'])
    applyPhysicsDefaults(ball)
    ball.body.bounce.set(1)
    ball.events.onOutOfBounds.add(function() {
      if (ball.position.x < players.left.data.xPos) {
        players.right.incrementScore()
      }
      if (ball.position.x > players.right.data.xPos) {
        players.left.incrementScore()
      }
      ball.position.set(game.world.centerX, game.world.centerY)
      ball.body.velocity.x = -ball.body.velocity.x
    }, this)

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

    if (screensaverMode) {
      players.each(player => player.scoreBanner.visible = false)
    }

    /* Functions */

    function applyPhysicsDefaults(sprite: Phaser.Sprite) {
      sprite.anchor.set(0.5, 0.5)
      game.physics.enable(sprite, Phaser.Physics.ARCADE)
      sprite.checkWorldBounds = true
      sprite.body.collideWorldBounds = true
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
      currentScript = paddle.script
    })

    if (currentScript) {
      var { nudge, curve } = currentScript
      ball.body.velocity
        .add(nudge.x, nudge.y)
        .rotate(0, 0, curve/60, true)

      ball.body.velocity
        .clampX(-600, 600)
        .clampY(-500, 500)
    }

    game.time.advancedTiming = false
    debugDisplay(game.time.fps)
    game.time.slowMotion = game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) ? 6.0 : 1.0
    game.time.desiredFps = 60 * game.time.slowMotion

    debugDisplay(JSON.stringify(ball.position, null, 2))
    debugDisplay(JSON.stringify(ball.body.velocity, null, 2))

    if (debugElem) {
      debugElem.innerText = debugText
    }

    /* Functions */

    function debugDisplay(s: string) {
      debugText += s + '\n'
    }

  }
}

