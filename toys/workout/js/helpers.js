
//
// Copyright 2017-present by Pouya Kary. All Rights Reserved
//   This code is property of Pouya Kary and is in no way granted
//   to be used by anyone else in anyways.
//

//
// ─── GRAPH ADDING ───────────────────────────────────────────────────────────────
//

    function setupGraphWithJSON ( graphJSON ) {
        jQuery(( ) => {
            Workout.UI.GraphView =
                new Springy.Graph( )

            if ( graphJSON )
                Workout.UI.GraphView.loadJSON( graphJSON )

            const springy =
                jQuery('#monitor-graph-view').springy({
                    graph: Workout.UI.GraphView
                })
        })
    }

// ────────────────────────────────────────────────────────────────────────────────

