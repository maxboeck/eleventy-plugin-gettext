# Eleventy Gettext Plugin

Plugin for gettext string extraction and translation.
Original code by Sebastien Gissinger: [eleventy-plugin-i18n-gettext](https://github.com/sgissinger/eleventy-plugin-i18n-gettext)

This modifies the original plugin to:

-   add a command line script for text extraction
-   generate a valid PO file from extracted messages
-   add `gettext` and `ngettext` as functions
-   remove moment / date handling

## Text Extraction

Run `npx eleventy-plugin-gettext --extract`
