
//
// Copyright 2017 by Pouya Kary. All Rights Reserved
//

declare namespace Springy {

    //
    // ─── INTERFACES ─────────────────────────────────────────────────────────────────
    //

        export interface IGraphNewNodeOptions {
            label?: string
        }

        export interface IGraphNewEdgeOptions {
            color?: string
        }

        export interface IGraphJSONInput {
            nodes: string[ ]
            edges: ( string | IGraphNewEdgeOptions )[ ][ ]
        }

        export interface INodeData {
            mass: number
        }

        export interface IEdgeData {

        }

    //
    // ─── NODE OBJECT ────────────────────────────────────────────────────────────────
    //

        class Node {
            id: string
            data: INodeData
        }

    //
    // ─── EDGE CLASS ─────────────────────────────────────────────────────────────────
    //

        class Edge {
            id: string
            source: Node
            target: Node
            data: IEdgeData
        }

    //
    // ─── GRAPH CLASS ────────────────────────────────────────────────────────────────
    //

        export class Graph {
            nodes: Node[ ]

            newNode ( options: IGraphNewNodeOptions ): Node

            addNodes( ...nodeNames: string[ ] ): void

            newEdge ( start: Node, end: Node, options?: IGraphNewEdgeOptions ): Node

            addEdge ( edge: Edge ): Edge

            addEdges( ...edges: string[ ][ ] ): void

            loadJSON( jsonInput: IGraphJSONInput ): void

            removeNode( node: Node ): void

            detachNode( node: Node ): void

            getEdges( ): Edge[ ]

            marge( jsonInput: IGraphJSONInput ): void
        }

    // ────────────────────────────────────────────────────────────────────────────────

}
