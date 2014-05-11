# Transform3d

3d transform operations and interpolation.

Some of the code was ported from [Chromium](https://code.google.com/p/chromium).

Supports all of the [w3c transform functions](http://www.w3.org/TR/css-transforms-1/#transform-functions).

Implements the [Interpolation of Transforms](http://www.w3.org/TR/css-transforms-1/#interpolation-of-transforms) logic from the w3c spec. When the transform operations don't match (different length or different operations) the transform operations are converted to a 3d matrix, and a decomposed matrix interpolation is applied instead, courtesy of the [matrix3d package](https://github.com/kamicane/matrix3d).

For application to dom elements, the transform list can either be composed to a matrix, or stringified to a combined transform list.

## Usage

```js
var Transform3d = require('transform3d');

// First transform
var transform1 = new Transform3d;
transform1.rotate(45).scale(2);

// applies Transform3d::toString()
element1.style.WebkitTransform = transform1;
// applies Matrix3d::toString(), should have the same exact effect
element1.style.WebkitTransform = transform1.compose();

// Second transform
var transform2 = new Transform3d;
transform2.rotate(480).scale(1);

// applies Transform3d::toString()
element2.style.WebkitTransform = transform2;
// applies Matrix3d::toString(), should have the same exact effect
element2.style.WebkitTransform = transform2.compose();

// Interpolation
var interpolation = new Transform3d.Interpolation(transform1, transform2);

// dead simple animation logic example
var value = 0;
var interval = setInterval(function() {
  if (value >= 1) value = 1;
  // applying the interpolation as a matrix
  element3.style.WebkitTransform = interpolation.step(value).compose();
  if (value === 1) clearInterval(interval);
  else value += 0.01;
}, 16);
```
