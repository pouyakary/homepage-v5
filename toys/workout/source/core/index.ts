
//
// Copyright 2017-present. by Pouya Kary. All Rights Reserved
//   This code is property of Pouya Kary and is in no way granted
//   to be used by anyone else in anyways.
//

/// <reference path="parser.ts" />
/// <reference path="octobass/adapter.ts" />

namespace Workout {

    //
    // ─── EXPORTS ────────────────────────────────────────────────────────────────────
    //

        export function compute ( code: string ) {
            const ast =
                Workout.Parser.parse( code )

            const computed =
                Workout.OctobassAdapter.compute( ast )

            return {
                ast: ast,
                results: computed
            }
        }

    // ────────────────────────────────────────────────────────────────────────────────

}