#!/usr/bin/env node
const Extracter = require('./src/Extracter')
const argv = require('minimist')(process.argv.slice(2), {
    string: ['out'],
    boolean: ['extract'],
    unknown: function (unknownArgument) {
        throw new Error(`Unsupported argument '${unknownArgument}'`)
    }
})

if (argv.extract) {
    let opts = {}

    if (argv.out) {
        opts.outputDirectory = argv.out
    }

    const messageExtracter = new Extracter(opts)
    messageExtracter.run()
}
