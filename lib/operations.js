// Transform Operations
// Some methods are ported from the Chromium source: transform.cc, transform_opertaion.cc, transform_operations.cc
'use strict';

var prime = require('prime');

var Matrix3d = require('matrix3d');
var Vector3 = require('matrix3d/lib/Vector3');
var Vector4 = require('matrix3d/lib/Vector4');

var epsilon = 1e-4;

var tanDeg = function(degrees) {
  var radians = degrees * Math.PI / 180;
  return Math.tan(radians);
};

var TranslateOperation = exports.Translate = prime({

  type: 'Translate',

  constructor: function TranslateOperation(v3) {
    this.value = v3 || new Vector3(0, 0, 0);
  },

  equals: function(translateOperation) {
    return this.value.equals(translateOperation.value);
  },

  interpolate: function(translateOperation, delta) {
    return new TranslateOperation(this.value.lerp(translateOperation.value, delta));
  },

  isIdentity: function() {
    return this.value.equals(new Vector3(0, 0, 0));
  },

  compose: function() {
    return new Matrix3d().translate(this.value);
  },

  toString: function() {
    var v = this.value;
    return 'translate3d(' + [v.x + 'px', v.y + 'px', v.z + 'px'].join(', ') + ')';
  }

});

var ScaleOperation = exports.Scale = prime({

  type: 'Scale',

  constructor: function ScaleOperation(v3) {
    this.value = v3 || new Vector3(1, 1, 1);
  },

  equals: function(scaleOperation) {
    return this.value.equals(scaleOperation.value);
  },

  interpolate: function(scaleOperation, delta) {
    return new ScaleOperation(this.value.lerp(scaleOperation.value, delta));
  },

  isIdentity: function() {
    return this.value.equals(new Vector3(1, 1, 1));
  },

  compose: function() {
    return new Matrix3d().scale(this.value);
  },

  toString: function() {
    var v = this.value;
    return 'scale3d(' + [v.x, v.y, v.z].join(', ') + ')';
  }

});

var RotateOperation = exports.Rotate = prime({

  type: 'Rotate',

  constructor: function RotateOperation(v4) {
    this.value = v4 || new Vector4(1, 1, 1, 0);
  },

  equals: function(to) {
    return this.value.equals(to.value);
  },

  interpolate: function(rotateOperation, delta) {

    var from = this.value;
    var to = rotateOperation.value;

    var fromAxis = new Vector3(from.x, from.y, from.z);
    var toAxis = new Vector3(to.x, to.y, to.z);

    if (fromAxis.equals(toAxis)) {
      return new RotateOperation(new Vector4(
        from.x,
        from.y,
        from.z,
        from.w * (1 - delta) + to.w * delta
      ));
    }

    var length1 = fromAxis.length();
    var length2 = toAxis.length();

    if (length1 > epsilon && length2 > epsilon) {
      var dot = fromAxis.dot(toAxis);

      var error = Math.abs(1 - (dot * dot) / (length1 * length2));
      var result = error < epsilon;
      if (result) return new RotateOperation(new Vector4(
        to.x,
        to.y,
        to.z,
        // If the axes are pointing in opposite directions, we need to reverse
        // the angle.
        dot > 0 ? from.w : -from.w
      ));
    }

    var interpolated = from.angleToQuaternion(true).slerp(to.angleToQuaternion(true));
    return new RotateOperation(interpolated.quaternionToAngle(true));
  },

  isIdentity: function() {
    return this.value.equals(new Vector4(1, 1, 1, 0));
  },

  compose: function() {
    return new Matrix3d().rotate(this.value.angleToQuaternion(true));
  },

  toString: function() {
    var v = this.value;
    return 'rotate3d(' + [v.x, v.y, v.z, v.w + 'deg'].join(', ') + ')';
  }

});

var PerspectiveOperation = exports.Perspective = prime({

  type: 'Perspective',

  constructor: function PerspectiveOperation(length) {
    this.value = length || 0;
  },

  equals: function(perspectiveOperation) {
    return this.value === perspectiveOperation.value;
  },

  interpolate: function(perspectiveOperation, delta) {
    return new PerspectiveOperation(this.value * (1 - delta) + perspectiveOperation.value * delta);
  },

  isIdentity: function() {
    return this.value === 0;
  },

  compose: function() {
    var perspectiveMatrix = new Matrix3d;
    var value = this.value;
    if (value !== 0) perspectiveMatrix.m34 = -1 / value;
    return perspectiveMatrix;
  },

  toString: function() {
    return 'perspective(' + this.value + ')';
  }

});

var SkewOperation = exports.Skew = prime({

  type: 'Skew',

  constructor: function SkewOperation(XY) {
    this.value = XY || [0, 0];
  },

  equals: function(skewOperation) {
    var array1 = this.value;
    var array2 = skewOperation.value;
    return array1[0] === array2[0] && array1[1] === array2[1];
  },

  interpolate: function(skewOperation, delta) {
    return new SkewOperation([
      this[0] * (1 - delta) + skewOperation[0] * delta,
      this[1] * (1 - delta) + skewOperation[1] * delta
    ]);
  },

  isIdentity: function() {
    var array = this.value;
    return array[0] === 0 && array[1] === 0;
  },

  compose: function() {
    var value = this.value;
    var skewMatrix = new Matrix3d;
    skewMatrix.m21 = tanDeg(value[0]);
    skewMatrix.m12 = tanDeg(value[1]);
    return skewMatrix;
  },

  toString: function() {
    var v = this.value;
    return 'skewX(' + v[0] + ') skewY(' + v[1] + ')';
  }

});

var MatrixOperation = exports.Matrix = prime({

  type: 'Matrix',

  constructor: function MatrixOperation(matrix, _decomposed) {
    this.value = matrix || new Matrix3d;
    this.decomposed = _decomposed || this.value.decompose();
  },

  equals: function(matrixOperation) {
    return this.value.equals(matrixOperation.value);
  },

  interpolate: function(matrixOperation, delta) {
    var decomposed = this.decomposed.interpolate(matrixOperation.decomposed, delta);
    return new MatrixOperation(decomposed.compose(), decomposed);
  },

  isIdentity: function() {
    return this.value.isIdentity();
  },

  compose: function() {
    return this.value;
  },

  toString: function() {
    return this.value.toString();
  }

});
