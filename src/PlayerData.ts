import { ScriptConfig } from './Script'

export interface PlayerData {
  xPos: number;
  scriptConfig: ScriptConfig;
  keys: PlayerKeyMap<number>;
  tint: number;
}

export interface PlayerKeyMap<T> { up: T; down: T; }

export function buildLeftData(game: Phaser.Game): PlayerData {
  return {
    xPos: game.world.left + 25,
    scriptConfig: {
      curve: 5,
      nudge: { x: 1000, y: 0 }
    },
    keys: { up: Phaser.KeyCode.W, down: Phaser.KeyCode.S },
    tint: 0xff1111
  }
}

export function buildRightData(game: Phaser.Game): PlayerData {
  return {
    xPos: game.world.width - 25,
    scriptConfig: {
      curve: 30,
      nudge: { x: 5, y: 0 }
    },
    keys: { up: Phaser.KeyCode.UP, down: Phaser.KeyCode.DOWN },
    tint: 0x11ffff
  }
}

