import * as _ from 'lodash';
import Color = require('color');
import { ScriptConfig } from './Script';
declare var TextEncoder;

export default function colourHash(scriptConfig: ScriptConfig): number {
    var concatString = _.reduce(scriptConfig, (acc: string, val: number, key: string) => acc + val + key, '')
    var hash = _.reduce(
        new TextEncoder().encode(concatString),
        (acc: number, val: number, index: number) => (index * index + acc ^ (256 - val)) % 256
    )
    return parseInt(Color().hsl(360 * hash/256.0, 255, 65).hexString().substring(1), 16)
}

