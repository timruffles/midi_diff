var addDurations, byId, draw, getColor, getMidi, musicalParamters, noteNames;
var __hasProp = Object.prototype.hasOwnProperty;
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
d3.selection.prototype.attrAll = function(attrs) {
  var k, v;
  for (k in attrs) {
    if (!__hasProp.call(attrs, k)) continue;
    v = attrs[k];
    this.attr(k, v);
  }
  return this;
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
byId = function(id) {
  return document.getElementById(id);
};
draw = function(midi) {
  var bar, beat, beatArt, beatNote, beatNotes, beatSVG, height, maxTime, noteArt, noteHeight, noteMargin, noteNumber, noteSVG, noteWrap, octaveWeights, params, qNotes, scrollToOctave, text, ticksPerBeatNote, ticksPerPixel, ticksPerQNote, tone, toneArt, toneSVG, totalNote, x, _ref;
  noteSVG = byId("notes");
  toneSVG = byId("tones");
  beatSVG = byId("beats");
  noteWrap = byId("music-wrap");
  noteArt = d3.select("#notes");
  toneArt = d3.select("#tones");
  beatArt = d3.select("#beats");
  console.log("drawing", midi);
  params = musicalParamters(midi);
  ticksPerQNote = params.ticksPerBeat || 480;
  _ref = params.timeSignature || [4, 4], beatNote = _ref[0], bar = _ref[1];
  noteHeight = 16;
  noteMargin = 5;
  totalNote = noteMargin + noteHeight;
  ticksPerPixel = 48;
  octaveWeights = [];
  scrollToOctave = function() {
    var dy, max, maxAt;
    maxAt = -Infinity;
    max = -Infinity;
    octaveWeights.forEach(function(w, index) {
      if (w > maxAt) {
        return max = index;
      }
    });
    dy = -12 * noteHeight * max;
    noteArt.attr("transform", "translate(0," + dy + ")");
    return toneArt.attr("transform", "translate(0," + dy + ")");
  };
  maxTime = 0;
  midi.tracks.forEach(function(track) {
    var time;
    time = 0;
    addDurations(track);
    track.forEach(function(event) {
      var note, octave;
      time += event.deltaTime;
      if (event.subtype === "noteOn") {
        note = noteArt.append("rect").attrAll({
          x: time / ticksPerPixel,
          y: event.noteNumber * totalNote,
          width: event.duration / ticksPerPixel,
          height: noteHeight,
          fill: getColor(event)
        });
        octave = Math.floor(event.noteNumber / 12);
        octaveWeights[octave] || (octaveWeights[octave] = 0);
        return octaveWeights[octave] += 1;
      }
    });
    if (time > maxTime) {
      return maxTime = time;
    }
  });
  scrollToOctave();
  for (noteNumber = 0; noteNumber <= 127; noteNumber++) {
    tone = toneArt.append("rect").attrAll({
      x: 0,
      y: noteNumber * totalNote,
      width: 20,
      height: noteHeight,
      fill: "#2A85E8"
    });
    text = toneArt.append("text").attrAll({
      x: 3,
      y: noteNumber * totalNote + 12,
      fill: "#fff"
    });
    text.text(noteNames[noteNumber % 12]);
  }
  qNotes = maxTime / ticksPerQNote;
  beatNotes = Math.ceil(qNotes / 4 / (1 / beatNote));
  ticksPerBeatNote = (1 / beatNote) * 4 * ticksPerQNote;
  for (beat = 0; 0 <= beatNotes ? beat <= beatNotes : beat >= beatNotes; 0 <= beatNotes ? beat++ : beat--) {
    x = beat * ticksPerQNote / ticksPerPixel;
    height = 10;
    if (beat % bar === 0) {
      text = beatArt.append("text").attrAll({
        x: x + 5,
        y: 10
      });
      text.text(beat / bar);
      height = 20;
    }
    beatArt.append("line").attrAll({
      x1: x,
      y1: 30,
      x2: x,
      y2: 30 - height,
      stroke: "#000"
    });
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