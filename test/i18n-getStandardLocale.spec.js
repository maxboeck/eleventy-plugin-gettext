'use strict'

const chai = require('chai')
const i18n = require('../i18n')

chai.should()

describe('i18n.getStandardLocale', () => {
    describe('default localeRegex', () => {
        it('should returns the full locale', () => {
            i18n.init()
    
            const expected = 'fr-fr'
            const actual = i18n.getStandardLocale('fr-fr')
    
            actual.should.be.equal(expected)
        })

        it('should returns the lang locale', () => {
            i18n.init()
    
            const expected = 'fr'
            const actual = i18n.getStandardLocale('fr')
    
            actual.should.be.equal(expected)
        })

        it('should throw an exception if locale does not match', () => {
            (() => {
                i18n.init()
                i18n.getStandardLocale('benl')
            })
            .should.throw('Locale benl does not match regex /^(?<lang>.{2})(?:-(?<country>.{2}))*$/')
        })
    })

    describe('custom localeRegex', () => {
        it('should returns the full locale', () => {
            i18n.init({
                localeRegex: /^(?:(?<country>.{2}))*(?<lang>.{2})$/
            })

            const expected = 'nl-be'
            const actual = i18n.getStandardLocale('benl')

            actual.should.be.equal(expected)
        })

        it('should returns the lang locale', () => {
            i18n.init({
                localeRegex: /^(?:(?<country>.{2}))*(?<lang>.{2})$/
            })

            const expected = 'nl'
            const actual = i18n.getStandardLocale('nl')

            actual.should.be.equal(expected)
        })

        it('should throw an exception if locale does not match', () => {
            (() => {
                i18n.init({
                    localeRegex: /^(?:(?<country>.{2}))*(?<lang>.{2})$/
                })
                i18n.getStandardLocale('nl-be')
            })
            .should.throw('Locale nl-be does not match regex /^(?:(?<country>.{2}))*(?<lang>.{2})$/')
        })
    })
})