
//
// Copyright 2017-present by Pouya Kary. All Rights Reserved.
//   This code is property of Pouya Kary and is in no way granted
//   to be used by anyone else in anyways.
//

/// <reference path="../parser.ts" />
/// <reference path="octobass.ts" />


namespace Workout.OctobassAdapter {

    //
    // ─── TYPES ──────────────────────────────────────────────────────────────────────
    //

        type OctobassFormat = Octobass.IInputDataFormat<string>[ ]
        type OctobassComputedData = Octobass.IOctobassComputedDependencies<number>
        type AST = Parser.IFormulaNode[ ]

    //
    // ─── COMPUTE ────────────────────────────────────────────────────────────────────
    //

        export function compute ( ast: AST ) {
            const octobassData =
                createOctobassData( ast )

            const computedValue =
                Octobass.exec( octobassData, octobassComputingFunction )

            return computedValue
        }

    //
    // ─── CREATE GRAPH ───────────────────────────────────────────────────────────────
    //

        function createOctobassData ( ast: AST ): OctobassFormat {
            return ast.map( node => ({
                info: {
                    id: node.symbol,
                    name: node.symbol,
                },
                dependencies: new Set( node.dependencies ),
                formula: node.formula
            }))
        }

    //
    // ─── OCTOBASS COMPUTE FUNCTION ──────────────────────────────────────────────────
    //

        function octobassComputingFunction ( computedData: OctobassComputedData,
                                                    input: Octobass.IInputDataFormat<string> ): number {

            const functionDataAsConstants =
                [ ...input.dependencies ]
                    .map( symbol =>
                        `const ${ symbol } = ${ computedData[ symbol ] };`)
                    .join('\n')

            const funcString = (`(( ) => {
                const {
                    PI, E, abs, acos, acosh, asin, asinh, atan, atan2, atanh,
                    cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot,
                    imul, log, log10, log1p, log2, max, min, pow, random, round
                } = Math;

                ${ functionDataAsConstants }

                return ${ input.formula };
            })( )`)

            const computedValue =
                eval( funcString ) as number

            return computedValue
        }

    // ────────────────────────────────────────────────────────────────────────────────

}