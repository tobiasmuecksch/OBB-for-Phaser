var OBB = {

	// Check for a collision.
	// A and B have to be fo type Phaser.Physic.Arcade.Body
	collisionCheck: function(A, B) {
		var ARect = OBB.createRectangle([A.center.x, A.center.y], OBB.rotateVector([A.halfWidth, A.halfHeight], Phaser.Math.degToRad(A.angle)));
		var BRect = OBB.createRectangle([B.center.x, B.center.y], OBB.rotateVector([B.halfWidth, B.halfHeight], Phaser.Math.degToRad(B.angle)));

		return OBB.isecRects(ARect, BRect);
	},

	// We assume a vector consisting of [halfWidth, halfHeight], which can be used to point from the center to the edges
	// We need to rotate this vector in order to create the rotated rectangle
	rotateVector: function(vector, radians) {
		var x = vector[0] * Math.cos(radians) - vector[1] * Math.sin(radians);
		var y = vector[0] * Math.sin(radians) + vector[1] * Math.cos(radians);

		return [x, y];
	},

	// This function takes a center point (in this format [x,y]) and a rotated vector (in this format [x,y])
	// and returns a rectangle in this format: [x1, y1, x2, y2, x3, y3, x4, y4]
	createRectangle: function(center, vector) {
		var x = vector[0],
			y = vector[1],

			x1 = center[0] + x,
			y1 = center[1] + y,

			x2 = center[0] + x,
			y2 = center[1] - y,

			x3 = center[0] - x,
			y3 = center[1] - y,

			x4 = center[0] - x,
			y4 = center[1] + y;

		return [x1, y1, x2, y2, x3, y3, x4, y4];
	},

	// Source: https://gist.github.com/shamansir/3007244
	edgeTest: function(p1, p2, p3, r2) {
		var rot = [-(p2[1] - p1[1]),
			p2[0] - p1[0]
		];

		var ref = (rot[0] * (p3[0] - p1[0]) +
			rot[1] * (p3[1] - p1[1])) >= 0;

		for (var i = 0, il = r2.length; i < il; i += 2) {
			if (((rot[0] * (r2[i] - p1[0]) +
					rot[1] * (r2[i + 1] - p1[1])) >= 0) === ref) return false;
		}

		return true;
	},

	// source: https://gist.github.com/shamansir/3007244
	isecRects: function(r1, r2) {
		if (!r1 || !r2) throw new Error('Rects are not accessible');

		var pn, px;
		for (var pi = 0, pl = r1.length; pi < pl; pi += 2) {
			pn = (pi === (pl - 2)) ? 0 : pi + 2; // next point
			px = (pn === (pl - 2)) ? 0 : pn + 2;
			if (OBB.edgeTest([r1[pi], r1[pi + 1]], [r1[pn], r1[pn + 1]], [r1[px], r1[px + 1]], r2)) return false;
		}
		for (var pi = 0, pl = r2.length; pi < pl; pi += 2) {
			pn = (pi === (pl - 2)) ? 0 : pi + 2; // next point
			px = (pn === (pl - 2)) ? 0 : pn + 2;
			if (OBB.edgeTest([r2[pi], r2[pi + 1]], [r2[pn], r2[pn + 1]], [r2[px], r2[px + 1]], r1)) return false;
		}
		return true;
	},

	// Overwrite the seperate function for OBB collision detection
	separate: function(body1, body2, processCallback, callbackContext, overlapOnly) {
		if (!body1.enable || !body2.enable) {
			return false;
		}

		//  Is there a custom process callback? If it returns true then we can carry on, otherwise we should abort.
		if (processCallback && processCallback.call(callbackContext, body1.sprite, body2.sprite) === false) {
			return false;
		}

		return OBB.collisionCheck(body1, body2);
	},

	// This function is used to overwrite the seperate function of a Phase.Arcade.World instance.
	setOBB: function(gameRef) {
		OBB.game = gameRef;
		gameRef.physics.arcade.separate = OBB.separate;
	}

};
