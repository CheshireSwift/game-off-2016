import { ScriptConfig } from './Script'

export interface PlayerData {
  xPos: number;
  scriptConfig: ScriptConfig;
  keys: PlayerKeyMap<number>;
  tint: number;
}

export interface PlayerKeyMap<T> { up: T; down: T; }

