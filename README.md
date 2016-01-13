# Stripdown.js

Stripdown.js is a lightweight parser that recognizes a subset of markdown rules.  
It is best used in website comment sections where full markdown editors are overkill.

## Usage

Use `stripdown()` to convert text to HTML:

    var htmlOutput = stripdown(textInput);

Stripdown.js will also safely escape [all untrusted characters](https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content).

## Syntax

The following patterns are supported:

#### Inline Styling

    _italic text_
    
    __bold text__
    
#### Code tags

    `code`

#### Links

    http://url.com
    
    [link](url.com)

#### Lists

    1. Numbered list
    
    a. Lettered list
    
    - Dashed list

#### Blockquotes

    > Blockquote

#### Preformatted Text

        Preformatted text indented by 4 spaces

## Demo

Live demo [here](http://chbk.github.io/stripdown.js).
