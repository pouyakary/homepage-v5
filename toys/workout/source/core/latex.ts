
//
// Copyright 2017-present. by Pouya Kary. All Rights Reserved
//   This code is property of Pouya Kary and is in no way granted
//   to be used by anyone else in anyways.
//

/// <reference path="parser.ts" />

namespace Workout.LaTeX {

    //
    // ─── TYPES ──────────────────────────────────────────────────────────────────────
    //

        type Formula = Parser.IFormulaNode
        type AST = Formula[ ]

    //
    // ─── GENERATE LATEX DIAGRAM ─────────────────────────────────────────────────────
    //

        export function generateDiagram ( ast: AST ) {
            const formulas =
                ast .filter( x => x.dependencies.length > 0 )
                    .map( x => generateLatexForFormula( x ) )
                    .join('\n\\\\[7pt]\n')

            return `\\begin{aligned}\n${ formulas }\n\\end{aligned}`
        }

    //
    // ─── GENERATE FORMULA ───────────────────────────────────────────────────────────
    //

        function generateLatexForFormula ( formula: Formula ) {
            const dependenciesCode =
                (( formula.dependencies.length > 0 )
                    ?   ( '\\rightarrow \\begin{cases}'
                        + formula.dependencies
                            .map( x => `\\text{${ x }}` )
                            .join('\\\\\n')
                        + '\\end{cases}'
                        )
                    :   ''
                    )

            return `${ formula.symbol } & ${ dependenciesCode }`
        }

    // ────────────────────────────────────────────────────────────────────────────────

}