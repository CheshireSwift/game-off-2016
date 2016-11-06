'use strict'
import * as _ from 'lodash'

interface Players {
    left: Player;
    right: Player;
    each(f: (player: Player) => void);
    populate(field: String, computation: (data: PlayerData) => any);
    map<T>(f: string | ((player: Player) => T)): T[];
    both?: Player[];
}

interface Player {
    data: () => PlayerData;
    paddle?: Paddle;
    keys?: PlayerKeyMap<Phaser.Key>;
}

interface PlayerData {
    xPos: number;
    tint: number;
    keys: PlayerKeyMap<number>;
}

interface PlayerKeyMap<T> {
    up: T;
    down: T;
}

interface Paddle extends Phaser.Sprite {
    ballTint: number;
}

interface RenderLibrary {
    [key: string]: (graphics: Phaser.Graphics) => void
}

interface TextureLibrary {
    [key: string]: PIXI.Texture
}

window['main'] = function() {
    var debugElem = document.getElementById('debug');
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload, create, update });
    var textureLib: TextureLibrary;
    var ball: Phaser.Sprite;
    var emitter: Phaser.Particles.Arcade.Emitter;
    var players: Players = {
        left: {
            data: () => ({
                xPos: 25,
                scriptConfig: {
                    tint: 0xff2222
                },
                keys: { up: Phaser.KeyCode.W, down: Phaser.KeyCode.S }
            })
        },
        right: {
            data: () => ({
                xPos: game.world.width - 25,
                scriptConfig: {
                    tint: 0x22ffff
                },
                keys: { up: Phaser.KeyCode.UP, down: Phaser.KeyCode.DOWN }
            })
        },
        each: function(f) {
            _.forEach(this.both, f);
        },
        populate: function(field, computation) {
            this.each(player => {
                _.set(player, field, computation(player.data()));
            })
        },
        map: function(f) { return _.map(this.both, f) }
    };
    players.both = [players.left, players.right];

    function preload() {
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

        function renderTexture(graphicsCommands: (graphics: Phaser.Graphics) => void): PIXI.Texture {
            var graphics = new Phaser.Graphics(game);
            graphics.beginFill(0xffffff);
            graphicsCommands(graphics);
            graphics.endFill();
            return graphics.generateTexture();
        }

        textureLib = _.mapValues(renderLib, renderTexture)
    }

    function create() {
        function applyPhysicsDefaults(sprite: Phaser.Sprite) {
            sprite.anchor.set(0.5, 0.5);
            game.physics.enable(sprite, Phaser.Physics.ARCADE);
            sprite.checkWorldBounds = true;
            sprite.body.collideWorldBounds = true;
        }

        function createPaddle(data: PlayerData) {
            var paddle: Paddle = _.assign<Phaser.Sprite, Paddle>(
                game.add.sprite(data.xPos, game.world.centerY, textureLib['paddle']),
                { ballTint: data.tint }
            );
            applyPhysicsDefaults(paddle);
            paddle.body.immovable = true;
            return paddle;
        }

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignVertically = true;
        game.scale.pageAlignHorizontally = true;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        ball = game.add.sprite(game.world.centerX, game.world.centerY, textureLib['ball']);
        applyPhysicsDefaults(ball);
        ball.body.bounce.set(1);

        players.populate('paddle', createPaddle);
        players.populate('keys', data => game.input.keyboard.addKeys(data.keys));

        game.physics.arcade.velocityFromAngle(30, 600, ball.body.velocity);
        ball.body.maxVelocity = 600;

        emitter = game.add.emitter(game.world.centerX, game.world.centerY, 100);
        emitter.makeParticles(textureLib['particle']);
        emitter.setAlpha(1, 0, 400);
        emitter.gravity = 0;
        emitter.start(false, 400, 10);
    }

    function update() {
        var debugText = '';
        function debugDisplay(s: string) {
            debugText += s + '\n';
        }

        var halfBall = ball.body.velocity.clone().multiply(0.3, 0.3);
        emitter.maxParticleSpeed = Phaser.Point.add(halfBall, new Phaser.Point(25, 25));
        emitter.minParticleSpeed = Phaser.Point.add(halfBall, new Phaser.Point(-25, -25));
        emitter.emitX = ball.x;
        emitter.emitY = ball.y;

        players.each(player => {
            player.paddle.body.velocity = new Phaser.Point();
            if (player.keys.up.isDown) {
                player.paddle.body.velocity.y -= 500;
            }
            if (player.keys.down.isDown) {
                player.paddle.body.velocity.y += 500;
            }
        })

        game.physics.arcade.collide(ball, players.map('paddle'), function (ball: Phaser.Sprite, paddle: Paddle) {
            console.log(`ball ${ball.position} collided with paddle ${paddle.position} (tint ${paddle.ballTint.toString(16)})`);
            var tint = _.get<number>(paddle, 'scriptConfig.tint');
            ball.tint = tint;
            emitter.setAll('tint', tint);
        })

        debugDisplay(JSON.stringify(ball.position, null, 2));
        debugElem.innerText = debugText;
    }
}
