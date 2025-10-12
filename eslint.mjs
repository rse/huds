/*
**  HUDS -- Head-Up-Display Server (HUDS)
**  Copyright (c) 2020-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  import required modules  */
import js        from "@eslint/js"
import globals   from "globals"
import importPlugin from "eslint-plugin-import"
import nPlugin   from "eslint-plugin-n"

/*  export ESLint flat configuration  */
export default [
    /*  apply recommended ESLint rules  */
    js.configs.recommended,

    /*  global configuration  */
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType:  "module",
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.commonjs,
                process: "readonly"
            }
        },

        plugins: {
            import: importPlugin,
            n:      nPlugin
        },

        rules: {
            /*  enforce "standard" style rules  */
            "no-var":                            "error",
            "prefer-const":                      "error",
            "no-unused-vars":                    [ "error", {
                "args":                          "none",
                "caughtErrors":                  "none",
                "ignoreRestSiblings":            true,
                "vars":                          "all"
            } ],
            "comma-dangle":                      [ "error", {
                "arrays":                        "never",
                "objects":                       "never",
                "imports":                       "never",
                "exports":                       "never",
                "functions":                     "never"
            } ],
            "comma-spacing":                     [ "error", { "before": false, "after": true } ],
            "comma-style":                       [ "error", "last" ],
            "dot-location":                      [ "error", "property" ],
            "eqeqeq":                            [ "error", "always", { "null": "ignore" } ],
            "func-call-spacing":                 [ "error", "never" ],
            "keyword-spacing":                   [ "error", { "before": true, "after": true } ],
            "no-floating-decimal":               "error",
            "no-implied-eval":                   "error",
            "no-new-func":                       "error",
            "no-new-wrappers":                   "error",
            "no-tabs":                           "error",
            "no-trailing-spaces":                "error",
            "no-undef-init":                     "error",
            "no-whitespace-before-property":     "error",
            "object-curly-spacing":              [ "error", "always" ],
            "one-var":                           [ "error", { "initialized": "never" } ],
            "rest-spread-spacing":               [ "error", "never" ],
            "space-before-blocks":               [ "error", "always" ],
            "space-before-function-paren":       [ "error", "always" ],
            "space-infix-ops":                   "error",
            "space-unary-ops":                   [ "error", { "words": true, "nonwords": false } ],
            "spaced-comment":                    [ "error", "always", {
                "line": {
                    "markers":                   [ "*package", "!", "/", ",", "=" ]
                },
                "block": {
                    "balanced":                  true,
                    "markers":                   [ "*package", "!", ",", ":", "::", "flow-include" ],
                    "exceptions":                [ "*" ]
                }
            } ],
            "yoda":                              [ "error", "never" ],

            /*  plugin: n (node)  */
            "n/handle-callback-err":             [ "error", "^(err|error)$" ],
            "n/no-callback-literal":             "error",
            "n/no-deprecated-api":               "error",
            "n/no-exports-assign":               "error",
            "n/no-new-require":                  "error",
            "n/no-path-concat":                  "error",
            "n/process-exit-as-throw":           "error",

            /*  plugin: import  */
            "import/export":                     "error",
            "import/first":                      "error",
            "import/no-absolute-path":           [ "error", { "esmodule": true, "commonjs": true, "amd": false } ],
            "import/no-duplicates":              "error",
            "import/no-named-default":           "error",
            "import/no-webpack-loader-syntax":   "error",

            /*  modified rules (from original config)  */
            "indent":                            [ "error", 4, { "SwitchCase": 1 } ],
            "linebreak-style":                   [ "error", "unix" ],
            "semi":                              [ "error", "never" ],
            "operator-linebreak":                [ "error", "after", { "overrides": { "&&": "before", "||": "before", ":": "after" } } ],
            "brace-style":                       [ "error", "stroustrup", { "allowSingleLine": true } ],
            "quotes":                            [ "error", "double" ],

            /*  disabled rules (from original config)  */
            "no-multi-spaces":                   "off",
            "no-multiple-empty-lines":           "off",
            "key-spacing":                       "off",
            "object-property-newline":           "off",
            "curly":                             "off",
            "space-in-parens":                   "off",
            "array-bracket-spacing":             "off",
            "require-atomic-updates":            "off"
        }
    }
]
