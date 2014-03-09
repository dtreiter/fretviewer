var fretviewer = function() {
    var BOARD_WIDTH = 800;
    var BOARD_HEIGHT = 200;
    var FRET_THICKNESS = 2;
    var STRING_THICKNESS = 3;
    var STRING_PAD = 10;
    var MAX_STRINGS = 9;
    var MIN_STRINGS = 3;

    var NOTE_CHARS = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

    var canvas;
    var stage;
    var fretboard;
    var tuning;
    var scale;
    var stringSpacing, fretSpacing;
    var mode = "RIGHT HANDED";

    /* Holds public methods */
    var p = {};

    //var update = true;

    function updateFretboard() {
        updateUI();
        drawBoard();
        drawScale(scale);
    }

    function updateUI() {
        $("#num-frets").val(fretboard.numFrets);
    }

    p.init = function() {
        if (window.top != window) {
            document.getElementById("header").style.display = "none";
        }
        /* Create a new stage and point it at our canvas */
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
        initUI();
        //createjs.Ticker.addEventListener("tick", tick);
    }

    function makeTuningSelectElements() {
        /* Make select boxes for string tuning */
        var tuningHTML = "";
        for (var i = 0; i < fretboard.tuning.length; i++) {
            tuningHTML += "<select class='tuning-string' id='string-" + i + "'>";
            for (var note = 0; note < NOTE_CHARS.length; note++) {
                if (fretboard.tuning[i] == getNoteChar(note)) {
                    tuningHTML += "<option value='" + NOTE_CHARS[note] + "' selected='selected'>" + NOTE_CHARS[note] + "</option>";
                }
                else {
                    tuningHTML += "<option value='" + NOTE_CHARS[note] + "'>" + NOTE_CHARS[note] + "</option>";
                }
            }
            tuningHTML += "</select><br/>";
        }
        $("#tuning-container").html(tuningHTML);

        /* Add listeners */
        $("select.tuning-string").change(function () {
            var stringNum = this.id.split("-")[1]; // example: this.id = string-0 -> stringNum = 0
            fretboard.tuning[stringNum] = $(this).val();
            updateFretboard();
        });
    }

    function initUI() {
        makeTuningSelectElements();

        /* Add listeners for each UI element */
        $("#num-frets").change(function() {
            fretboard.numFrets = $("#num-frets").val();
            updateFretboard();
        });

        $("#add-string").click(function () {
            if (fretboard.tuning.length < MAX_STRINGS) {
                fretboard.tuning.push("C");
                updateFretboard();
                makeTuningSelectElements();
            }
        });

        $("#remove-string").click(function () {
            if (fretboard.tuning.length > MIN_STRINGS) {
                fretboard.tuning.pop();
                updateFretboard();
                makeTuningSelectElements();
            }
        });
    }

    function drawBoard() {
        fretboard.numStrings = fretboard.tuning.length;

        /* Erase a previously drawn fretboard */
        fretboard.removeAllChildren();

        /* Make neck */
        var neck = new createjs.Shape();
        neck.x = 0; neck.y = 0;
        neck.graphics.beginFill("#977130").drawRect(neck.x, neck.y, BOARD_WIDTH, BOARD_HEIGHT);
        fretboard.addChild(neck);
        
        /* Make frets */
        fretSpacing = BOARD_WIDTH / fretboard.numFrets;
        for (var i = 0; i < fretboard.numFrets; i++) {
            var fret = new createjs.Shape();
            fret.graphics.beginFill("#c7b393").drawRect(i*fretSpacing, 0, FRET_THICKNESS, BOARD_HEIGHT);
            fretboard.addChild(fret);
        }

        /* Make strings */
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
        /* Clear a previously drawn scale */
        fretboard.notes.removeAllChildren();

        /* Draw the root note of the scale as red. Other notes white. */
        drawNote(scale[0], "red");
        for (var note = 1; note < scale.length; note++) {
            drawNote(scale[note], "#DDD");
        }
        stage.addChild(fretboard.notes);
        stage.update();
    }


    /* Takes a note character (ie. "C") and draws it as a circle on the fretboard */
    function drawNote(note, color) {
        noteNum = getNoteNum(note);
        for (var string = 0; string < fretboard.numStrings; string++) {
            var baseNote = getNoteNum(fretboard.tuning[string]);
            for (var fret = 0; fret < fretboard.numFrets; fret++) {
                var curNote = (baseNote + fret) % 12; // mod number of chromatic notes
                if (curNote == noteNum) {
                    var noteCircle = new createjs.Shape();

                    var x;
                    if (mode == "RIGHT HANDED") {
                        x = fret * fretSpacing + fretSpacing/2;
                    }
                    if (mode == "LEFT HANDED") {
                        x = (fretboard.numFrets - (fret+1)) * fretSpacing + fretSpacing/2; // Left-handed mode
                    }
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

