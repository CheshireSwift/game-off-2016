'use strict'

window.main = function() {
  /* global Phaser _ */
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload, create, update })
  var textureLib
  var ball
  var players = {
    left: {
      data: () => ({
        xPos: 25,
        tint: 0xff2222,
        keys: { up: Phaser.KeyCode.W, down: Phaser.KeyCode.S } 
      })
    },
    right: {
      data: () => ({
        xPos: game.world.width - 25,
        tint: 0x22ffff,
        keys: { up: Phaser.KeyCode.UP, down: Phaser.KeyCode.DOWN } 
      })
    },
    each: function(f) {
      console.log(this.both)
      _.forEach(this.both, f)
    },
    populate: function(field, computation) {
      this.each(player => {
        _.set(player, field, computation(player.data()))
      })
    },
    map: function(f) {
      return _.map(this.both, f)
    }
  }
  players.both = [players.left, players.right]

  function preload() {
    var renderLib = {
      ball: function(graphics) {
        graphics.drawRect(0, 0, 12, 12)
      },
      paddle: function(graphics) {
        graphics.drawRect(0, 0, 12, 72)
      }
    }

    function renderTexture(graphicsCommands) {
      var graphics = new Phaser.Graphics(game)
      graphics.beginFill(0xffffff)
      graphicsCommands(graphics)
      graphics.endFill()
      return graphics.generateTexture()
    }

    textureLib = _.mapValues(renderLib, renderTexture)
  }

  function create() {
    function applyPhysicsDefaults(sprite) {
      sprite.anchor.set(0.5, 0.5)
      game.physics.enable(sprite, Phaser.Physics.ARCADE)
      sprite.checkWorldBounds = true
      sprite.body.collideWorldBounds = true
    }

    function createPaddle(data) {
      var paddle = game.add.sprite(data.xPos, game.world.centerY, textureLib.paddle)
      applyPhysicsDefaults(paddle)
      paddle.body.immovable = true
      paddle.ballTint = data.tint
      return paddle
    }

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.pageAlignVertically = true
    game.scale.pageAlignHorizontally = true

    game.physics.startSystem(Phaser.Physics.ARCADE)

    ball = game.add.sprite(game.world.centerX, game.world.centerY, textureLib.ball)
    applyPhysicsDefaults(ball)
    ball.body.bounce.set(1)

    players.populate('paddle', createPaddle)
    players.populate('keys', data => game.input.keyboard.addKeys(data.keys))

    game.physics.arcade.velocityFromAngle(30, 600, ball.body.velocity)
    ball.body.maxVelocity = 600
  }

  function update() {
    var debugText = ''
    function debugDisplay(s) {
      debugText += s + '\n'
    }

    players.each(player => {
      player.paddle.body.velocity = new Phaser.Point()
      if (player.keys.up.isDown) {
        player.paddle.body.velocity.y -= 500
      }
      if (player.keys.down.isDown) {
        player.paddle.body.velocity.y += 500
      }
    })

    game.physics.arcade.collide(ball, players.map('paddle'), function (ball, paddle) {
      console.log(`ball ${ball.position} collided with paddle ${paddle.position} (tint ${paddle.ballTint.toString(16)})`)
      ball.tint = paddle.ballTint
    })

    debugDisplay(JSON.stringify(ball.position, null, 2))
    document.getElementById('debug').innerText = debugText
  }
}
