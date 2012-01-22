var addDurations, draw, getColor, getMidi, musicalParamters, noteNames;
addDurations = function(events) {
  var noteStatus;
  noteStatus = {};
  events.forEach(function(event, index) {
    var noteOn;
    if (event.type !== "channel") {
      return;
    }
    if (event.subtype === "noteOn") {
      noteStatus[event.noteNumber] = event;
      return event.index = index;
    } else if (event.subtype === "noteOff") {
      noteOn = noteStatus[event.noteNumber];
      return noteOn.duration = events.slice(noteOn.index + 1, (index + 1) || 9e9).reduce((function(s, e) {
        return s + e.deltaTime;
      }), 0);
    }
  });
  return events;
};
getColor = function(note) {
  if (note.deleted) {
    return "red";
  } else {
    return "blue";
  }
};
musicalParamters = function(midi) {
  var params;
  params = {};
  midi.tracks.forEach(function(track) {
    return track.forEach(function(event) {
      if (event.subtype === "timeSignature") {
        if (params.timeSignature) {
          throw "Opps, don't support changing t sig yet";
        }
        params.timeSignature = [event.numerator, event.denominator];
      }
      if (event.subtype === "setTempo") {
        return params.tempo = event.microsecondsPerBeat;
      }
    });
  });
  return params;
};
noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
draw = function(midi) {
  var bar, beat, beatNote, beatNotes, height, maxTime, noteArt, noteHeight, noteMargin, noteNumber, params, qNotes, text, ticksPerBeatNote, ticksPerPixel, ticksPerQNote, timeArt, tone, toneArt, totalNote, x, _ref;
  timeArt = Raphael(20, 10, 800, 30);
  noteArt = Raphael(20, 40, 800, 800);
  toneArt = Raphael(0, 40, 20, 800);
  console.log("drawing", midi);
  params = musicalParamters(midi);
  ticksPerQNote = params.ticksPerBeat || 480;
  _ref = params.timeSignature || [4, 4], beatNote = _ref[0], bar = _ref[1];
  noteHeight = 10;
  noteMargin = 5;
  totalNote = noteMargin + noteHeight;
  ticksPerPixel = 48;
  maxTime = 0;
  midi.tracks.forEach(function(track) {
    var time;
    time = 0;
    addDurations(track);
    track.forEach(function(event) {
      var note;
      time += event.deltaTime;
      if (event.subtype === "noteOn") {
        note = noteArt.rect(time / ticksPerPixel, event.noteNumber * totalNote, event.duration / ticksPerPixel, noteHeight);
        return note.attr({
          fill: getColor(event)
        });
      }
    });
    if (time > maxTime) {
      return maxTime = time;
    }
  });
  for (noteNumber = 0; noteNumber <= 127; noteNumber++) {
    tone = toneArt.rect(0, noteNumber * totalNote, 20, noteHeight);
    tone.attr({
      fill: "green"
    });
    text = toneArt.text(3, noteNumber * totalNote + 5, noteNames[noteNumber % 12]);
    text.attr({
      stroke: "#fff"
    });
  }
  qNotes = maxTime / ticksPerQNote;
  beatNotes = Math.ceil(qNotes / 4 / (1 / beatNote));
  ticksPerBeatNote = (1 / beatNote) * 4 * ticksPerQNote;
  for (beat = 0; 0 <= beatNotes ? beat <= beatNotes : beat >= beatNotes; 0 <= beatNotes ? beat++ : beat--) {
    x = beat * ticksPerQNote / ticksPerPixel;
    height = 10;
    if (beat % bar === 0) {
      timeArt.text(x + 5, 10, beat / bar + 1);
      height = 20;
    }
    timeArt.path("M" + x + ",30 L" + x + "," + (30 - height));
  }
  return null;
};
getMidi = function(file) {
  return $.ajax({
    url: file,
    mimeType: "text/plain; charset=x-user-defined"
  });
};
$(function() {
  var loadDiff, toMidiFile;
  toMidiFile = function(data) {
    var bytes, index, midi, scc, _ref;
    bytes = [];
    scc = String.fromCharCode;
    for (index = 0, _ref = data.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
      bytes[index] = scc(data.charCodeAt(index) & 255);
    }
    return midi = new MidiFile(bytes.join(""));
  };
  loadDiff = function(trackA, trackB) {
    var a, b, def;
    def = $.Deferred();
    a = getMidi("midis/track_a_v2.mid");
    b = getMidi("midis/track_a_v1.mid");
    a.then(function(aResp) {
      var aVal;
      aVal = toMidiFile(aResp);
      return b.then(function(bVal) {
        return def.resolve([aVal, toMidiFile(bVal)]);
      });
    });
    return def;
  };
  return loadDiff().then(function(_arg) {
    var midiA, midiB;
    midiA = _arg[0], midiB = _arg[1];
    diff(midiA, midiB);
    return draw(midiA);
  });
});