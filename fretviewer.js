var fretviewer = function() {
    var BOARD_WIDTH = 800;
    var BOARD_HEIGHT = 200;
    var FRET_THICKNESS = 2;
    var STRING_THICKNESS = 3;
    var STRING_PAD = 10;

    var NOTE_CHARS = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

    var canvas;
    var stage;
    var fretboard;
    var tuning;
    var scale;
    var stringSpacing, fretSpacing;

    /* holds public method */
    var p = {};

    //var update = true;

    function updateFretboard() {
        $("#num-frets").val(fretboard.numFrets);
        drawBoard();
        drawScale(scale);
    }

    p.init = function() {
        if (window.top != window) {
            document.getElementById("header").style.display = "none";
        }
        // create a new stage and point it at our canvas
        canvas = document.getElementById("fretboard");
        stage = new createjs.Stage(canvas);
        // enable touch interactions if supported on the current device
        //createjs.Touch.enable(stage);
        //stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
        
        fretboard = new createjs.Container();
        fretboard.notes = new createjs.Container();
        fretboard.numFrets = 12;
        fretboard.tuning = ["E", "B", "G", "D", "A", "E"]; // highest to lowest
        fretboard.numStrings = fretboard.tuning.length;
        
        scale = ["E", "F#", "G#", "A", "B", "C#", "D#"]; // E major
        updateFretboard();

        //createjs.Ticker.addEventListener("tick", tick);

        $("#num-frets").change(function() {
            fretboard.numFrets = $("#num-frets").val();
            updateFretboard();
        });
    }

    function drawBoard() {
        fretboard.removeAllChildren(); // erase a previously drawn fretboard

        var neck = new createjs.Shape();
        neck.x = 0; neck.y = 0;
        neck.graphics.beginFill("#977130").drawRect(neck.x, neck.y, BOARD_WIDTH, BOARD_HEIGHT);
        fretboard.addChild(neck);
        
        fretSpacing = BOARD_WIDTH / fretboard.numFrets;
        for (var i = 0; i < fretboard.numFrets; i++) {
            var fret = new createjs.Shape();
            fret.graphics.beginFill("#c7b393").drawRect(i*fretSpacing, 0, FRET_THICKNESS, BOARD_HEIGHT);
            fretboard.addChild(fret);
        }

        stringSpacing = (BOARD_HEIGHT-2*STRING_PAD) / (fretboard.numStrings-1);
        for (var i = 0; i < fretboard.numStrings; i++) {
            var string = new createjs.Shape();
            var yloc = STRING_PAD + i*stringSpacing - STRING_THICKNESS/2;
            string.graphics.beginFill("#000").drawRect(0, yloc, BOARD_WIDTH, STRING_THICKNESS);
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
        fretboard.notes.removeAllChildren(); // clear a previously drawn scale
        drawNote(scale[0], "red");
        for (var note = 1; note < scale.length; note++) {
            drawNote(scale[note], "#DDD");
        }
        stage.addChild(fretboard.notes);
        stage.update();
    }

    /* Takes a note character (ie. "C") and draws it
    * as a circle on the fretboard
    */
    function drawNote(note, color) {
        noteNum = getNoteNum(note);
        for (var string = 0; string < fretboard.numStrings; string++) {
            var baseNote = getNoteNum(fretboard.tuning[string]);
            for (var fret = 0; fret < fretboard.numFrets; fret++) {
                var curNote = (baseNote + fret) % 12; // mod number of chromatic notes
                if (curNote == noteNum) {
                    var noteCircle = new createjs.Shape();

                    var x = fret * fretSpacing + fretSpacing/2;
                    //var x = (fretboard.numFrets - (fret+1)) * fretSpacing + fretSpacing/2; // Left-handed
                    var y = STRING_PAD + string*stringSpacing;
                    noteCircle.graphics.beginStroke("#000").beginFill(color).drawCircle(x, y, 10);
                    fretboard.notes.addChild(noteCircle);
                }
            }
        }
    }

    function getNoteNum(note) {
        return NOTE_CHARS.indexOf(note);
    }

    function getNoteChar(num) {
        return NOTE_CHARS[num % NOTE_CHARS.length];
    }

    /*
    function tick(event) {
        // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
        if (update) {
            update = false; // only update once
            stage.update(event);
        }
    }
    */


    return p;

}();

