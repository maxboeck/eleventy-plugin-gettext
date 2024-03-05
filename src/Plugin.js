const fs = require('fs')
const path = require('path')

const Translater = require('./Translater')
const Formatter = require('./Formatter')

class Plugin {
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

        const templateFns = this.getTemplateFunctions(options.defaultLocale)
        Object.keys(templateFns).forEach((fnName) => {
            eleventyConfig.addGlobalData(fnName, templateFns[fnName])
        })
    }

    getTemplateFunctions(contextLocale) {
        let fns = {
            gettextFn: this._.bind(this),
            ngettextFn: this._n.bind(this),
            igettextFn: this._i.bind(this),
            nigettextFn: this._ni.bind(this)
        }

        if (contextLocale) {
            fns = {
                gettextFn: (key, ...args) => {
                    return this._(contextLocale, key, ...args)
                },
                ngettextFn: (singular, plural, count, ...args) => {
                    return this._n(
                        contextLocale,
                        singular,
                        plural,
                        count,
                        ...args
                    )
                },
                igettextFn: (key, obj) => {
                    return this._i(contextLocale, key, obj)
                },
                nigettextFn: (singular, plural, count, obj) => {
                    return this._ni(contextLocale, singular, plural, count, obj)
                }
            }
        }

        return {
            _: fns.gettextFn,
            _n: fns.ngettextFn,
            _i: fns.igettextFn,
            _ni: fns.nigettextFn,
            gettext: fns.gettextFn,
            ngettext: fns.ngettextFn
        }
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
        const templateFns = this.getTemplateFunctions(locale)

        obj.lang = parsedLocale.lang
        obj.langDir = dir
        obj.locale = locale
        obj = Object.assign(obj, templateFns)

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

module.exports = new Plugin()
