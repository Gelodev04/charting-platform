import { registerFigure, utils } from "klinecharts";

let registered = false;

/**
 * Replaces klinecharts' rect figure with round line caps/joins and high-quality
 * smoothing so candle strokes look less aliased (no corner rounding).
 */
function register() {
  if (registered) return;
  registered = true;
  registerFigure({
    name: "rect",
    checkEventOn: utils.checkCoordinateOnRect,
    draw(ctx, attrs, styles) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      try {
        utils.drawRect(ctx, attrs, styles);
      } finally {
        ctx.restore();
      }
    },
  });
}

register();
