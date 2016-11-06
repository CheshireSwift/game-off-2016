var Funnel = require('broccoli-funnel')
var typescript = require('broccoli-typescript-compiler').typescript
var mergeTrees = require('broccoli-merge-trees')

const sourceDir = 'src'
var html = new Funnel(sourceDir, { include: ['**/*.html'] })
var css = new Funnel(sourceDir, { include: ['**/*.css'] })

var rawJs = new Funnel(sourceDir, { include: ['**/*.js'] })
var ts = typescript(mergeTrees([sourceDir, 'typings']), {
    tsconfig: {
        compilerOptions: {
            module: "commonjs",
            sourceMap: true
        }
    }
})
var js = mergeTrees([rawJs, ts])

var libs = new Funnel('node_modules', { include: ['lodash/lodash.min.js'] })

module.exports = mergeTrees([html, js, css, libs])

