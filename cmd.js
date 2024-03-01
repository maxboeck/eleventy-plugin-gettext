#!/usr/bin/env node
const Extracter = require('./src/Extracter')
const argv = require('minimist')(process.argv.slice(2), {
    boolean: ['extract'],
    unknown: function (unknownArgument) {
        throw new Error(`Unsupported argument '${unknownArgument}'`)
    }
})

if (argv.extract) {
    const messageExtracter = new Extracter()
    messageExtracter.run()
}
