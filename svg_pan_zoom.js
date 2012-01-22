var PanZoomSVG, getTranslate, translateRe;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
translateRe = /translate\(([\d\-]+),([\d-]+)\)/;
getTranslate = function(el) {
  var match;
  match = translateRe.exec(el.getAttribute("transform"));
  return (match != null ? match.slice(1).map(function(v) {
    return parseInt(v);
  }) : void 0) || [0, 0];
};
PanZoomSVG = (function() {
  var X, Y;
  X = 0;
  Y = 1;
  function PanZoomSVG(el, noteEl, beatEl, toneEl) {
    this.el = el;
    this.noteEl = noteEl;
    this.beatEl = beatEl;
    this.toneEl = toneEl;
    this.mousePan = __bind(this.mousePan, this);
    this.stopPan = __bind(this.stopPan, this);
    this.startPan = __bind(this.startPan, this);
    this.el.addEventListener("mousedown", this.startPan);
    this.el.addEventListener("mouseup", this.stopPan);
    this.el.addEventListener("mouseout", this.stopPan);
    this.elPositions = {};
    ["note", "tone", "beat"].forEach(__bind(function(key) {
      return this.elPositions[key] = getTranslate(this[key + "El"]);
    }, this));
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
    return ["note", "tone"].forEach(__bind(function(key) {
      return this.changeCoordinate(key, dY, Y);
    }, this));
  };
  PanZoomSVG.prototype.xPan = function(dX) {
    return ["note", "beat"].forEach(__bind(function(key) {
      return this.changeCoordinate(key, dX, X);
    }, this));
  };
  PanZoomSVG.prototype.changeCoordinate = function(key, delta, coord) {
    var pos, x, y;
    pos = this.elPositions[key];
    pos[coord] += delta;
    x = pos[0], y = pos[1];
    return this[key + "El"].setAttribute("transform", "translate(" + x + "," + y + ")");
  };
  PanZoomSVG.prototype.updateMatrix = function(matrix) {
    var el, index, _len, _results;
    this.matrix || (this.matrix = [1, 0, 0, 0, 1, 0]);
    _results = [];
    for (index = 0, _len = matrix.length; index < _len; index++) {
      el = matrix[index];
      _results.push(el != null ? this.matrix[index] = el : void 0);
    }
    return _results;
  };
  return PanZoomSVG;
})();