var BOARD_WIDTH = 200;
var BOARD_HEIGHT = 500;
var FRET_THICKNESS = 2;
var STRING_THICKNESS = 3;
var STRING_PAD = 10;

var canvas;
var stage;
var fretboard;
var tuning;

var update = true;

function init() {
    if (window.top != window) {
        document.getElementById("header").style.display = "none";
    }
    // create a new stage and point it at our canvas:
    canvas = document.getElementById("fretboard");
    stage = new createjs.Stage(canvas);
    // enable touch interactions if supported on the current device:
    createjs.Touch.enable(stage);
    stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
    
    fretboard = new createjs.Container();
    //fretboard.notes = new createjs.Container();
    fretboard.numFrets = 12;
    fretboard.tuning = ["E", "A", "D", "G", "B", "E"];
    fretboard.numStrings = fretboard.tuning.length;
    drawBoard(fretboard.numFrets, fretboard.numStrings);
    var scale = ["A", "B", "C", "D", "E", "F", "G"];
    drawScale(scale);

    createjs.Ticker.addEventListener("tick", tick);
}

function drawBoard(numFrets, numStrings) {
    // create a shape to draw the background into:
    var bg = new createjs.Shape();
    stage.addChild(bg);


    var neck = new createjs.Shape();
    neck.x = 0; neck.y = 0;
    neck.graphics.beginFill("#977130").drawRect(neck.x, neck.y, BOARD_WIDTH, BOARD_HEIGHT);
    fretboard.addChild(neck);
    
    var fretSpacing = BOARD_HEIGHT / numFrets;
    for (var i = 0; i < numFrets; i++) {
        var fret = new createjs.Shape();
        fret.graphics.beginFill("#c7b393").drawRect(0, i*fretSpacing, BOARD_WIDTH, FRET_THICKNESS);
        fretboard.addChild(fret);
    }

    var stringSpacing = (BOARD_WIDTH-2*STRING_PAD) / (fretboard.numStrings-1);
    for (var i = 0; i < numStrings; i++) {
        var string = new createjs.Shape();
        var xloc = STRING_PAD + i*stringSpacing - STRING_THICKNESS/2;
        string.graphics.beginFill("#000").drawRect(xloc, 0, STRING_THICKNESS, BOARD_HEIGHT);
        fretboard.addChild(string);
    }

    /*
    fretboard.on("pressmove", function(evt) {
        evt.currentTarget.x = evt.stageX;
        evt.currentTarget.y = evt.stageY;
        update = true;
        console.log("sliding!");
    });
    */

    stage.addChild(fretboard);
    stage.update();
}

function drawScale(scale) {
    for (var note = 0; note < scale.length; note++) {
        drawNote(scale[note]);
    }
}

/* Takes a note character (ie. "C") and draws it
 * as a circle on the fretboard
 */
function drawNote(note) {
    noteNum = getNoteNum(note);
    for (var string = 0; string < fretboard.numStrings; string++) {
        var baseNote = getNoteNum(fretboard.tuning[string]);
        for (var fret = 0; fret < fretboard.numFrets; fret++) {
            var curNote = (baseNote + fret) % 12; // mod number of chromatic notes
            if (curNote == noteNum) {
                var noteCircle = new createjs.Shape();

                var stringSpacing = (BOARD_WIDTH-2*STRING_PAD) / (fretboard.numStrings-1);
                var x = STRING_PAD + string*stringSpacing;
                var fretSpacing = (BOARD_HEIGHT/fretboard.numFrets);
                var y = fret * fretSpacing + fretSpacing/2;
                noteCircle.graphics.beginStroke("#000").beginFill("#FFF").drawCircle(x, y, 10);
                stage.addChild(noteCircle);
            }
        }
    }
}

function getNoteNum(note) {
    var noteChars = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    return noteChars.indexOf(note);
}

function getNoteChar(num) {
    var noteChars = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    return noteChars[num % noteChars.length];
}

function tick(event) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (update) {
        update = false; // only update once
        stage.update(event);
    }
}

