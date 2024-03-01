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

        const shortcodeFns = this.getShortcodeFns()
        Object.keys(shortcodeFns).forEach((shortcodeName) => {
            eleventyConfig.addShortcode(
                shortcodeName,
                shortcodeFns[shortcodeName]
            )
        })
    }

    getShortcodeFns(contextLocale) {
        let fns = {
            gettextFn: this._,
            ngettextFn: this._n,
            igettextFn: this._i,
            nigettextFn: this._ni
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
        const shortcodeFns = this.getShortcodeFns(locale)

        obj.lang = parsedLocale.lang
        obj.langDir = dir
        obj.locale = locale

        Object.keys(shortcodeFns).forEach((shortcodeName) => {
            obj[shortcodeName] = shortcodeFns[shortcodeName]
        })

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
