'use strict';

var dima = window.dima;
// dima.reset();


describe('System Creation', function () {

  dima.system('SystemTestSystem', function () {
    return {
      requires: [],
      process: function (collection) {}
    };
  });

  dima.system('DecoySystem', function () {
    return {
      requires: [],
      process: function (collection) {}
    };
  });

  var size = dima.activeSystems.length;

  it('should add new systems to definition dictionary', function () {
    expect(dima.definedSystems['SystemTestSystem']).not.toEqual(null);
  });

  it('should increase the size of the active systems when adding systems', function () {
    dima.addSystem('SystemTestSystem');
    expect(dima.activeSystems.length).toEqual(size + 1);
  });

  it('should decrease size of the active systems when removing systems', function () {
    dima.removeSystem('SystemTestSystem');
    expect(dima.activeSystems.length).toEqual(size);
  });

  it('should make sure the correct system is removed', function () {
    var found = false;
    dima.addSystem('SystemTestSystem');
    dima.addSystem('DecoySystem');
    dima.removeSystem('SystemTestSystem');
    for(var i = 0; i < dima.activeSystems.length ; i++){
      if(dima.activeSystems[i].systemType === 'SystemTestSystem') {
        found = true;
      }
    }
    expect(found).toBe(false);
  });


});