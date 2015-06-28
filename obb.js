var OBB = {

	// Check for a collision.
	// A and B have to be of type Phaser.Physic.Arcade.Body
	collisionCheck: function  (A, B) {
		var ARect = OBB.createRectangle(A);
		var BRect = OBB.createRectangle(B);

		if (OBB.isecRects(ARect, BRect)) {
			this.bounceHandlerX(A, B);
			this.bounceHandlerY(A, B);
			return true;
		}

		return false;
	},

	// We assume a vector consisting of [halfWidth, halfHeight], which can be used to point from the center to the edges
	// We need to rotate this vector in order to create the rotated rectangle
	rotateVector: function (vector, radians) {
		var x = vector[0] * Math.cos(radians) - vector[1] * Math.sin(radians);
		var y = vector[0] * Math.sin(radians) + vector[1] * Math.cos(radians);

		return [x, y];
	},

	// This function takes a center point (in this format [x,y]) and a rotated vector (in this format [x,y])
	// and returns a rectangle in this format: [x1, y1, x2, y2, x3, y3, x4, y4]
	createRectangle: function (body) {
		var center = [body.center.x, body.center.y];

		var vector1 = OBB.rotateVector([body.halfWidth, body.halfHeight], Phaser.Math.degToRad(body.rotation));
		var vector2 = OBB.rotateVector([body.halfWidth, body.halfHeight], Phaser.Math.degToRad(-body.rotation));

		var x1 = center[0] + vector1[0],
		y1 = center[1] + vector1[1],

		x2 = center[0] + vector2[0],
		y2 = center[1] - vector2[1],

		x3 = center[0] - vector1[0],
		y3 = center[1] - vector1[1],

		x4 = center[0] - vector2[0],
		y4 = center[1] + vector2[1];

		return [x1, y1, x2, y2, x3, y3, x4, y4];
	},

	// Source: https://gist.github.com/shamansir/3007244
	edgeTest:function (p1, p2, p3, r2) {
		var rot = [ -(p2[1] - p1[1]),
					  p2[0] - p1[0] ];

		var ref = (rot[0] * (p3[0] - p1[0]) +
				   rot[1] * (p3[1] - p1[1])) >= 0;

		for (var i = 0, il = r2.length; i < il; i+=2) {
			if (((rot[0] * (r2[i]   - p1[0]) +
				  rot[1] * (r2[i+1] - p1[1])) >= 0) === ref) return false;
		}

		return true;
	},

	// source: https://gist.github.com/shamansir/3007244
	isecRects: function (r1, r2) {
		if (!r1 || !r2) throw new Error('Rects are not accessible');

		var pn, px;
		for (var pi = 0, pl = r1.length; pi < pl; pi += 2) {
			pn = (pi === (pl - 2)) ? 0 : pi + 2; // next point
			px = (pn === (pl - 2)) ? 0 : pn + 2;
			if (OBB.edgeTest([r1[pi], r1[pi+1]],
						 [r1[pn], r1[pn+1]],
						 [r1[px], r1[px+1]], r2)) return false;
		}
		for (var pi = 0, pl = r2.length; pi < pl; pi += 2) {
			pn = (pi === (pl - 2)) ? 0 : pi + 2; // next point
			px = (pn === (pl - 2)) ? 0 : pn + 2;
			if (OBB.edgeTest([r2[pi], r2[pi+1]],
						 [r2[pn], r2[pn+1]],
						 [r2[px], r2[px+1]], r1)) return false;
		}
		return true;
	},

	// Overwrite the seperate function for OBB collision detection
	separate: function (body1, body2, processCallback, callbackContext, overlapOnly) {
		if (!body1.enable || !body2.enable)
		{
			return false;
		}

		//  Is there a custom process callback? If it returns true then we can carry on, otherwise we should abort.
		if (processCallback && processCallback.call(callbackContext, body1.sprite, body2.sprite) === false)
		{
			return false;
		}

		return OBB.collisionCheck(body1, body2);
	},

	// Source: separateX-function in https://github.com/photonstorm/phaser/blob/master/src/physics/arcade/World.js
	bounceHandlerX: function (body1, body2) {
		var overlap = 1;
		var v1 = body1.velocity.x;
		var v2 = body2.velocity.x;

		if (!body1.immovable && !body2.immovable)
		{
			overlap *= 0.5;

			body1.x = body1.x - overlap;
			body2.x += overlap;

			var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
			var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
			var avg = (nv1 + nv2) * 0.5;

			nv1 -= avg;
			nv2 -= avg;

			body1.velocity.x = avg + nv1 * body1.bounce.x;
			body2.velocity.x = avg + nv2 * body2.bounce.x;
		}
		else if (!body1.immovable)
		{
			body1.x = body1.x - overlap;
			body1.velocity.x = v2 - v1 * body1.bounce.x;

			//  This is special case code that handles things like vertically moving platforms you can ride
			if (body2.moves)
			{
				body1.y += (body2.y - body2.prev.y) * body2.friction.y;
			}
		}
		else if (!body2.immovable)
		{
			body2.x += overlap;
			body2.velocity.x = v1 - v2 * body2.bounce.x;

			//  This is special case code that handles things like vertically moving platforms you can ride
			if (body1.moves)
			{
				body2.y += (body1.y - body1.prev.y) * body1.friction.y;
			}
		}

		return true;
	},

	// Source: separateX-function in https://github.com/photonstorm/phaser/blob/master/src/physics/arcade/World.js
	bounceHandlerY: function (body1, body2) {
		var overlap = 1;
		var v1 = body1.velocity.y;
		var v2 = body2.velocity.y;

		if (!body1.immovable && !body2.immovable)
		{
			overlap *= 0.5;

			body1.y = body1.y - overlap;
			body2.y += overlap;

			var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
			var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
			var avg = (nv1 + nv2) * 0.5;

			nv1 -= avg;
			nv2 -= avg;

			body1.velocity.y = avg + nv1 * body1.bounce.y;
			body2.velocity.y = avg + nv2 * body2.bounce.y;
		}
		else if (!body1.immovable)
		{
			body1.y = body1.y - overlap;
			body1.velocity.y = v2 - v1 * body1.bounce.y;

			//  This is special case code that handles things like vertically moving platforms you can ride
			if (body2.moves)
			{
				body1.x += (body2.x - body2.prev.x) * body2.friction.x;
			}
		}
		else if (!body2.immovable)
		{
			body2.y += overlap;
			body2.velocity.y = v1 - v2 * body2.bounce.y;

			//  This is special case code that handles things like vertically moving platforms you can ride
			if (body1.moves)
			{
				body2.x += (body1.x - body1.prev.x) * body1.friction.x;
			}
		}

		return true;
	},

	// This function is used to overwrite the seperate function of a Phase.Arcade.World instance.
	setOBB: function (gameRef) {
		OBB.game = gameRef;
		gameRef.physics.arcade.separate = OBB.separate;
	}

};

OBB.debug = {

	drawVertices: function (body, color) {
		var color = color ? color : 0xff0000; // RED
		if (!body.obbDebug)
			body.obbDebug = OBB.game.add.graphics(0, 0);

		var r = OBB.createRectangle(body);;

		if (body.obbDebug)
			body.obbDebug.destroy();
		// add a new graphics object
		body.obbDebug = OBB.game.add.graphics(0, 0);

		// add the vertices
		body.obbDebug.lineStyle(1, color);
		body.obbDebug.drawCircle(r[0], r[1], 10);
		body.obbDebug.drawCircle(r[2], r[3], 10);
		body.obbDebug.drawCircle(r[4], r[5], 10);
		body.obbDebug.drawCircle(r[6], r[7], 10);
	}

};
