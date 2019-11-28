
//
// Copyright 2017 by Pouya Kary. All Rights Reserved
//   This code is property of Pouya Kary and is in no way granted
//   to be used by anyone else in anyways.
//

/// <reference path="../core/index.ts" />

declare function setupGraphWithJSON( graph?: Springy.IGraphJSONInput ): void


namespace Workout.UI {

    //
    // ─── GLOBALS ────────────────────────────────────────────────────────────────────
    //

        export let GraphView: Springy.Graph

    //
    // ─── HELPING DECELERATIONS ──────────────────────────────────────────────────────
    //

        declare module katex {
            function renderToString ( a: any, b: any ): string
        }

        type Formula = Parser.IFormulaNode
        type Results = Octobass.IOctobassComputedDependencies<number>
        type AST = Formula[ ]
        type GraphJSON = Springy.IGraphJSONInput

    //
    // ─── CONSTANTS ──────────────────────────────────────────────────────────────────
    //

        const localStorageId = 'us.kary.workout.code'

    //
    // ─── MAIN ───────────────────────────────────────────────────────────────────────
    //

        window.onload = ( ) => {
            noBounce.init({
                animated: true
            })

            // loading
            checkAndLoadCodeInLocalStorage( )

            // event setups
            setupInputBoxEvents( )
            setupTabBarEvents( )
            setupWindowResizeEvent( )
            setupCanvasUpdateEvents( )
            disableEvents( )

            // do first render stuff
            onInputChange( )
            configureWindowBasedOnScreenWidth( )
            setupGraphWithJSON( )
        }

    //
    // ─── SETUP CANVAS UPDATE EVENTS ─────────────────────────────────────────────────
    //

        function setupCanvasUpdateEvents ( ) {
            const inputBox = document.getElementById('code-input')!

            // on big screens
            inputBox.onchange = ( ) =>
                ( screen.width > 500
                    ? updateGraph
                    : null
                    )

            // on small screens
        }

    //
    // ─── UPDATE GRAPH ───────────────────────────────────────────────────────────────
    //

        function updateGraph ( ) {
            const { ast, results, input } =
                    getLatestComputation( )

            createDependencyGraph( ast, results )
        }

    //
    // ─── DISABLE TOUCH EVENTS ───────────────────────────────────────────────────────
    //

        function disableEvents ( ) {
            const disable = ( e: Event ) =>
                e.preventDefault( )

            // document.body.ontouchmove = disable

            const graphCanvas =
                ( document.getElementById('monitor-graph-view')! as HTMLCanvasElement )

            const canvasDisableFunction = ( ) => {
                graphCanvas.ontouchmove  = disable
                graphCanvas.onclick      = disable
                graphCanvas.ondrag       = disable
                graphCanvas.onmouseenter = disable
                graphCanvas.onmousemove  = disable
                graphCanvas.onmouseover  = disable
            }

            setTimeout( canvasDisableFunction , 50)
        }

    //
    // ─── SET EVENTS FOR INPUT BOX ───────────────────────────────────────────────────
    //

        function setupInputBoxEvents ( ) {
            const inputBox =
                document.getElementById('code-input')!

            inputBox.onchange   = onInputChange
            inputBox.oninput    = onInputChange
            inputBox.onkeyup    = onInputChange
        }

    //
    // ─── SETUP WINDOW RESIZE EVENT ──────────────────────────────────────────────────
    //

        function setupWindowResizeEvent ( ) {
            window.onresize = ( ) =>
                 configureWindowBasedOnScreenWidth( )
        }

    //
    // ─── SETUP TAB BAR EVENTS ───────────────────────────────────────────────────────
    //

        function setupTabBarEvents ( ) {
            document.getElementById('editor-tab-button')!
                .onclick = ( ) => changeTab('input-container')

            document.getElementById('results-tab-button')!
                .onclick = ( ) => changeTab('monitor-view')
        }

    //
    // ─── LOAD IF TEXT IS IN LOCAL STORAGE ───────────────────────────────────────────
    //

        function checkAndLoadCodeInLocalStorage ( ) {
            const input =
                ( document.getElementById('code-input') as HTMLTextAreaElement )!
            const defaultCode =
                input.value = (
                    [   "a = 2"
                    ,   "y = x + 2"
                    ,   "x = 3 * a"
                    ,   "z = y + w"
                    ]
                    .join('\n')
                )

            try {
                const code =
                    localStorage.getItem( localStorageId )

                if ( code )
                    input.value = code
                else
                    input.value = defaultCode
            } catch {
                input.value = defaultCode
            }
        }

    //
    // ─── ON CHANGE ──────────────────────────────────────────────────────────────────
    //

        function onInputChange ( ) {
            try {
                const { ast, results, input } =
                    getLatestComputation( )

                renderDependencyLaTeX( ast )
                prettyPrintResults( results )
                createDependencyGraph( ast, results )

                localStorage.setItem( localStorageId, input )

            } catch {
                // who cares...
            }
        }

    //
    // ─── GET COMPUTATION ────────────────────────────────────────────────────────────
    //

        function getLatestComputation ( ) {
            const input =
                ( document.getElementById('code-input') as HTMLTextAreaElement )!
                .value

            const computedResults =
                Workout.compute( input )

            return {
                input:      input,
                ast:        computedResults.ast,
                results:    computedResults.results
            }
        }

