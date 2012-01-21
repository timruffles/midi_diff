


addDurations = (events) ->
  noteStatus = {}
  events.forEach (event,index) ->
    return unless event.type == "channel"
    if event.subtype == "noteOn"
      noteStatus[event.noteNumber] = event
      event.index = index
    else if event.subtype == "noteOff"
      noteOn = noteStatus[event.noteNumber]
      noteOn.duration = events[(noteOn.index + 1)..index].reduce(((s,e) -> s + e.deltaTime),0)
  events

draw = (events,art) ->
  console.log "drawing", events
  ticksPerBeat = 480
  bpm = 120
  noteHeight = 10
  noteMargin = 5
  totalNote = noteMargin + noteHeight
  ticksPerPixel = 480 / 100
  time = 0
  events.forEach (event) ->
    time += event.deltaTime
    if event.subtype == "noteOn"
      art.rect(time / ticksPerPixel,event.noteNumber * totalNote,event.duration / ticksPerPixel,noteHeight)


$ ->
  art = Raphael(10,10,800,800)
  zpd = new RaphaelZPD(art,zoom: true, pan: true, drag: true)

  start = (data) ->
    bytes = []
    scc = String.fromCharCode
    for index in [0...data.length]
      bytes[index] = scc(data.charCodeAt(index) & 255)

    midi = new MidiFile(bytes.join(""))
    midi.tracks.forEach (track) ->
      draw addDurations(track), art

  $.ajax
    url: "midis/italo.mid"
    mimeType: "text/plain; charset=x-user-defined"
    success: start
    error: ->
      alert "error"

