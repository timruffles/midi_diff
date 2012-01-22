translateRe = /translate\(([\d\-]+),([\d-]+)\)/
getTranslate = (el) ->
  match = translateRe.exec(el.getAttribute "transform")
  match?.slice(1).map((v) -> parseInt v) || [0,0]
class PanZoomSVG
  
  X = 0
  Y = 1

  constructor: (@el,@noteEl,@beatEl,@toneEl) ->
    @el.addEventListener "mousedown", @startPan
    @el.addEventListener "mouseup", @stopPan
    @el.addEventListener "mouseout", @stopPan
    @elPositions = {}
    ["note","tone","beat"].forEach (key) =>
      @elPositions[key] = getTranslate @[key + "El"]
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
    ["note","tone"].forEach (key) =>
      @changeCoordinate key, dY, Y
  xPan: (dX) ->
    ["note","beat"].forEach (key) =>
      @changeCoordinate key, dX, X
  changeCoordinate: (key,delta,coord) ->
    pos = @elPositions[key]
    pos[coord] += delta
    [x,y] = pos
    @[key + "El"].setAttribute "transform", "translate(#{x},#{y})"
  updateMatrix: (matrix) ->
    @matrix || = [1,0,0,
                  0,1,0]
    for el, index in matrix
      if el?
        @matrix[index] = el
    



