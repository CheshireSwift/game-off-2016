var Funnel = require('broccoli-funnel')
var typescript = require('broccoli-typescript-compiler').typescript
var mergeTrees = require('broccoli-merge-trees')
var watchify = require('broccoli-watchify')

var sourceDir = new Funnel('src', { exclude: ['**/*.un~', '**/*.swp'] })

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

var js = watchify(mergeTrees([rawJs, ts]), {
  browserify: {
    entries: ['./main.js'],
    debug: true
  },
  outputFile: 'app.js',
  cache: true
})

module.exports = mergeTrees([html, js, css])

