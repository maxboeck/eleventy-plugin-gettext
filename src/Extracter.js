const fs = require('fs')
const path = require('path')
const glob = require('glob')
const gt = require('gettext-parser')
const nunjucksParser = require('gettext-nunjucks')
const utils = require('./utils')

const keywordSpec = require('./keywords.json')

class Extracter {
    constructor(opts) {
        this.configuration = Object.assign(
            {
                outputDirectory: 'locale',
                outputFile: 'messages.po',
                sourceFilePatterns: ['src/**/*.njk', 'src/**/*.js']
            },
            opts
        )
        this.parser = new nunjucksParser(keywordSpec)
    }

    generateOutputFile(translations) {
        const outDirPath = path.join(
            process.cwd(),
            this.configuration.outputDirectory
        )
        const outFilePath = path.join(outDirPath, this.configuration.outputFile)
        if (!fs.existsSync(outDirPath)) {
            fs.mkdirSync(outDirPath)
        }

        const revisionDate = new Date().toISOString()
        const headers = {
            Language: 'de_DE',
            'Content-Type': 'text/plain; charset=UTF-8',
            'Plural-Forms': 'nplurals=2; plural=(n != 1);',
            'X-Crowdin-Language': 'de',
            'X-Crowdin-File': this.configuration.outputFile,
            'PO-Revision-Date': revisionDate
        }
        const data = {
            charset: 'utf-8',
            headers: headers,
            translations: {
                '': translations
            }
        }
        const outFileContent = gt.po.compile(data)
        utils.log(
            `Writing new translation source file in ${this.configuration.outputDirectory}/${this.configuration.outputFile}`
        )
        fs.writeFileSync(outFilePath, outFileContent)
    }

    parseTemplate(templateString, templatePath) {
        const strings = this.parser.parse(templateString)
        const translations = {}

        for (const key in strings) {
            if (Object.prototype.hasOwnProperty.call(strings, key)) {
                const msgid = strings[key].msgid || key
                translations[msgid] = translations[msgid] || {
                    msgid,
                    comments: {}
                }

                if (strings[key].plural) {
                    translations[msgid].msgid_plural =
                        translations[msgid].msgid_plural || strings[key].plural
                    translations[msgid].msgstr = ['', '']
                }

                if (templatePath) {
                    translations[msgid].comments.reference = (
                        translations[msgid].comments.reference || ''
                    )
                        .split('\n')
                        .concat([templatePath])
                        .join('\n')
                        .trim('\n')
                }
            }
        }
        return translations
    }

    findMatches() {
        const stringRegExp = '(?:\'.+?\'|".+?")'
        const localeRegExp = '\\(?\\s*(?:locale\\s*,)?'

        const singular = new RegExp(
            `_i?${localeRegExp}\\s*${stringRegExp}`,
            'g'
        )
        const plural = new RegExp(
            `_ni?${localeRegExp}\\s*${stringRegExp}\\s*,\\s*${stringRegExp}`,
            'g'
        )

        const cleanMatchString = (str) => {
            return (
                str
                    .replace(/\(?\s*locale\s*,/, '(')
                    .replace(/([\(,])\s+(["'])/g, '$1$2') + ')'
            )
        }

        const sourceFilePaths = this.configuration.sourceFilePatterns
            .map((pattern) => glob.sync(pattern))
            .flat()
            .filter(Boolean)

        const matches = sourceFilePaths
            .map((filePath) => {
                const fileContent = fs.readFileSync(filePath).toString()
                const singularMatches = fileContent.match(singular)
                const pluralMatches = fileContent.match(plural)

                if (singularMatches || pluralMatches) {
                    utils.log(`Localization tokens found in ${filePath}.`)
                }

                const matchesAtFilePath = []
                    .concat(singularMatches, pluralMatches)
                    .flat()
                    .filter(Boolean)
                    .map(cleanMatchString)

                if (matchesAtFilePath.length) {
                    return {
                        template: filePath,
                        content: matchesAtFilePath
                    }
                }
                return null
            })
            .flat()
            .filter(Boolean)

        return matches
    }

    run() {
        const matches = this.findMatches()
        let data = {}

        matches.forEach(({ template, content }) => {
            const templateString = content
                .map((str) => `{{ ${str} }}`)
                .join('\n')
            const translations = this.parseTemplate(templateString, template)
            if (translations && Object.keys(translations)) {
                data = utils.mergeDeep(translations, data)
            }
        })

        this.generateOutputFile(data)
    }
}

module.exports = Extracter
