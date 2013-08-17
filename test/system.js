'use strict';


describe('System Creation', function () {

  var dima = window.dima;

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


  dima.component('queryTestOne', function () {
    var queryTestOneComponent = function () {
      this.one = 0;
    };
    return queryTestOneComponent;
  });

  dima.component('queryTestTwo', function () {
    var queryTestTwoComponent = function () {
      this.two = 0;
    };
    return queryTestTwoComponent;
  });

  dima.component('queryTestThree', function () {
    var queryTestThreeComponent = function () {
      this.two = 0;
    };
    return queryTestThreeComponent;
  });

  it('should add new systems to definition dictionary', function () {
    expect(dima.definedSystems['SystemTestSystem']).not.toEqual(null);
  });

  var size = dima.activeSystems.length;
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

  it('should return the correct collection of components when querying', function () {
    var testEntity = dima.createEntity();
    var secondTestEntity = dima.createEntity();
    dima.attachComponentTo('queryTestOne', testEntity);
    dima.attachComponentTo('queryTestTwo', testEntity);

    dima.attachComponentTo('queryTestOne', secondTestEntity);

    var firstQuery = ['queryTestOne', 'queryTestTwo'];
    var secondQuery = ['queryTestOne'];
    var thirdQuery = ['queryTestTwo'];

    var collection = dima.ecManager.query(firstQuery, firstQuery.toString());
    expect(collection.length).toEqual(2);
    // console.log(collection);

    var secondCollection = dima.ecManager.query(secondQuery, secondQuery.toString());
    expect(secondCollection.length).toEqual(2);
    // console.log(secondCollection);

    var thirdCollection = dima.ecManager.query(thirdQuery, thirdQuery.toString());
    expect(thirdCollection.length).toEqual(1);
    // console.log(thirdCollection);



  });


});