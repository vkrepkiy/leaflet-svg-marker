import svgpath from "svgpath";

export default L.SvgPathMarker = L.Path.extend({
	options: {
    direction: 0,
    fillColor: "#EEE000",
    fillOpacity: 1,
    lineCap: "round",
    lineJoin: "round",
    weight: 1
	},

	initialize: function (latlng, options) {
		L.Util.setOptions(this, options);

    this._direction   = this.options.direction;
    this._fillColor   = this.options.color;
    this._fillOpacity = this.options.opacity;
		this._latlng      = L.latLng(latlng);
    this._lineCap     = this.options.lineCap;
    this._lineJoin    = this.options.lineJoin;
    this._pathString  = this.options.pathString;
    this._size        = L.point(this.options.size);
    this._weight      = this.options.weight;
	},
	_containsPoint: function (p) {
		return p.distanceTo(this._point) <= this._size.x + this._clickTolerance();
	},
	_empty: function () {
		return this._size && !this._renderer._bounds.intersects(this._pxBounds);
	},
	getLatLng: function () {
		return this._latlng;
	},
	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},
	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},
	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},
	_updateBounds: function () {
    var { x, y } = this._size;
    var w = this._clickTolerance()
		var p = [x + w, y + w];

		this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
	},
	_updatePath: function () {
		this._renderer._updateSvgMarker(this);
	}
});

L.Canvas.include({
  _updateSvgMarker: function (layer) {
    var ctx     = this._ctx;
    var point   = layer._point;
    var center  = layer._size.divideBy(2).round();
    var path = svgpath(layer._pathString)
      .rotate(layer._direction, center.x, center.y)
      .translate(point.x, point.y)
      .toString();
    var icon = new Path2D(path);

    this._drawnLayers[layer._leaflet_id] = layer;

    ctx.globalAlpha = layer._fillOpacity;
    ctx.fillStyle   = layer._fillColor;
    ctx.lineWidth   = layer._weight
		ctx.lineCap     = layer._lineCap;
		ctx.lineJoin    = layer._lineJoin;

    ctx.fill(icon);
    ctx.stroke(icon);

  }
});
