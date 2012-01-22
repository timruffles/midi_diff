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


musicalParamters = (midi) ->
  params = {}
  midi.tracks.forEach (track) ->
    track.forEach (event) ->
      if event.subtype == "timeSignature"
        if params.timeSignature
          throw "Opps, don't support changing t sig yet"
        params.timeSignature = [event.numerator,event.denominator]
      if event.subtype == "setTempo"
        params.tempo = event.microsecondsPerBeat
  params

draw = (midi,art) ->

  console.log "drawing", midi

  params = musicalParamters midi

  ticksPerQNote = params.ticksPerBeat || 480
  [beatNote,bar] = params.timeSignature || [4,4]

  noteHeight = 10
  noteMargin = 5
  totalNote = noteMargin + noteHeight
  ticksPerPixel = 48

  maxTime = 0
  midi.tracks.forEach (track) ->
    time = 0

    addDurations track

    track.forEach (event) ->
      time += event.deltaTime
      if event.subtype == "noteOn"
        note = art.rect(time / ticksPerPixel,event.noteNumber * totalNote,event.duration / ticksPerPixel,noteHeight)
        note.attr fill: getColor event
    if time > maxTime
      maxTime = time

  # default 4/4
  qNotes = maxTime / ticksPerQNote
  beatNotes = Math.ceil( qNotes / 4 / (1 / beatNote) )
  ticksPerBeatNote = (1 / beatNote) * 4 * ticksPerQNote
  for beat in [0..beatNotes]
    x = beat * ticksPerQNote / ticksPerPixel
    height = 10
    if beat % bar == 0
      art.text x + 5, 10, beat / bar + 1
      height = 20
    art.path "M#{x},30 L#{x},#{30 - height}"
  null

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

    draw midiA, art
