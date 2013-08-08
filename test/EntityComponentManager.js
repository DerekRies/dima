'use strict';

var dima = window.dima;
dima.reset();

dima.component('transform', function () {
  var transformComponent = function () {
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
  };
  transformComponent.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
  };
  return transformComponent;
});

dima.component('velocity', function () {
  var velocityComponent = function () {
    this.x = 0;
    this.y = 0;
  };
  velocityComponent.prototype.set = function(x,y) {
    this.x = x;
    this.y = y;
  };
  return velocityComponent;
});
// console.log(dima.ecManager.componentMap);

describe('Entity Management', function () {


  var entity = dima.createEntity();
  var secondEntity = dima.createEntity();
  var thirdEntity = dima.createEntity();


  it('should return an incremented id on creation', function (){
    expect(entity).toEqual(0);
    expect(secondEntity).toEqual(1);
  });

  it('should create a component definition', function () {
    // console.log(dima.ecManager.componentMap);
  });

  it('should attach a component to an entity', function () {
    dima.attachComponentTo('transform', entity)
      .setPosition(100, 100);
    expect(dima.ecManager.table[dima.ecManager.componentEnum.transform][entity]).not.toEqual(undefined);
  });

  it('should delete components from the table when deleting an entity', function () {
    var destroyed = true;
    dima.destroyEntity(entity);
    for(var componentType = 0 ; componentType < dima.ecManager.table.length ; componentType++) {
      destroyed = dima.ecManager.table[componentType][entity] === undefined;
      if (!destroyed) {
        break;
      }
    }
    expect(destroyed).toBe(true);
  });

  it('should remove a component from the table, when removing a component from an entity', function () {
    dima.attachComponentTo('transform', secondEntity)
      .setPosition(300, 300);
    dima.removeComponentFrom('transform', secondEntity);
    expect(dima.ecManager.table[dima.ecManager.componentEnum.transform][secondEntity]).toEqual(undefined);
  });

  it('should add removed components to a pool where they can be recycled', function () {
    dima.attachComponentTo('transform', thirdEntity)
      .setPosition(1337, 1337);
    dima.destroyEntity('transform', thirdEntity);
    // this next component should be recycled and still have the old positions
    var recycledComponent = dima.attachComponentTo('transform', secondEntity);
    expect(recycledComponent.x).toBe(1337);
  });

});
