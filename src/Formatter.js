const printf = require('printf')
class Formatter {
    dynamicInterpolation(translation, obj) {
        if (obj) {
            let codeToEvaluate = ''

            for (const prop in obj) {
                codeToEvaluate += `const ${prop} = "${obj[prop]}";`
            }

            return eval(`${codeToEvaluate}\`${translation}\``)
        }
        return translation
    }

    printf(translation, ...args) {
        if (args.length) {
            return printf(translation, ...args)
        }
        return translation
    }
}

module.exports = Formatter
