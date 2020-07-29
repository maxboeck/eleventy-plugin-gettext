# eleventy-plugin-i18n-gettext

[Eleventy](https://www.11ty.dev/) plugin which adds i18n with gettext and moment.js support.

- [Install](#install)
- [Demo](#demo)
- [Configuration](#configuration)
  - [Define language site directories](#define-language-site-directories)
  - [Create messages.po files](#create-messages.po-files)
  - [Create xx.11tydata.js files](#create-xx.11tydata.js-files)
- [API](#api)
  - [`i18n.enhance11tydata(obj, locale, dir?)`](#i18n.enhance11tydata(obj,-locale,-dir))
- [Sources](#sources)
- [Credits](#credits)

## Install

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-i18n-gettext).

```
npm install eleventy-plugin-i18n-gettext --save
```

## Demo

- [Demo site](https://eleventy-plugin-i18n-gettext.gissinger.net)
- [Source](https://github.com/sgissinger/eleventy-plugin-i18n-gettext-demo)


## Configuration

### Define language site directories

Create directories at the site root you can use either a simple language code (e.g. `en`) or language code with country code suffix (e.g. `en-us`).

Locale folder casing must be exactly the same in `locales` and `src`. In this example I choose lowercase in order to stick to Eleventy slugification configuration.

```
├─ locales
   └─ fr-fr
       ├─ messages.mo
       └─ messages.po
   └─ pt
       ├─ messages.mo
       └─ messages.po
├─ src
   └─ fr-fr
       └─ fr-fr.11tydata.js
   └─ pt
       └─ pt.11tydata.js
   └─ en
       └─ en.11tydata.js
```

### Create messages.po files

The simpliest manner to create `messages.po` files, is to copy them from the [demo code source](https://github.com/sgissinger/eleventy-plugin-i18n-gettext-demo/tree/master/locales).

You can download PO files editors, like [Poedit](https://poedit.net). Also, Poedit can be [configured](docs/Manage-translations-with-Poedit) to extract keys from source code and add them to the PO file.

- `messages.po` files store translations in plain text.
- `messages.mo` files are compiled from `messages.po`. _Poedit handle the creation of these files automatically, pushing them into your codebase is recommended_.

### Create xx.11tydata.js files

In these files we will enhance the [directory data object](https://www.11ty.dev/docs/data-template-dir/) passed to Eleventy templates.

```
const i18n = require('eleventy-plugin-i18n-gettext')

module.exports = () => {
    return i18n.enhance11tydata({}, __dirname)
}
```

```
<html lang="{{ lang }}" dir="{{ langDir }}">
```

## API

### `i18n.enhance11tydata(obj, locale, dir?)`
Returns: `any`

#### obj
Type: `any`

[Demo code source](https://github.com/sgissinger/eleventy-plugin-i18n-gettext-demo/blob/master/src/fr-fr/fr-fr.11tydata.js) has an example which uses a custom data object.

#### locale
Type: `string`

#### dir
Type: `string`

DefaultValue: `ltr`

AcceptedValues: `ltr`, `rtl`

## Sources

- [The Format of PO Files](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html)
- [Language-COUNTRY codes](http://www.lingoes.net/en/translator/langcode.htm)
- [ISO 639-1 Language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [ISO 3166-1 Country codes](https://en.wikipedia.org/wiki/ISO_3166-1)

## Credits

Inspired by adamduncan work on [eleventy-plugin-i18n](https://github.com/adamduncan/eleventy-plugin-i18n)