import * as _ from 'lodash'
type RenderFunc = (graphics: Phaser.Graphics) => void
interface RenderLibrary   { [key: string]: RenderFunc }
export default class TextureLibrary  {
  [key: string]: PIXI.Texture

  constructor(game: Phaser.Game, renderLib: RenderLibrary) {
    _.assign(this, _.mapValues(renderLib, renderTexture))

    function renderTexture(graphicsCommands: RenderFunc): PIXI.Texture {
      var graphics = new Phaser.Graphics(game)
      graphics.beginFill(0xffffff)
      graphicsCommands(graphics)
      graphics.endFill()
      return graphics.generateTexture()
    }
  }
}



