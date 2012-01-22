class PanZoomSVG
  
  X = 0
  Y = 1

  xPan = 0
  yPan = 0

  changeCoordinates = (coords...) ->
    x = if coords.indexOf(X) == -1 then 0 else xPan
    y = if coords.indexOf(Y) == -1 then 0 else yPan
    console.log "changing to", x,y
    (el) ->
      el.setAttribute "transform", "translate(#{x},#{y})"

  constructor: (@el,@xPanEls,@yPanEls,@bothEls) ->
    @el.addEventListener "mousedown", @startPan
    @el.addEventListener "mouseup", @stopPan
    @el.addEventListener "mouseout", @stopPan
  startPan: (evt) =>
    @el.addEventListener "mousemove", @mousePan
    @lastX = evt.clientX
    @lastY = evt.clientY
  stopPan: (evt) =>
    @el.removeEventListener "mousemove", @mousePan
    @el.addEventListener "mouseout", @stopPan
  mousePan: (evt) =>
    x = evt.clientX
    y = evt.clientY

    dX = x - (@lastX || x)
    dY = y - (@lastY || y)

    @xPan dX
    @yPan dY

    @lastX = x
    @lastY = y
  yPan: (dY) ->
    return if yPan + dY <= -1700
    yPan += dY
    @yPanEls.forEach changeCoordinates(Y)
    @bothEls.forEach changeCoordinates(X,Y)
  xPan: (dX) ->
    return if xPan + dX <= 0
    xPan += dX
    @xPanEls.forEach changeCoordinates(X)
    @bothEls.forEach changeCoordinates(X,Y)

