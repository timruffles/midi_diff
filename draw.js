var addDurations, draw, getColor, getMidi;
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
draw = function(events, art) {
  var bpm, noteHeight, noteMargin, ticksPerBeat, ticksPerPixel, time, totalNote, track, wrapper;
  console.log("drawing", events);
  ticksPerBeat = 480;
  bpm = 120;
  noteHeight = 10;
  noteMargin = 5;
  totalNote = noteMargin + noteHeight;
  ticksPerPixel = 480 / 100;
  time = 0;
  track = art.set();
  track.push(wrapper = art.rect());
  return events.forEach(function(event) {
    var note;
    time += event.deltaTime;
    if (event.subtype === "noteOn") {
      note = art.rect(time / ticksPerPixel, event.noteNumber * totalNote, event.duration / ticksPerPixel, noteHeight);
      note.attr({
        fill: getColor(event)
      });
      return track.push(note);
    }
  });
};
getMidi = function(file) {
  return $.ajax({
    url: file,
    mimeType: "text/plain; charset=x-user-defined"
  });
};
$(function() {
  var art, loadDiff, toMidiFile, zpd;
  art = Raphael(10, 10, 800, 800);
  zpd = new RaphaelZPD(art, {
    zoom: true,
    pan: true,
    drag: true
  });
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
    return midiA.tracks.forEach(function(track) {
      return draw(addDurations(track), art);
    });
  });
});