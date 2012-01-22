var byOffset, diff, hashBy, noteEvents, trackName;
trackName = function(track, offset, max) {
  var evt;
  if (offset == null) {
    offset = 0;
  }
  if (max == null) {
    max = track.length;
  }
  if (offset === max) {
    return "No track found";
  }
  if ((evt = track[offset]).subtype === "trackName") {
    return evt.text;
  } else {
    return trackName(track, offset + 1, max);
  }
};
hashBy = function(list, fn) {
  var hash;
  hash = {};
  list.forEach(function(el) {
    return hash[fn(el)] = el;
  });
  return hash;
};
noteEvents = function(events) {
  return events.filter(function(e) {
    return e.noteNumber != null;
  });
};
byOffset = function(events, time) {
  var offset;
  if (time == null) {
    time = 0;
  }
  offset = {};
  events.forEach(function(event) {
    var atOffset;
    time += event.deltaTime;
    event.offset = time;
    atOffset = offset[time] || (offset[time] = {});
    return atOffset[event.noteNumber] = event;
  });
  return offset;
};
diff = function(midiA, midiB) {
  var tracksB;
  tracksB = hashBy(midiB.tracks, function(t) {
    return trackName(t);
  });
  return midiA.tracks.forEach(function(trackA, index) {
    var name, noteEventsA, noteEventsBOffset, trackB;
    name = trackName(trackA);
    trackB = tracksB[name];
    if (trackB) {
      noteEventsA = noteEvents(trackA);
      byOffset(noteEventsA);
      noteEventsBOffset = byOffset(noteEvents(trackB));
      return noteEventsA.forEach(function(event) {
        var _ref;
        if (!((_ref = noteEventsBOffset[event.offset]) != null ? _ref[event.noteNumber] : void 0)) {
          console.log("deleted");
          return event.deleted = true;
        }
      });
    } else {
      return trackA.deleted = true;
    }
  });
};