trackName = (track,offset = 0,max = track.length) ->
  return "No track found" if offset == max
  if (evt = track[offset]).subtype == "trackName"
    evt.text
  else
    trackName(track,offset + 1,max)

hashBy = (list,fn) ->
  hash = {}
  list.forEach (el) -> hash[fn el] = el
  hash

noteEvents = (events) ->
  events.filter (e) -> e.noteNumber?

byOffset = (events,time = 0) ->
  offset = {}
  events.forEach (event) ->
    time += event.deltaTime
    event.offset = time
    atOffset = offset[time] ||= {}
    atOffset[event.noteNumber] = event
  offset

diff = (midiA, midiB) ->
  tracksB = hashBy midiB.tracks, (t) -> trackName t
  midiA.tracks.forEach (trackA,index) ->
    name = trackName trackA
    trackB = tracksB[name]
    if trackB
      noteEventsA = noteEvents(trackA)
      byOffset noteEventsA
      noteEventsBOffset = byOffset noteEvents(trackB)
      noteEventsA.forEach (event) ->
        unless noteEventsBOffset[event.offset]?[event.noteNumber]
          console.log "deleted"
          event.deleted = true
    else
      trackA.deleted = true
