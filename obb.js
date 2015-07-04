var OBB = {

	// Check for a collision.
	// A and B have to be of type Phaser.Physic.Arcade.Body
	collisionCheck: function  (A, B, overlapOnly) {
		var ARect = OBB.createRectangle(A);
		var BRect = OBB.createRectangle(B);
		var overlapVector = [1, 1];
		var edgeNr = -1;

		if (OBB.isecRects(ARect, BRect)) {
			var BPoint = new Phaser.Point(B.center.x, B.center.y),
				tmpDistance = Number.POSITIVE_INFINITY;

			for (var i = 0; i <= 7; i = i+2) {
				var result = OBB.pointInRectangle(BRect, [ARect[i],ARect[i+1]]);
				if (result) {
					var newDistance = BPoint.distance(ARect[i],ARect[i+1]);

					if (newDistance < tmpDistance) {
						overlapVector = [ (B.center.x - ARect[i]), (B.center.y - ARect[i+1])];
						edgeNr = i;
					}
				}
			}

			if (!overlapOnly) {
				this.bounceHandlerX(B, A, overlapVector, edgeNr);
				this.bounceHandlerY(B, A, overlapVector, edgeNr);
			}

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

		return OBB.collisionCheck(body1, body2, overlapOnly);
	},

	// returns true if the point lies in the reactangle
	// Algorithm found there: http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
	pointInRectangle: function (rect, point) {
		var xp = point[0],
			yp = point[1];

		var D = [];

		for (var i = 0; i<8; i = i+2) {
			var x1 = rect[i],
				y1 = rect[i+1],
				x2 = rect[(i+2) % 7],
				y2 = rect[(i+3) % 7];

			var A = -(y2 - y1),
				B = x2 - x1,
				C = -(A * x1 + B * y1);

			D.push( A * xp + B * yp + C );
		}

		return (D[0] < 0 && D[1] < 0 && D[2] < 0 && D[3] < 0) ? D : false;
	},

	bounceHandlerX: function (body1, body2, overlapVector, edgeNr) {
		var overlap = overlapVector[0];

		/*if (edgeNr != 6 || edgeNr != 0)
			overlap = overlap * -1;*/

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

	bounceHandlerY: function (body1, body2, overlapVector, edgeNr) {
		var overlap = overlapVector[1];

		/*if (edgeNr != 6 || edgeNr != 0)
			overlap = overlap * -1;*/


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
	},

	// Line  = [x1, y1, x2, y2]
	// returns the shortest vector from the line to the point in format [x, y]
	lineToPointVector: function(line, point) {
		var p0 = [line[0], line[1]],
			p1 = [line[2], line[3]],
			p2 = point;

		var x10 = p1[0] - p0[0],
			y10 = p1[1] - p0[1],
			x20 = p2[0] - p0[0],
			y20 = p2[1] - p0[1];

		var t = (x20 * x10 + y20 * y10) / (x10 * x10 + y10 * y10),
			x10 = p1[0] - p0[0],
			y10 = p1[1] - p0[1],
			p3 = [p0[0] + t * x10, p0[1] + t * y10];

		return [p3[0] - point[0], p3[1] - point[1]];
	}

};

OBB.debug = {

	drawVertices: function (body, color) {
		var color = color ? color : 0xff0000; // RED
		if (!body.obbDebug)
			body.obbDebug = OBB.game.add.graphics(0, 0);

		var r = OBB.createRectangle(body);

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
