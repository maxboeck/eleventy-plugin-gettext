const fs = require('fs')
const path = require('path')
const Gettext = require('node-gettext')
const GettextParser = require('gettext-parser')
const utils = require('./utils')

class Translater {
    defaultConfiguration = {
        defaultLocale: 'en',
        localeDirectory: 'locale',
        parserMode: 'po',
        sourceMessagesFile: 'messages.js',
        tokenFilePatterns: ['src/**/*.njk', 'src/**/*.js'],
        localeRegex: /^(?<lang>.{2})(?:-(?<country>.{2}))*$/
    }
    gettext = undefined
    configuration = {}

    setConfiguration(options = {}) {
        this.configuration = { ...this.defaultConfiguration, ...options }

        if (!['po', 'mo'].includes(this.configuration.parserMode)) {
            throw `Parser mode '${this.configuration.parserMode}' is invalid. It must be 'po' or 'mo'.`
        }
    }

    parseLocale(locale) {
        const match = locale.match(this.configuration.localeRegex)

        if (!match || !match.groups) {
            throw `Locale ${locale} does not match regex ${this.configuration.localeRegex}`
        }

        return {
            lang: match.groups.lang,
            locale: match.groups.country
                ? `${match.groups.lang}-${match.groups.country}`
                : match.groups.lang
        }
    }

    setLocale(locale) {
        try {
            const parsedLocale = this.parseLocale(locale)

            if (this.gettext) {
                this.gettext.setLocale(parsedLocale.locale)
            }
        } catch (err) {
            console.error(`Unable to parse locale "${locale}"`)
        }
    }

    translate(locale, key) {
        this.loadTranslations()
        this.setLocale(locale)

        return this.gettext.gettext(key)
    }

    ntranslate(locale, singular, plural, count) {
        this.loadTranslations()
        this.setLocale(locale)

        return this.gettext.ngettext(singular, plural, count)
    }

    reloadTranslations() {
        this.gettext = undefined
        this.loadTranslations()
    }

    loadTranslations() {
        if (this.gettext === undefined) {
            let gettextParser = undefined

            if (this.configuration.parserMode === 'po') {
                gettextParser = GettextParser.po
            } else if (this.configuration.parserMode === 'mo') {
                gettextParser = GettextParser.mo
            } else {
                throw `Parser mode '${this.configuration.parserMode}' is invalid. It must be 'po' or 'mo'.`
            }

            const localesDir = path.join(
                process.cwd(),
                this.configuration.localeDirectory
            )
            const localeFileName = `messages.${this.configuration.parserMode}`

            this.gettext = new Gettext()

            fs.readdirSync(localesDir, { withFileTypes: true })
                .filter((locale) => locale.isDirectory())
                .forEach((locale) => {
                    const filePath = path.join(
                        localesDir,
                        locale.name,
                        localeFileName
                    )
                    utils.log(`Loading ${filePath}.`)

                    const content = fs.readFileSync(filePath)
                    const parsedTranslations = gettextParser.parse(content)

                    const parsedLocale = this.parseLocale(locale.name)
                    this.gettext.addTranslations(
                        parsedLocale.locale,
                        'messages',
                        parsedTranslations
                    )
                })
        }
    }
}

module.exports = Translater