    //
    // ─── PRETTY PRINT RESULTS ───────────────────────────────────────────────────────
    //

        function prettyPrintResults ( results: Results ) {
            const resultsInLaTeX =
                Object.keys( results ).map( key =>
                    results[ key ]
                        ? `\\ ${ key } & = ${ results[ key ]}`
                        : null )
                    .join('\n\\\\[5pt]\n')

            const fullLaTeX =
                `\\begin{aligned}\n${ resultsInLaTeX }\n\\end{aligned}`

            renderLaTeX( "results", fullLaTeX )
        }

    //
    // ─── RENDER LATEX ───────────────────────────────────────────────────────────────
    //

        function renderDependencyLaTeX ( ast: AST ) {
            const compiledTeX =
                Workout.LaTeX.generateDiagram( ast )

            renderLaTeX( 'katex-display', compiledTeX )
        }

    //
    // ─── RENDER LATEX ───────────────────────────────────────────────────────────────
    //

        function renderLaTeX ( id: string, code: string ) {
            const katexDisplay =
                document.getElementById( id )!
            katexDisplay.innerHTML =
                katex.renderToString( code, { displayMode: true } );
        }

    //
    // ─── CHANGE TABS ────────────────────────────────────────────────────────────────
    //

        function changeTab ( toBeActiveTabId: string ) {
            changeTabView( toBeActiveTabId )
            changeTabButtons( toBeActiveTabId )
        }

    //
    // ─── CHANGE TAB VIEW ────────────────────────────────────────────────────────────
    //

        function changeTabView ( toBeActiveTabId: string ) {
            const toBeDeActivatedTabId =
                (( toBeActiveTabId === "input-container" )
                    ? "monitor-view"
                    : "input-container"
                    )

            document.getElementById( toBeActiveTabId )!
                .classList.remove('hidden')
            document.getElementById( toBeDeActivatedTabId )!
                .classList.add('hidden')
        }

    //
    // ─── CHANGE TAB BUTTONS ─────────────────────────────────────────────────────────
    //

        function changeTabButtons ( toBeActiveTabId: string ) {
            const toBeActivatedTabButtonId =
                (( toBeActiveTabId === "input-container" )
                    ? "editor-tab-button"
                    : "results-tab-button"
                    )
            const toBeDeActivatedTabButtonId =
                (( toBeActiveTabId === "input-container" )
                    ? "results-tab-button"
                    : "editor-tab-button"
                    )

            if ( toBeActiveTabId !== "input-container" )
                updateGraph( )

            document.getElementById( toBeActivatedTabButtonId )!
                .classList.add('active')
            document.getElementById( toBeDeActivatedTabButtonId )!
                .classList.remove('active')
        }

    //
    // ─── CONFIGURE WINDOW BASED ON WIDTH ────────────────────────────────────────────
    //

        function configureWindowBasedOnScreenWidth ( ) {
            const getClassList = ( id: string ) =>
                document.getElementById( id )!.classList

            const tabBar =
                getClassList('tab-bar')
            const editorView =
                getClassList('input-container')
            const resultsView =
                getClassList('monitor-view')
            const editorTabButton =
                getClassList('editor-tab-button')
            const resultsTabButton =
                getClassList('results-tab-button')

            editorView.remove('hidden')
            resultsTabButton.remove('active')

            if ( screen.width > 500 ) {
                tabBar.add('hidden')
                resultsView.remove('hidden')
                editorTabButton.remove('active')
            } else {
                tabBar.remove('hidden')
                resultsView.add('hidden')
                editorTabButton.add('active')
            }
        }

    //
    // ─── CREATE GRAPH ───────────────────────────────────────────────────────────────
    //

        function createDependencyGraph ( ast: AST, results: Results ) {
            const graphViewCanvas =
                document.getElementById('monitor-graph-view')! as HTMLCanvasElement
            const graphJSON =
                createGraphJSONBasedOnAST( ast, results )
            const graphViewHeight =
                ( graphJSON.nodes.length * 30 ).toString( )

            graphViewCanvas.setAttribute( 'width',
                graphViewCanvas.clientWidth.toString( ) )
            graphViewCanvas.setAttribute( 'height',
                graphViewHeight )
            graphViewCanvas.style.height =
                graphViewHeight

            setupGraphWithJSON( graphJSON )
        }

    //
    // ─── CREATE DEPENDENCY GRAPH JSON ───────────────────────────────────────────────
    //

        function createGraphJSONBasedOnAST ( ast: AST, results: Results ): GraphJSON {
            const nodes = new Set<string>( )
            for ( const node of ast ) {
                nodes.add( node.symbol )
                for ( const dependency of node.dependencies )
                    nodes.add( dependency )
            }

            const getEdgeColor = ( dependency: string ) =>
                    ( results[ dependency ] !== undefined
                        ? '#00BE56' // green
                        : '#CE0101' // red
                        )

            const edges = [ ]
            for ( const node of ast )
                for ( const dependency of node.dependencies )
                    edges.push([
                        dependency,
                        node.symbol,
                        { color: getEdgeColor( dependency ) }
                    ])

            return {
                nodes: [ ...nodes ],
                edges: edges
            }
        }

    // ────────────────────────────────────────────────────────────────────────────────

}