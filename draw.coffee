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

getColor = (note) ->
  if note.deleted
    "red"
  else
    "blue"
draw = (events,art) ->
  console.log "drawing", events
  ticksPerBeat = 480
  bpm = 120
  noteHeight = 10
  noteMargin = 5
  totalNote = noteMargin + noteHeight
  ticksPerPixel = 480 / 100
  time = 0
  track = art.set()
  track.push wrapper = art.rect()
  events.forEach (event) ->
    time += event.deltaTime
    if event.subtype == "noteOn"
      note = art.rect(time / ticksPerPixel,event.noteNumber * totalNote,event.duration / ticksPerPixel,noteHeight)
      note.attr fill: getColor event
      track.push note

getMidi = (file) ->
  $.ajax
    url: file
    mimeType: "text/plain; charset=x-user-defined"


$ ->
  art = Raphael(10,10,800,800)
  zpd = new RaphaelZPD(art,zoom: true, pan: true, drag: true)

  toMidiFile = (data) ->
    bytes = []
    scc = String.fromCharCode
    for index in [0...data.length]
      bytes[index] = scc(data.charCodeAt(index) & 255)

    midi = new MidiFile(bytes.join(""))


  loadDiff = (trackA,trackB) ->
    def = $.Deferred()
    a = getMidi("midis/track_a_v2.mid")
    b = getMidi("midis/track_a_v1.mid")
    a.then (aResp) ->
      aVal = toMidiFile(aResp)
      b.then (bVal) ->
        def.resolve [aVal, toMidiFile bVal]
    def

  loadDiff().then ([midiA,midiB]) ->

    diff midiA, midiB

    midiA.tracks.forEach (track) ->
      draw addDurations(track), art
