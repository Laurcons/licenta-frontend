type Coordinate = { latitude: number; longitude: number };
type Point = { x: number; y: number };
function toPoint(coord: Coordinate): Point {
  return {
    x: coord.latitude,
    y: coord.longitude,
  };
}
function toCoord(point: Point): Coordinate {
  return {
    latitude: point.x,
    longitude: point.y,
  };
}

export class CoordUtil {
  static distance(coord1: Coordinate, coord2: Coordinate) {
    const { latitude: lat1, longitude: lon1 } = coord1;
    const { latitude: lat2, longitude: lon2 } = coord2;
    function deg2rad(deg: any) {
      return deg * (Math.PI / 180);
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  static distToSegment(
    point: Coordinate,
    [seg1, seg2]: [Coordinate, Coordinate]
  ): number {
    function sqr(x: number) {
      return x * x;
    }
    function dist2(v: Point, w: Point) {
      return sqr(v.x - w.x) + sqr(v.y - w.y);
    }
    function distToSegmentSquared(p: Point, v: Point, w: Point) {
      var l2 = dist2(v, w);
      if (l2 == 0) return dist2(p, v);
      var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p: Point, v: Point, w: Point) {
      return Math.sqrt(distToSegmentSquared(p, v, w));
    }
    return distToSegment(toPoint(point), toPoint(seg1), toPoint(seg2));
  }
}
