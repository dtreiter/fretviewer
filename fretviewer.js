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
    $scope.fretboard.notes = new createjs.Container();
    $scope.numFrets = 13;
    $scope.tuning = $scope.tunings[1]; // Default is guitar
    $scope.scaleKey = "C";
    $scope.scale = $scope.scales[0];

    $scope.addString = function() {
      if ($scope.tuning.notes.length < MAX_STRINGS) {
        $scope.tuning = $scope.tunings[0];
        $scope.tuning.notes.push("A");
      } 
    }

    $scope.removeString = function() {
      if ($scope.tuning.notes.length > MIN_STRINGS) {
        $scope.tuning = $scope.tunings[0];
        $scope.tuning.notes.pop();
      } 
    }

    $scope.$watch(function() {
      drawBoard();
      var scaleNotes = getScaleNotes($scope.tuning.notes);
      drawScale(scaleNotes);
    });

    /* Gets scale notes from scale key and scale intervals */
    function getScaleNotes() {
        var keyNum = getNoteNum($scope.scaleKey);
        var scaleNotes = new Array();
        $scope.scale.intervals.forEach(function(interval) {
            var note = getNoteChar(parseInt(interval) + keyNum);
            scaleNotes.push(note);
        });
        return scaleNotes;
    }

    /* Draws neck, ref dots, frets, and strings */
    function drawBoard() {
        /* Make sure numStrings is up to date */
        $scope.numStrings = $scope.tuning.notes.length;

        /* Erase a previously drawn fretboard */
        $scope.fretboard.removeAllChildren();

        /* Make neck */
        var neck = new createjs.Shape();
        neck.x = 0; neck.y = 0;
        neck.graphics.beginFill("#977130").drawRect(neck.x, neck.y, BOARD_WIDTH, BOARD_HEIGHT);
        $scope.fretboard.addChild(neck);
        
        /* Make reference dots */
        fretSpacing = BOARD_WIDTH / $scope.numFrets;
        for (var fret = 0; fret < $scope.numFrets; fret++) {
            var loc = fret % 12;
            if (loc == 3 || loc == 5 || loc == 7) {
                /* Make single dot */
                var dotCircle = new createjs.Shape();
                var x = fret * fretSpacing + fretSpacing/2;
                var y = BOARD_HEIGHT/2;
                dotCircle.graphics.beginStroke("#000").beginFill('#000').drawCircle(x, y, 8);
                $scope.fretboard.addChild(dotCircle);
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
                $scope.fretboard.addChild(upperDot);
                $scope.fretboard.addChild(lowerDot);
            }
        }

        /* Make frets */
        for (var i = 0; i < $scope.numFrets; i++) {
            var fret = new createjs.Shape();
            fret.graphics.beginFill("#c7b393").drawRect(i*fretSpacing, 0, FRET_THICKNESS, BOARD_HEIGHT);
            $scope.fretboard.addChild(fret);
        }

        /* Make strings */
        stringSpacing = (BOARD_HEIGHT-2*STRING_PAD) / ($scope.numStrings-1);
        for (var i = 0; i < $scope.numStrings; i++) {
            var string = new createjs.Shape();
            var yloc = STRING_PAD + i*stringSpacing - STRING_THICKNESS/2;
            string.graphics.beginFill("#000").drawRect(0, yloc, BOARD_WIDTH, STRING_THICKNESS);
            $scope.fretboard.addChild(string);
        }

        stage.addChild($scope.fretboard);
        stage.update();
    }

    /* Draws each note in a scale on the $scope.fretboard */
    function drawScale(scale) {
        /* Clear a previously drawn scale */
        $scope.fretboard.notes.removeAllChildren();

        /* Draw the root note of the scale as red. Other notes off-white. */
        drawNote(scale[0], "red");
        for (var note = 1; note < scale.length; note++) {
            drawNote(scale[note], "#DDD");
        }
        stage.addChild($scope.fretboard.notes);
        stage.update();
    }

    /* Takes a note character (ie. "C") and draws it as a circle on the fretboard */
    function drawNote(note, color) {
        noteNum = getNoteNum(note);
        for (var string = 0; string < $scope.numStrings; string++) {
            var baseNote = getNoteNum($scope.tuning.notes[string]);
            for (var fret = 0; fret < $scope.numFrets; fret++) {
                var curNote = (baseNote + fret) % 12; // mod number of chromatic notes
                if (curNote == noteNum) {
                    var noteCircle = new createjs.Shape();

                    var x = fret * fretSpacing + fretSpacing/2;
                    var y = STRING_PAD + string*stringSpacing;
                    noteCircle.graphics.beginStroke("#000").beginFill(color).drawCircle(x, y, NOTE_SIZE);
                    $scope.fretboard.notes.addChild(noteCircle);

                    /* Add note name as text */
                    var text = new createjs.Text(note, "12px Arial", "#000");
                    text.x = x - NOTE_SIZE/2;
                    text.y = y;
                    text.textBaseline = "middle"; // text alignment
                    $scope.fretboard.notes.addChild(text);
                }
            }
        }
    }

    function getNoteNum(note) {
        return $scope.noteChars.indexOf(note);
    }

    function getNoteChar(num) {
        return $scope.noteChars[num % $scope.noteChars.length];
    }

  }]);

})();

