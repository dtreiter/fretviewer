(function() {
  var app = angular.module("fretviewer", [ ]);

  app.controller("fretboardController", ["$scope", function($scope) {
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
    $scope.tunings = [
      {
        "name": "Custom",
        "notes": ["A", "A", "A", "A", "A", "A"]
      },
      {
        "name": "Guitar", 
        "notes": ["E", "B", "G", "D", "A", "E"]
      },
      {
        "name": "7 String Guitar", 
        "notes": ["E", "B", "G", "D", "A", "E", "B"]
      },
      {
        "name": "Bass Guitar", 
        "notes": ["G", "D", "A", "E"]
      },
      {
        "name": "Violin", 
        "notes": ["E", "A", "D", "G"]
      },
      {
        "name": "Cello", 
        "notes": ["A", "D", "G", "C"]
      },
      {
        "name": "Mandolin", 
        "notes": ["E", "A", "D", "G"]
      },
      {
        "name": "Banjo", 
        "notes": ["D", "B", "G", "C"]
      },
      {
        "name": "Ukelele", 
        "notes": ["A", "E", "C", "G"]
      },
      {
        "name": "Balalaika", 
        "notes": ["A", "E", "E"]
      }
    ];

    $scope.scales = [
      {
        "name": "Major",
        "intervals": [0, 2, 4, 5, 7, 9, 11]
      },
      {
        "name": "Natural Minor",
        "intervals": [0, 2, 3, 5, 7, 8, 10]
      },
      {
        "name": "Harmonic Minor",
        "intervals": [0, 2, 3, 5, 7, 8, 11]
      },
      {
        "name": "Minor Pentatonic",
        "intervals": [0, 3, 5, 7, 10]
      },
    ];

    var stringSpacing, fretSpacing;
    $scope.noteChars = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    $scope.numFrets = 13;
    /* Create a new stage and point it at our canvas */
    var canvas = document.getElementById("fretboard");
    var stage = new createjs.Stage(canvas);
    
    $scope.fretboard = new createjs.Container();
    fretboard.notes = new createjs.Container();
    $scope.numFrets = 13;
    $scope.tuning = $scope.tunings[1]; // Default guitar
    $scope.scaleKey = "C";
    $scope.scale = $scope.scales[0];
    //$scope.scale = ["C", "D", "E", "F", "G", "A", "B"]; // TODO: change -> the html's model is a number array like above
    $scope.numStrings = $scope.tuning.length;

    $scope.addString = function() {
      if ($scope.tuning.notes.length < MAX_STRINGS) {
        $scope.tuning.notes.push("A");
      } 
    }

    $scope.removeString = function() {
      if ($scope.tuning.notes.length > MIN_STRINGS) {
        $scope.tuning.notes.pop();
        //updateFretboard();
      } 
    }

    function updateFretboard() {
        drawBoard();
        drawScale(fretboard.scale);
    }

    function initUI() {
        makeTuningSelectElements();

        /* If the scale changes */
        $("#scale").change(function() {
            updateScale();
            updateFretboard();
        });

        $("#add-string").click(function () {
            if (fretboard.tuning.length < MAX_STRINGS) {
                fretboard.tuning.push("A");
                updateUI();
                updateFretboard();
            }
        });

    }

    /* Gets scale notes from scale key and scale intervals */
    function updateScale() {
        var keyNum = getNoteNum(scaleKey);
        fretboard.scale = new Array();
        $scope.scale.intervals.forEach(function() {
            var note = getNoteChar(parseInt($scope.scale.intervals[i]) + keyNum);
            fretboard.scale.push(note);
        });
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

  }]);

})();

