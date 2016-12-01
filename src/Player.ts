import * as _ from 'lodash'
import Paddle from './Paddle'
import { PlayerData, PlayerKeyMap, buildLeftData, buildRightData } from './PlayerData'
import TextureLibrary from './TextureLibrary'
import { ScriptConfig } from './Script'

export class Player {
  public readonly data: PlayerData
  public readonly paddle: Paddle
  public readonly keys: PlayerKeyMap<Phaser.Key>
  public readonly scoreBanner: Phaser.Text
  private _score: number

  constructor(
      game: Phaser.Game,
      data: PlayerData,
      textureLib: TextureLibrary,
      scoreBannerLeft: number,
      scoreBannerRight: number,
      inputHandlerKey: string) {
    this.data = data
    this.paddle = new Paddle(game, data, textureLib['paddle'], textureLib['halo'])
    this.keys = game.input.keyboard.addKeys(data.keys)
    this.scoreBanner = game.add.text(scoreBannerLeft, 20, '', { font: '32px Monoton', fill: '#' + data.tint.toString(16) })
      .setTextBounds(0, 0, scoreBannerRight - scoreBannerLeft, 0)
    this.scoreBanner.smoothed = false
    this.score = 0

    var paddle = this.paddle
    window[inputHandlerKey] = (script: ScriptConfig) => {
      paddle.script = script
    }
  }

  public get score(): number {
    return this._score
  }

  public set score(newScore: number) {
    this._score = newScore
    this.scoreBanner.text = this.score.toString()
  }

  public incrementScore(count: number = 1) {
    this.score += count
  }

  static createPlayers(game: Phaser.Game, textureLib: TextureLibrary): Players {
    var leftData = buildLeftData(game)
    var rightData = buildRightData(game)
    leftData.scriptConfig = window['leftScript'] || leftData.scriptConfig
    rightData.scriptConfig = window['rightScript'] || rightData.scriptConfig
    var left = new Player(game, leftData, textureLib, leftData.xPos, rightData.xPos, 'leftFileListener')
    var right = new Player(game, rightData, textureLib, leftData.xPos, rightData.xPos, 'rightFileListener')
    right.scoreBanner.boundsAlignH = 'right'

    return {
      left, right,
      both: [left, right],
      each: function(f) { _.forEach(this.both, f)     },
      map:  function(f) { return _.map(this.both, f)  },
    }
  }
}

export interface Players {
  left: Player;
  right: Player;
  each(f: (player: Player) => void);
  map<T>(f: string | ((player: Player) => T)): T[];
  both?: Player[];
}

