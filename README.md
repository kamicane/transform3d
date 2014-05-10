# Transform3d

3d transform operations and interpolation.

Some of the code was ported from [Chromium](https://code.google.com/p/chromium).

Supports all of the [w3c transform functions](http://www.w3.org/TR/css-transforms-1/#transform-functions).

Implements the [Interpolation of Transforms](http://www.w3.org/TR/css-transforms-1/#interpolation-of-transforms) logic from the w3c spec.

## Usage

```js
// First transform

var transform1 = new Transform3d;
transform1.rotate(45).scale(2);

element1.style.WebkitTransform = transform1; // applies Transform3d::toString()
element1.style.WebkitTransform = transform1.compose(); // applies Matrix3d::toString(), should have the same exact effect

// Second transform

var transform2 = new Transform3d;
transform2.rotate(480).scale(1);

element2.style.WebkitTransform = transform2; // applies Transform3d::toString()
element2.style.WebkitTransform = transform2.compose(); // applies Matrix3d::toString(), should have the same exact effect

// Interpolation

var interpolation = new Transform3d.Interpolation(transform1, transform2);

// dead simple animation logic example

var value = 0;
var interval = setInterval(function() {
  if (value >= 1) value = 1;
  element3.style.WebkitTransform = interpolation.step(value).compose(); // applying the interpolation as a matrix
  if (value === 1) clearInterval(interval);
  else value += 0.01;
}, 16);
```
