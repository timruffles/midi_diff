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

d3.selection.prototype.attrAll = (attrs) ->
  for own k, v of attrs
    @attr k, v
  this

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

addGroup = (paper) ->
  root = paper.canvas
  group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  root.appendChild group
  paper.zoomPanGroup = group
  ['circle', 'rect', 'ellipse', 'image', 'text', 'path'].forEach (method) ->
    original = paper[method]
    paper[method] = ->
      el = original.apply(paper,arguments)
      group.appendChild el.node
      el

noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]

byId = (id) -> document.getElementById id

draw = (midi) ->

  noteSVG = byId "notes"
  toneSVG = byId "tones"
  beatSVG = byId "beats"

  noteArt = d3.select "#notes"
  toneArt = d3.select "#tones"
  beatArt = d3.select "#beats"

  console.log "drawing", midi

  params = musicalParamters midi

  ticksPerQNote = params.ticksPerBeat || 480
  [beatNote,bar] = params.timeSignature || [4,4]

  noteHeight = 10
  noteMargin = 5
  totalNote = noteMargin + noteHeight
  ticksPerPixel = 48

  octaveWeights = []
  scrollToOctave = (octaveWeights,paper) ->
    maxAt = -Infinity
    max = -Infinity
    octaveWeights.forEach (w,index) -> max = index if w > maxAt
    dy = - 12 * noteHeight * max # set dY
    /* paper.zoomPanGroup.setAttribute("transform","matrix(1,0,0,1,0,#{dy})")*/

  maxTime = 0
  midi.tracks.forEach (track) ->
    time = 0

    addDurations track

    track.forEach (event) ->
      time += event.deltaTime
      if event.subtype == "noteOn"
        note = noteArt.append("rect").attrAll
          x: time / ticksPerPixel
          y: event.noteNumber * totalNote
          width: event.duration / ticksPerPixel
          height: noteHeight
          fill: getColor event
        octave = Math.floor event.noteNumber / 12
        octaveWeights[octave] ||= 0
        octaveWeights[octave] += 1
    if time > maxTime
      maxTime = time

  scrollToOctave octaveWeights, noteArt
  scrollToOctave octaveWeights, toneArt

  for noteNumber in [0..127]
    tone = toneArt.append("rect").attrAll
      x:0
      y:noteNumber * totalNote
      width: 20
      height: noteHeight
      fill: "green"
    text = toneArt.append("text").attrAll
      x:3
      y:noteNumber * totalNote + 5
      stroke: "#fff"
    text.text noteNames[noteNumber % 12]


  # default 4/4
  qNotes = maxTime / ticksPerQNote
  beatNotes = Math.ceil( qNotes / 4 / (1 / beatNote) )
  ticksPerBeatNote = (1 / beatNote) * 4 * ticksPerQNote
  for beat in [0..beatNotes]
    x = beat * ticksPerQNote / ticksPerPixel
    height = 10
    if beat % bar == 0
      text = beatArt.append("text").attrAll
        x: x + 5
        y: 10
      text.text beat / bar
      height = 20
    beatArt.append("line").attrAll
      x1: x
      y1: 30
      x2: x
      y2: 30 - height
      stroke: "#000"
  null

getMidi = (file) ->
  $.ajax
    url: file
    mimeType: "text/plain; charset=x-user-defined"


$ ->


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

    draw midiA
