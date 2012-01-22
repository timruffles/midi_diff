var PanZoomSVG;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
PanZoomSVG = (function() {
  var X, Y, changeCoordinates, xPan, yPan;
  X = 0;
  Y = 1;
  xPan = 0;
  yPan = 0;
  changeCoordinates = function() {
    var coords, x, y;
    coords = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    x = coords.indexOf(X) === -1 ? 0 : xPan;
    y = coords.indexOf(Y) === -1 ? 0 : yPan;
    console.log("changing to", x, y);
    return function(el) {
      return el.setAttribute("transform", "translate(" + x + "," + y + ")");
    };
  };
  function PanZoomSVG(el, xPanEls, yPanEls, bothEls) {
    this.el = el;
    this.xPanEls = xPanEls;
    this.yPanEls = yPanEls;
    this.bothEls = bothEls;
    this.mousePan = __bind(this.mousePan, this);
    this.stopPan = __bind(this.stopPan, this);
    this.startPan = __bind(this.startPan, this);
    this.el.addEventListener("mousedown", this.startPan);
    this.el.addEventListener("mouseup", this.stopPan);
    this.el.addEventListener("mouseout", this.stopPan);
  }
  PanZoomSVG.prototype.startPan = function(evt) {
    this.el.addEventListener("mousemove", this.mousePan);
    this.lastX = evt.clientX;
    return this.lastY = evt.clientY;
  };
  PanZoomSVG.prototype.stopPan = function(evt) {
    this.el.removeEventListener("mousemove", this.mousePan);
    return this.el.addEventListener("mouseout", this.stopPan);
  };
  PanZoomSVG.prototype.mousePan = function(evt) {
    var dX, dY, x, y;
    x = evt.clientX;
    y = evt.clientY;
    dX = x - (this.lastX || x);
    dY = y - (this.lastY || y);
    this.xPan(dX);
    this.yPan(dY);
    this.lastX = x;
    return this.lastY = y;
  };
  PanZoomSVG.prototype.yPan = function(dY) {
    if (yPan + dY <= -1700) {
      return;
    }
    yPan += dY;
    this.yPanEls.forEach(changeCoordinates(Y));
    return this.bothEls.forEach(changeCoordinates(X, Y));
  };
  PanZoomSVG.prototype.xPan = function(dX) {
    if (xPan + dX >= 1000) {
      return;
    }
    xPan += dX;
    this.xPanEls.forEach(changeCoordinates(X));
    return this.bothEls.forEach(changeCoordinates(X, Y));
  };
  return PanZoomSVG;
})();