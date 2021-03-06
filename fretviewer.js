var fretviewer = function() {
    var BOARD_WIDTH = 800;
    var BOARD_HEIGHT = 200;
    var FRET_THICKNESS = 2;
    var STRING_THICKNESS = 3;
    var STRING_PAD = 14;
    var MAX_FRETS = 25;
    var MIN_FRETS = 5;
    var MAX_STRINGS = 9;
    var MIN_STRINGS = 3;
    var NOTE_SIZE = 12;

    var NOTE_CHARS = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

    var canvas;
    var stage;
    var fretboard;
    var stringSpacing, fretSpacing;

    /* Holds public methods */
    var p = {};

    function updateFretboard() {
        updateUI();
        drawBoard();
        drawScale(fretboard.scale);
    }

    function updateUI() {
        $("#num-frets").val(fretboard.numFrets);

        makeTuningSelectElements();

        /* Enable bootstrap select styling */
        $(".selectpicker").selectpicker();
    }

    p.init = function() {
        /* Create a new stage and point it at our canvas */
        canvas = document.getElementById("fretboard");
        stage = new createjs.Stage(canvas);
        
        fretboard = new createjs.Container();
        fretboard.notes = new createjs.Container();
        fretboard.numFrets = 13;
        fretboard.tuning = ["E", "B", "G", "D", "A", "E"]; // highest to lowest. Default guitar
        fretboard.scale = ["C", "D", "E", "F", "G", "A", "B"]; // C major
        fretboard.numStrings = fretboard.tuning.length;

        initUI();
        updateFretboard();
    }

    function initUI() {
        makeTuningSelectElements();

        /* Add listeners for each UI element */
        $("#num-frets").change(function() {
            var numFrets = parseInt($("#num-frets").val());
            /* Make sure numFrets is a number */
            if (!isNaN(numFrets)) {
                /* Keep numFrets within reasonable bounds */
                if (numFrets > MAX_FRETS) numFrets = MAX_FRETS;
                if (numFrets < MIN_FRETS) numFrets = MIN_FRETS;
                fretboard.numFrets = numFrets;
                updateFretboard();
            }
        });

        /* If the scale's key changes */
        $("#key-scale").change(function() {
            updateScale();
            updateFretboard();
        });

        /* If the scale changes */
        $("#scale").change(function() {
            updateScale();
            updateFretboard();
        });

        $("#tuning-presets").change(function () {
            var preset = $("#tuning-presets").val();
            if (preset == "CUSTOM") {
                /* Set to all A's */
                fretboard.tuning = ["A", "A", "A", "A", "A", "A"];
            }
            else {
                fretboard.tuning = preset.split(" ");
            }
            updateUI();
            updateFretboard();
        });

        $("#add-string").click(function () {
            if (fretboard.tuning.length < MAX_STRINGS) {
                fretboard.tuning.push("A");
                updateUI();
                updateFretboard();
            }
        });

        $("#remove-string").click(function () {
            if (fretboard.tuning.length > MIN_STRINGS) {
                fretboard.tuning.pop();
                updateUI();
                updateFretboard();
            }
        });
    }

    /* Make select boxes for string tuning */
    function makeTuningSelectElements() {
        var tuningHTML = "";
        for (var i = 0; i < fretboard.tuning.length; i++) {
            tuningHTML += "<select class='tuning-string' id='string-" + i + "'>";
            for (var note = 0; note < NOTE_CHARS.length; note++) {
                var noteChar = NOTE_CHARS[note];
                if (fretboard.tuning[i] == getNoteChar(note)) {
                    tuningHTML += "<option value='" + noteChar + "' selected='selected'>" + noteChar + "</option>";
                }
                else {
                    tuningHTML += "<option value='" + noteChar + "'>" + noteChar + "</option>";
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

    /* Takes scale from UI and sets internal scale */
    function updateScale() {
        var key = $("#key-scale").val();
        var keyNum = getNoteNum(key);
        var scaleNums = $("#scale").val().split(" ");
        fretboard.scale = new Array();
        for (var i = 0; i < scaleNums.length; i++) {
            var note = getNoteChar(parseInt(scaleNums[i]) + keyNum);
            fretboard.scale.push(note);
        }
    }

    /* Draws neck, ref dots, frets, and strings */
    function drawBoard() {
        /* Make sure numStrings is up to date */
        fretboard.numStrings = fretboard.tuning.length;

        /* Erase a previously drawn fretboard */
        fretboard.removeAllChildren();

        /* Make neck */
        var neck = new createjs.Shape();
        neck.x = 0; neck.y = 0;
        neck.graphics.beginFill("#977130").drawRect(neck.x, neck.y, BOARD_WIDTH, BOARD_HEIGHT);
        fretboard.addChild(neck);
        
        /* Make reference dots */
        fretSpacing = BOARD_WIDTH / fretboard.numFrets;
        for (var fret = 0; fret < fretboard.numFrets; fret++) {
            var loc = fret % 12;
            if (loc == 3 || loc == 5 || loc == 7) {
                /* Make single dot */
                var dotCircle = new createjs.Shape();
                var x = fret * fretSpacing + fretSpacing/2;
                var y = BOARD_HEIGHT/2;
                dotCircle.graphics.beginStroke("#000").beginFill('#000').drawCircle(x, y, 8);
                fretboard.addChild(dotCircle);
            }
            else if (loc == 0) {
                /* Make double dots */
                var upperDot = new createjs.Shape();
                var lowerDot = new createjs.Shape();
                var x = fret * fretSpacing + fretSpacing/2;
                var upperY = BOARD_HEIGHT/3;
                var lowerY = (2/3) * BOARD_HEIGHT;
                upperDot.graphics.beginStroke("#000").beginFill('#000').drawCircle(x, upperY, 8);
                lowerDot.graphics.beginStroke("#000").beginFill('#000').drawCircle(x, lowerY, 8);
                fretboard.addChild(upperDot);
                fretboard.addChild(lowerDot);
            }
        }

        /* Make frets */
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

        stage.addChild(fretboard);
        stage.update();
    }

    /* Draws each note in a scale on the fretboard */
    function drawScale(scale) {
        /* Clear a previously drawn scale */
        fretboard.notes.removeAllChildren();

        /* Draw the root note of the scale as red. Other notes off-white. */
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

                    var x = fret * fretSpacing + fretSpacing/2;
                    var y = STRING_PAD + string*stringSpacing;
                    noteCircle.graphics.beginStroke("#000").beginFill(color).drawCircle(x, y, NOTE_SIZE);
                    fretboard.notes.addChild(noteCircle);

                    /* Add note name as text */
                    var text = new createjs.Text(note, "12px Arial", "#000");
                    text.x = x - NOTE_SIZE/2;
                    text.y = y;
                    text.textBaseline = "middle"; // text alignment
                    fretboard.notes.addChild(text);
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

    return p;

}();

