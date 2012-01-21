trackName = (track,offset = 0,max = track.length) ->
  return "No track found" if offset == max
  if (evt = track[offset]).subType == "trackName"
    evt.text
  else
    trackName(track,offset + 1,max)

hashBy = (list,fn) ->
  hash = {}
  list.forEach (el) -> hash[fn el] = el
  hash

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
  midiA.tracks (trackA,index) ->
    name = trackName trackA
    trackB = tracksB[name]
    if trackB
      noteEventsA = noteEvents(trackA)
      noteEventsAOffset = byOffset noteEventsA
      noteEventsB = noteEvents(trackB)
      noteEventsBOffset = byOffset noteEventsB
      noteEventsA.forEach (event) ->
        unless noteEventsBOffset[event.offset][event.noteNumber]
          event.deleted = true
    else
      trackA.deleted = true
