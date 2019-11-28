
//
// Copyright © 2017-present Pouya Kary <pouya@kary.us>. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

namespace Octobass {

    //
    // ─── INPUT INTERFACE ────────────────────────────────────────────────────────────
    //

        export interface IOctobassSemiActorInfo {
            id:     string
            name:   string
        }

        export interface IInputDataFormat<T> {
            info:           IOctobassSemiActorInfo
            dependencies:   Set<string>
            formula:        T
        }

        export interface IOctobassComputedDependencies<K> {
            [ dependencyId: string ]: K
        }

        export type IExecutionFunction<T, K> =
            ( computedData: IOctobassComputedDependencies<K>,
                     input: IInputDataFormat<T> ) => K

    //
    // ─── MAIN FUNCTION ──────────────────────────────────────────────────────────────
    //

        type TExecData<T> = Array<IInputDataFormat<T>>
        type TExecOutput<K> = IOctobassComputedDependencies<K>

        export function exec <T, K> ( data: TExecData<T>,
                                      func: IExecutionFunction<T, K> ): TExecOutput<K> {

            const computedData: IOctobassComputedDependencies<K> = { }
            let countDownCounter = data.length
            let lastCountDownCounterBackup = Infinity

            while ( countDownCounter > 0 ) {
                lastCountDownCounterBackup = countDownCounter

                for ( const input of data )
                    countDownCounter =
                        tryToCompute( input, computedData, countDownCounter, func )

                if ( lastCountDownCounterBackup === countDownCounter )
                    return computedData
            }

            return computedData
        }

    //
    // ─── TRY TO COMPUTE ─────────────────────────────────────────────────────────────
    //

        function tryToCompute <T, K> ( inputData: IInputDataFormat<T>,
                                    computedData: IOctobassComputedDependencies<K>,
                                countDownCounter: number,
                                            func: IExecutionFunction<T, K>) {

            if ( !isComputable( inputData, computedData ) )
                return countDownCounter

            computedData[ inputData.info.id ] =
                func( computedData, inputData )

            return countDownCounter - 1
        }

    //
    // ─── CHECK IF DEPENDENCIES MEET ─────────────────────────────────────────────────
    //

        function isComputable <T, K> ( inputData: IInputDataFormat<T>,
                                    computedData: IOctobassComputedDependencies<K> ) {

            for ( const id of inputData.dependencies )
                if ( computedData[ id ] === undefined )
                    return false

            return true
        }

    // ────────────────────────────────────────────────────────────────────────────────

}