"use strict";
var Workout;
(function (Workout) {
    var Parser;
    (function (Parser) {
        function parse(code) {
            const lines = code.split('\n')
                .filter(line => !/^\s*$/.test(line));
            for (const line of lines) {
                const splinted = line.split('=');
                if (splinted.length !== 2)
                    throw {
                        line: line,
                        message: "Has more than one definition sign"
                    };
                if (!/^[a-z]+$/.test(splinted[0].trim()))
                    throw {
                        line: line,
                        message: "Bad formula symbol"
                    };
            }
            const formulas = lines.map(line => {
                const [name, rule] = line.split('=');
                return {
                    dependencies: fetchSymbols(rule),
                    formula: rule.trim(),
                    symbol: name.trim(),
                };
            });
            return formulas;
        }
        Parser.parse = parse;
        function fetchSymbols(rule) {
            const regX = /(?:\b([a-z]+)\b)(?!\s*\()/g;
            const matches = new Array();
            let match = undefined;
            do {
                match = regX.exec(rule);
                if (match) {
                    matches.push(match[1]);
                }
            } while (match);
            return matches;
        }
    })(Parser = Workout.Parser || (Workout.Parser = {}));
})(Workout || (Workout = {}));
var Octobass;
(function (Octobass) {
    function exec(data, func) {
        const computedData = {};
        let countDownCounter = data.length;
        let lastCountDownCounterBackup = Infinity;
        while (countDownCounter > 0) {
            lastCountDownCounterBackup = countDownCounter;
            for (const input of data)
                countDownCounter =
                    tryToCompute(input, computedData, countDownCounter, func);
            if (lastCountDownCounterBackup === countDownCounter)
                return computedData;
        }
        return computedData;
    }
    Octobass.exec = exec;
    function tryToCompute(inputData, computedData, countDownCounter, func) {
        if (!isComputable(inputData, computedData))
            return countDownCounter;
        computedData[inputData.info.id] =
            func(computedData, inputData);
        return countDownCounter - 1;
    }
    function isComputable(inputData, computedData) {
        for (const id of inputData.dependencies)
            if (computedData[id] === undefined)
                return false;
        return true;
    }
})(Octobass || (Octobass = {}));
var Workout;
(function (Workout) {
    var OctobassAdapter;
    (function (OctobassAdapter) {
        function compute(ast) {
            const octobassData = createOctobassData(ast);
            const computedValue = Octobass.exec(octobassData, octobassComputingFunction);
            return computedValue;
        }
        OctobassAdapter.compute = compute;
        function createOctobassData(ast) {
            return ast.map(node => ({
                info: {
                    id: node.symbol,
                    name: node.symbol,
                },
                dependencies: new Set(node.dependencies),
                formula: node.formula
            }));
        }
        function octobassComputingFunction(computedData, input) {
            const functionDataAsConstants = [...input.dependencies]
                .map(symbol => `const ${symbol} = ${computedData[symbol]};`)
                .join('\n');
            const funcString = (`(( ) => {
                const {
                    PI, E, abs, acos, acosh, asin, asinh, atan, atan2, atanh,
                    cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot,
                    imul, log, log10, log1p, log2, max, min, pow, random, round
                } = Math;

                ${functionDataAsConstants}

                return ${input.formula};
            })( )`);
            const computedValue = eval(funcString);
            return computedValue;
        }
    })(OctobassAdapter = Workout.OctobassAdapter || (Workout.OctobassAdapter = {}));
})(Workout || (Workout = {}));
var Workout;
(function (Workout) {
    function compute(code) {
        const ast = Workout.Parser.parse(code);
        const computed = Workout.OctobassAdapter.compute(ast);
        return {
            ast: ast,
            results: computed
        };
    }
    Workout.compute = compute;
})(Workout || (Workout = {}));
var Workout;
(function (Workout) {
    var LaTeX;
    (function (LaTeX) {
        function generateDiagram(ast) {
            const formulas = ast.filter(x => x.dependencies.length > 0)
                .map(x => generateLatexForFormula(x))
                .join('\n\\\\[7pt]\n');
            return `\\begin{aligned}\n${formulas}\n\\end{aligned}`;
        }
        LaTeX.generateDiagram = generateDiagram;
        function generateLatexForFormula(formula) {
            const dependenciesCode = ((formula.dependencies.length > 0)
                ? ('\\rightarrow \\begin{cases}'
                    + formula.dependencies
                        .map(x => `\\text{${x}}`)
                        .join('\\\\\n')
                    + '\\end{cases}')
                : '');
            return `${formula.symbol} & ${dependenciesCode}`;
        }
    })(LaTeX = Workout.LaTeX || (Workout.LaTeX = {}));
})(Workout || (Workout = {}));
var Workout;
(function (Workout) {
    var UI;
    (function (UI) {
        const localStorageId = 'us.kary.workout.code';
        window.onload = () => {
            noBounce.init({
                animated: true
            });
            checkAndLoadCodeInLocalStorage();
            setupInputBoxEvents();
            setupTabBarEvents();
            setupWindowResizeEvent();
            setupCanvasUpdateEvents();
            disableEvents();
            onInputChange();
            configureWindowBasedOnScreenWidth();
            setupGraphWithJSON();
        };
        function setupCanvasUpdateEvents() {
            const inputBox = document.getElementById('code-input');
            inputBox.onchange = () => (screen.width > 500
                ? updateGraph
                : null);
        }
        function updateGraph() {
            const { ast, results, input } = getLatestComputation();
            createDependencyGraph(ast, results);
        }
        function disableEvents() {
            const disable = (e) => e.preventDefault();
            const graphCanvas = document.getElementById('monitor-graph-view');
            const canvasDisableFunction = () => {
                graphCanvas.ontouchmove = disable;
                graphCanvas.onclick = disable;
                graphCanvas.ondrag = disable;
                graphCanvas.onmouseenter = disable;
                graphCanvas.onmousemove = disable;
                graphCanvas.onmouseover = disable;
            };
            setTimeout(canvasDisableFunction, 50);
        }
        function setupInputBoxEvents() {
            const inputBox = document.getElementById('code-input');
            inputBox.onchange = onInputChange;
            inputBox.oninput = onInputChange;
            inputBox.onkeyup = onInputChange;
        }
        function setupWindowResizeEvent() {
            window.onresize = () => configureWindowBasedOnScreenWidth();
        }
        function setupTabBarEvents() {
            document.getElementById('editor-tab-button')
                .onclick = () => changeTab('input-container');
            document.getElementById('results-tab-button')
                .onclick = () => changeTab('monitor-view');
        }
        function checkAndLoadCodeInLocalStorage() {
            const input = document.getElementById('code-input');
            const defaultCode = input.value = (["a = 2",
                "y = x + 2",
                "x = 3 * a",
                "z = y + w"
            ]
                .join('\n'));
            try {
                const code = localStorage.getItem(localStorageId);
                if (code)
                    input.value = code;
                else
                    input.value = defaultCode;
            }
            catch (_a) {
                input.value = defaultCode;
            }
        }
        function onInputChange() {
            try {
                const { ast, results, input } = getLatestComputation();
                renderDependencyLaTeX(ast);
                prettyPrintResults(results);
                createDependencyGraph(ast, results);
                localStorage.setItem(localStorageId, input);
            }
            catch (_a) {
            }
        }
        function getLatestComputation() {
            const input = document.getElementById('code-input')
                .value;
            const computedResults = Workout.compute(input);
            return {
                input: input,
                ast: computedResults.ast,
                results: computedResults.results
            };
        }
        function prettyPrintResults(results) {
            const resultsInLaTeX = Object.keys(results).map(key => results[key]
                ? `\\ ${key} & = ${results[key]}`
                : null)
                .join('\n\\\\[5pt]\n');
            const fullLaTeX = `\\begin{aligned}\n${resultsInLaTeX}\n\\end{aligned}`;
            renderLaTeX("results", fullLaTeX);
        }
        function renderDependencyLaTeX(ast) {
            const compiledTeX = Workout.LaTeX.generateDiagram(ast);
            renderLaTeX('katex-display', compiledTeX);
        }
        function renderLaTeX(id, code) {
            const katexDisplay = document.getElementById(id);
            katexDisplay.innerHTML =
                katex.renderToString(code, { displayMode: true });
        }
        function changeTab(toBeActiveTabId) {
            changeTabView(toBeActiveTabId);
            changeTabButtons(toBeActiveTabId);
        }
        function changeTabView(toBeActiveTabId) {
            const toBeDeActivatedTabId = ((toBeActiveTabId === "input-container")
                ? "monitor-view"
                : "input-container");
            document.getElementById(toBeActiveTabId)
                .classList.remove('hidden');
            document.getElementById(toBeDeActivatedTabId)
                .classList.add('hidden');
        }
        function changeTabButtons(toBeActiveTabId) {
            const toBeActivatedTabButtonId = ((toBeActiveTabId === "input-container")
                ? "editor-tab-button"
                : "results-tab-button");
            const toBeDeActivatedTabButtonId = ((toBeActiveTabId === "input-container")
                ? "results-tab-button"
                : "editor-tab-button");
            if (toBeActiveTabId !== "input-container")
                updateGraph();
            document.getElementById(toBeActivatedTabButtonId)
                .classList.add('active');
            document.getElementById(toBeDeActivatedTabButtonId)
                .classList.remove('active');
        }
        function configureWindowBasedOnScreenWidth() {
            const getClassList = (id) => document.getElementById(id).classList;
            const tabBar = getClassList('tab-bar');
            const editorView = getClassList('input-container');
            const resultsView = getClassList('monitor-view');
            const editorTabButton = getClassList('editor-tab-button');
            const resultsTabButton = getClassList('results-tab-button');
            editorView.remove('hidden');
            resultsTabButton.remove('active');
            if (screen.width > 500) {
                tabBar.add('hidden');
                resultsView.remove('hidden');
                editorTabButton.remove('active');
            }
            else {
                tabBar.remove('hidden');
                resultsView.add('hidden');
                editorTabButton.add('active');
            }
        }
        function createDependencyGraph(ast, results) {
            const graphViewCanvas = document.getElementById('monitor-graph-view');
            const graphJSON = createGraphJSONBasedOnAST(ast, results);
            const graphViewHeight = (graphJSON.nodes.length * 30).toString();
            graphViewCanvas.setAttribute('width', graphViewCanvas.clientWidth.toString());
            graphViewCanvas.setAttribute('height', graphViewHeight);
            graphViewCanvas.style.height =
                graphViewHeight;
            setupGraphWithJSON(graphJSON);
        }
        function createGraphJSONBasedOnAST(ast, results) {
            const nodes = new Set();
            for (const node of ast) {
                nodes.add(node.symbol);
                for (const dependency of node.dependencies)
                    nodes.add(dependency);
            }
            const getEdgeColor = (dependency) => (results[dependency] !== undefined
                ? '#00BE56'
                : '#CE0101');
            const edges = [];
            for (const node of ast)
                for (const dependency of node.dependencies)
                    edges.push([
                        dependency,
                        node.symbol,
                        { color: getEdgeColor(dependency) }
                    ]);
            return {
                nodes: [...nodes],
                edges: edges
            };
        }
    })(UI = Workout.UI || (Workout.UI = {}));
})(Workout || (Workout = {}));
