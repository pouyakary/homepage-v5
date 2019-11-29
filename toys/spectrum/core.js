
const CANVAS_WIDTH =
    800;
const CANVAS_HEIGHT =
    600;
const SPECTRUM_MARGIN =
    [250, 150, 150, 150];
const STROKE_SIZE =
    2;
const SPECTRUM_HARDNESS =
    0.2;
const RULER_BASELINE_SHIFT =
    30;
const RULER_MARKER_HEIGHT =
    15;
const MARKER_TEXT_BASELINE_SHIFT_Y =
    20;
const MARKER_TEXT_BASELINE_SHIFT_X =
    -3;
const RULER_COLOR =
    "#AAAAAA";
const DIAGRAM_TEXT_BASELINE_SHIFT =
    -150;
const COLORS =
    ['#7DA76F', '#819DC2', '#B98EB2', '#D38569', '#BC9550'];
const HOT_LANGUAGE_LINE_GRAMMAR =
    /^[a-zA-Z ]+:=\s*(\d+(\.\d+)?)\s*|\s*(\d+(\.\d+)?)\s*$/
const LOCAL_STORAGE_KEY =
    "us.kary.toys.hotlang.input";
const STARTING_CODE_SAMPLE =
    "\n\nHer := 8.7 | 7";

function drawTheSpectrum(context) {
    const startX =
        SPECTRUM_MARGIN[3];
    const startY =
        CANVAS_HEIGHT - SPECTRUM_MARGIN[2];
    const endX =
        CANVAS_WIDTH - SPECTRUM_MARGIN[1];
    const endY =
        startY;
    const middleX =
        startX + ((endX - startX) / 2);
    const middleY =
        SPECTRUM_MARGIN[0];
    const spectrumLeftSize =
        (middleX - startX) * (1 - SPECTRUM_HARDNESS);
    const spectrumRightSize =
        (middleX - startX) * SPECTRUM_HARDNESS;

    context.strokeStyle = 'white';

    context.beginPath();

    // left half
    context.moveTo(startX, startY);
    context.bezierCurveTo(
        startX + spectrumLeftSize,
        startY,
        middleX - spectrumRightSize,
        middleY,
        middleX,
        middleY,
    );

    // right half
    context.bezierCurveTo(
        middleX + spectrumRightSize,
        middleY,
        endX - spectrumLeftSize,
        endY,
        endX,
        endY,
    );

    context.stroke();
}


function drawRuler(context) {
    const startX =
        SPECTRUM_MARGIN[3];
    const startY =
        CANVAS_HEIGHT - SPECTRUM_MARGIN[2] + RULER_BASELINE_SHIFT;
    const endX =
        CANVAS_WIDTH - SPECTRUM_MARGIN[1];
    const endY =
        startY;

    context.lineWidth = 1;
    context.strokeStyle = RULER_COLOR;
    context.fillStyle = RULER_COLOR;

    // base
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();

    // marks
    for (let markNumber = 0; markNumber <= 10; markNumber++) {
        const markStartX =
            startX + (((endX - startX) / 10) * markNumber);
        const markStartY =
            startY - (RULER_MARKER_HEIGHT / 2);
        const markEndX =
            markStartX;
        const markEndY =
            startY + (RULER_MARKER_HEIGHT / 2);

        context.beginPath();
        context.moveTo(markStartX, markStartY);
        context.lineTo(markEndX, markEndY);
        context.stroke();

        const markText =
            (markNumber === 0 ?
                'M' : (markNumber === 10 ?
                    'D' : markNumber.toString())
            );

        context.fillText(markText,
            markStartX + MARKER_TEXT_BASELINE_SHIFT_X,
            markEndY + MARKER_TEXT_BASELINE_SHIFT_Y
        );
    }
}



function drawPerson(context, name, no, hot, crazy) {
    const startX =
        SPECTRUM_MARGIN[3] +
        ((CANVAS_WIDTH - SPECTRUM_MARGIN[1] - SPECTRUM_MARGIN[3])
            * (hot / 10));
    const startY =
        SPECTRUM_MARGIN[0] + DIAGRAM_TEXT_BASELINE_SHIFT + (no * 30);
    const endX =
        startX;
    const endY =
        CANVAS_HEIGHT - SPECTRUM_MARGIN[2] + RULER_BASELINE_SHIFT + (RULER_MARKER_HEIGHT / 2);
    const color =
        COLORS[no % COLORS.length];

    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();

    context.fillStyle = color;
    context.font = "13px Avenir";

    context.fillText(name + ' ∙ ' + hot + ' | ' + crazy, startX + 10, startY + 10);
}


function draw(context, people) {
    context.fillStyle = 'black';
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.moveTo(0, 0);

    drawTheSpectrum(context);
    drawRuler(context);

    const sortedPeople =
        people.sort((a, b) => a.hot - b.hot);

    for (let i = 0; i < sortedPeople.length; i++) {
        const { name, hot, crazy } =
            sortedPeople[i];
        drawPerson(context, name, i, hot, crazy);
    }
}


// - - - - - - - - - - - - - - - - - - - -

function parseHotLanguageLine(line) {
    if (HOT_LANGUAGE_LINE_GRAMMAR.test(line)) {
        const [nameString, value] =
            line.split(':=');
        const [hotString, crazyString] =
            value.split('|');
        const name =
            nameString.trim();
        const hot =
            parseFloat(hotString.trim());
        const crazy =
            parseFloat(crazyString.trim());
        return {
            name, hot, crazy
        }
    }
}

function parseHotLanguage(input) {
    const lines =
        input.split('\n');
    const parsedLines =
        lines.map(parseHotLanguageLine);
    const results =
        parsedLines.filter(x => x !== undefined);
    return results;
}


// - - - - - - - - - - - - - - - - - - - -

function evaluate(context) {
    try {
        const input =
            document.getElementById('input').value;
        const data =
            parseHotLanguage(input);

        draw(context, data);
        localStorage.setItem(LOCAL_STORAGE_KEY, input);

    } catch (err) {
        // who gives a crap
    }
}


// - - - - - - - - - - - - - - - - - - - -


window.onload = () => {
    const context =
        document.getElementById('spectrum')
            .getContext("2d")

    context.scale(2, 2);
    context.lineWidth = STROKE_SIZE;
    context.font = "12px Menlo";

    const previousState =
        localStorage.getItem(LOCAL_STORAGE_KEY);
    document.getElementById('input').value =
        (previousState !== '' ? previousState : STARTING_CODE_SAMPLE);

    evaluate(context);
    document.getElementById('input').oninput = () =>
        evaluate(context);
}
