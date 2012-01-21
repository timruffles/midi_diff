var addDurations, draw;
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
draw = function(events, art) {
  var bpm, noteHeight, noteMargin, ticksPerBeat, ticksPerPixel, time, totalNote;
  console.log("drawing", events);
  ticksPerBeat = 480;
  bpm = 120;
  noteHeight = 10;
  noteMargin = 5;
  totalNote = noteMargin + noteHeight;
  ticksPerPixel = 480 / 100;
  time = 0;
  return events.forEach(function(event) {
    time += event.deltaTime;
    if (event.subtype === "noteOn") {
      return art.rect(time / ticksPerPixel, event.noteNumber * totalNote, event.duration / ticksPerPixel, noteHeight);
    }
  });
};
$(function() {
  var art, start, zpd;
  art = Raphael(10, 10, 800, 800);
  zpd = new RaphaelZPD(art, {
    zoom: true,
    pan: true,
    drag: true
  });
  start = function(data) {
    var bytes, index, midi, scc, _ref;
    bytes = [];
    scc = String.fromCharCode;
    for (index = 0, _ref = data.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
      bytes[index] = scc(data.charCodeAt(index) & 255);
    }
    midi = new MidiFile(bytes.join(""));
    return midi.tracks.forEach(function(track) {
      return draw(addDurations(track), art);
    });
  };
  return $.ajax({
    url: "midis/italo.mid",
    mimeType: "text/plain; charset=x-user-defined",
    success: start,
    error: function() {
      return alert("error");
    }
  });
});