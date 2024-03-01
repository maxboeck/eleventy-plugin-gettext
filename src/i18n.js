const fs = require('fs')
const path = require('path')

const Translater = require('./Translater')
const Formatter = require('./Formatter')

class i18n {
    formatter = new Formatter()
    translater = new Translater()

    pathPrefix = undefined

    configFunction(eleventyConfig, options = {}) {
        this.translater.setConfiguration(options)

        eleventyConfig.on('beforeBuild', () =>
            this.translater.reloadTranslations()
        )
        eleventyConfig.on('beforeWatch', () =>
            this.translater.reloadTranslations()
        )

        const gettextFn = (locale, key, ...args) => {
            return this._(locale, key, ...args)
        }
        const ngettextFn = (locale, singular, plural, count, ...args) => {
            return this._n(locale, singular, plural, count, ...args)
        }
        const igettextFn = (locale, key, obj) => {
            return this._i(locale, key, obj)
        }
        const nigettextFn = (locale, singular, plural, count, obj) => {
            return this._ni(locale, singular, plural, count, obj)
        }

        eleventyConfig.addShortcode('_', gettextFn)
        eleventyConfig.addShortcode('gettext', gettextFn)

        eleventyConfig.addShortcode('_n', ngettextFn)
        eleventyConfig.addShortcode('ngettext', ngettextFn)

        eleventyConfig.addShortcode('_i', igettextFn)
        eleventyConfig.addShortcode('_ni', nigettextFn)
    }

    enhance11tydata(obj, locale, dir = 'ltr') {
        if (fs.existsSync(locale)) {
            // Use path.win32 because it can handle all path styles:
            // - Windows with C:\xxx\yyy\zzz
            // - Linux with /xxx/yyy/zzz
            locale = path.win32.basename(locale)
        }

        if (!['ltr', 'rtl'].includes(dir)) {
            throw `Language direction '${dir}' is invalid. It must be 'ltr' or 'rtl'.`
        }

        const parsedLocale = this.translater.parseLocale(locale)

        obj.lang = parsedLocale.lang
        obj.langDir = dir
        obj.locale = locale

        obj._ = (key, ...args) => {
            return this._(locale, key, ...args)
        }
        obj.gettext = (key, ...args) => {
            return this._(locale, key, ...args)
        }
        obj._n = (singular, plural, count, ...args) => {
            return this._n(locale, singular, plural, count, ...args)
        }
        obj.ngettext = (singular, plural, count, ...args) => {
            return this._n(locale, singular, plural, count, ...args)
        }
        obj._i = (key, obj) => {
            return this._i(locale, key, obj)
        }
        obj._ni = (singular, plural, count, obj) => {
            return this._ni(locale, singular, plural, count, obj)
        }

        return obj
    }

    _(locale, key, ...args) {
        const translation = this.translater.translate(locale, key)
        return this.formatter.printf(translation, ...args)
    }

    _i(locale, key, obj) {
        const translation = this.translater.translate(locale, key)
        return this.formatter.dynamicInterpolation(translation, obj)
    }

    _n(locale, singular, plural, count, ...args) {
        const translation = this.translater.ntranslate(
            locale,
            singular,
            plural,
            count
        )

        return this.formatter.printf(translation, ...args)
    }

    _ni(locale, singular, plural, count, obj) {
        const translation = this.translater.ntranslate(
            locale,
            singular,
            plural,
            count
        )

        return this.formatter.dynamicInterpolation(translation, obj)
    }
}

module.exports = new i18n()
