dima.component('canvasRenderable', function () {

  var canvasRenderableComponent = function () {
    this.asset = 'assets/placeholder.png';
    this.blendingMode = BLENDING_MODE.NORMAL;
    this.scale = 1;
    this.scaleX = 1;
    this.scaleY = 1;
  };

  return canvasRenderableComponent;
});

dima.system('canvas', function () {
  return {
    requires: ['canvasRenderable', 'transform'],
    process: function (collection) {

    }
  };
});