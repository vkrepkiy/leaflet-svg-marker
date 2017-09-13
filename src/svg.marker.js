import svgpath from "svgpath";

export default L.SvgPathMarker = L.Path.extend({
	options: {
		direction   : 0,
		fillColor   : "#EEE000",
		fillOpacity : 1,
		lineCap     : "round",
		lineJoin    : "round",
		strokeColor : "#000000",
		scale       : true,
		scaleBase   : 16,
		scalePow    : 1.2,
		weight      : 1
	},

	initialize: function (latlng, options) {
		L.Util.setOptions(this, options);

		this._direction    = this.options.direction;
		this._fillColor    = this.options.fillColor;
		this._fillOpacity  = this.options.fillOpacity;
		this._latlng       = L.latLng(latlng);
		this._lineCap      = this.options.lineCap;
		this._lineJoin     = this.options.lineJoin;
		this._originalSize = L.point(this.options.size);
		this._pathString   = this.options.pathString;
		this._size         = L.point(this.options.size);
		this._strokeColor  = this.options.strokeColor;
		this._scale        = this.options.scale;
		this._scaleBase    = this.options.scaleBase;
		this._scalePow     = this.options.scalePow;
		this._scaleVal     = 1;
		this._weight       = this.options.weight;
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
		this._scaleSize();
		this._updateBounds();
	},
	_scaleSize: function () {
		if (this._scale) {
			let currentZoom = this._map.getZoom();

			this._scaleVal = Math.pow(currentZoom / this._scaleBase, this._scalePow);
			this._size     = L.point(this._originalSize).multiplyBy(this._scaleVal);
		}
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
    var { x, y }  = this._size;
    var tolerance = Math.floor(this._clickTolerance() * this._scaleVal);
		var point = [x / 2 + tolerance, y / 2 + tolerance];

		this._pxBounds = new L.Bounds(this._point.subtract(point), this._point.add(point));
	},
	_updatePath: function () {
		this._renderer._updateSvgMarker(this);
	}
});

L.Canvas.include({
  _updateSvgMarker: function (layer) {
		if (!this._drawing || layer._empty()) {
			return;
		}

    var ctx     = this._ctx;
    var point   = layer._point;
		var center  = layer._size.divideBy(2);

		var path = svgpath(layer._pathString)
			.scale(layer._scaleVal)
			.rotate(layer._direction, center.x, center.y)
			.translate(point.x - center.x, point.y - center.y)
			.toString();

    var icon = new Path2D(path);

    this._drawnLayers[layer._leaflet_id] = layer;

    ctx.globalAlpha = layer._fillOpacity;
    ctx.fillStyle   = layer._fillColor;
    ctx.lineWidth   = layer._weight
		ctx.lineCap     = layer._lineCap;
		ctx.lineJoin    = layer._lineJoin;
		ctx.strokeStyle = layer._strokeColor;

    ctx.fill(icon);
    ctx.stroke(icon);

  }
});
