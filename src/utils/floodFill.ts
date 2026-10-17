/**
 * Flood fill algorithm for the paint bucket tool on HTML5 Canvas
 */

function hexToRgba(hex: string): [number, number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance = 32
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  startX = Math.floor(startX);
  startY = Math.floor(startY);

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const targetIdx = (startY * width + startX) * 4;
  const targetR = data[targetIdx];
  const targetG = data[targetIdx + 1];
  const targetB = data[targetIdx + 2];
  const targetA = data[targetIdx + 3];

  const [fillR, fillG, fillB, fillA] = hexToRgba(fillColorHex);

  // If clicking on color already equal to fill color
  if (
    Math.abs(targetR - fillR) <= tolerance &&
    Math.abs(targetG - fillG) <= tolerance &&
    Math.abs(targetB - fillB) <= tolerance &&
    Math.abs(targetA - fillA) <= tolerance
  ) {
    return;
  }

  function matches(index: number) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];
    return (
      Math.abs(r - targetR) <= tolerance &&
      Math.abs(g - targetG) <= tolerance &&
      Math.abs(b - targetB) <= tolerance &&
      Math.abs(a - targetA) <= tolerance
    );
  }

  const queue: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const pixelIdx = (y * width + x);

    if (visited[pixelIdx]) continue;
    visited[pixelIdx] = 1;

    const dataIdx = pixelIdx * 4;
    if (!matches(dataIdx)) continue;

    data[dataIdx] = fillR;
    data[dataIdx + 1] = fillG;
    data[dataIdx + 2] = fillB;
    data[dataIdx + 3] = fillA;

    if (x > 0 && !visited[pixelIdx - 1]) queue.push([x - 1, y]);
    if (x < width - 1 && !visited[pixelIdx + 1]) queue.push([x + 1, y]);
    if (y > 0 && !visited[pixelIdx - width]) queue.push([x, y - 1]);
    if (y < height - 1 && !visited[pixelIdx + width]) queue.push([x, y + 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}
