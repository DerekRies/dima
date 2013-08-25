'use strict';
var EntityComponentManager = function () {
  this.table = [];
  this.componentMap = {}; // lookup a component and get its definition
  this.componentEnum = {}; // convert component into an index in the table
  this.componentPool = [];
  this.entityPool = [];
  this.queryCache = {};
  this.entityCounter = 0;
  // Assemblages are like templates of entities, just functions to keep things DRY
  this.entityAssemblages = {};
};

EntityComponentManager.prototype.createEntity = function(assemblage) {
  var e = this.entityPool.pop() || this.entityCounter++;
  if(typeof assemblage !== 'string') {
    return e;
  }
  else {
    if(this.entityAssemblages.hasOwnProperty(assemblage)) {
      this.entityAssemblages[assemblage](e);
    }
  }
};

EntityComponentManager.prototype.destroyEntity = function(entity) {
  // Easiest just to delete the entire cache, as entities can have many
  // components. In the future would like to more intelligently invalidate
  // the cache.
  for (var i = this.table.length; i-- ; ){
    if(this.table[i][entity] !== undefined){
      this.componentPool[i].push(this.table[i].splice(entity,1,undefined)[0]);
    }
  }
  this.entityPool.push(entity);
  this.queryCache = {};
};

EntityComponentManager.prototype.defineAssemblage = function(name, fn) {
  this.entityAssemblages[name] = fn;
};

EntityComponentManager.prototype.attachComponentTo = function(componentType, entity) {
  // TODO: Invalidate caches where possible
  if(typeof this.componentMap[componentType] !== 'undefined'){
    if(this.componentPool[this.componentEnum[componentType]].length > 0) {
      // Reuse old component, but reset its state.
      var component = this.componentPool[this.componentEnum[componentType]].pop();
      this.componentMap[componentType].call(component);
      this.table[this.componentEnum[componentType]][entity] = component;
    }
    else {
      this.table[this.componentEnum[componentType]][entity] = new this.componentMap[componentType]();
    }
    this.clearSystemCacheForComponent(componentType);
    return this.table[this.componentEnum[componentType]][entity];
  }
  else {
    throw new Error('Component of type: ' + componentType + ' is undefined');
  }
};

EntityComponentManager.prototype.removeComponentFrom =  function(componentType, entity) {
  this.componentPool[this.componentEnum[componentType]].push(this.table[this.componentEnum[componentType]].splice(entity,1,undefined)[0]);
  this.clearSystemCacheForComponent(componentType);
};

EntityComponentManager.prototype.getComponent = function(componentType, entity) {
  return this.table[this.componentEnum[componentType]][entity];
};

EntityComponentManager.prototype.getComponents = function(entity) {
  var collection = [];
  for(var i = 0 ; i < this.table.length ; i++) {
    if(this.table[i][entity] !== undefined) {
      collection.push(this.table[i][entity]);
    }
  }
  return collection;
};

EntityComponentManager.prototype.defineComponent = function(componentType, data) {
  var columnIndex = this.table.push([]) - 1;
  this.componentPool.push([]);
  this.componentEnum[componentType] = columnIndex;
  this.componentMap[componentType] = data();
  this.componentMap[componentType].prototype.type = componentType;
};

EntityComponentManager.prototype.clearSystemCacheForComponent = function(componentType) {
  // TODO: Needs to clear the cache for any systems that require this
  // component type.
  this.queryCache = {};
};

EntityComponentManager.prototype.query = function(dependencies, key) {
  // This method should return a collection of entities
  // (not really entities but all their components) that have the components
  // being queried for. ex: 'transform','velocity' should return
  // a collection of entities with both transform AND velocity.

  // loop through all the entities of the componentTypes declared in the dependencies
  // and loop through all the entities (rows) to see if they are not undefined
  // if all the dependencies have some data, add all of them to the returned collection
  if(key in this.queryCache) {
    return this.queryCache[key];
  }
  var collection = [];
  for(var i = 0; i < this.entityCounter ; i++){
    for(var j = 0; j < dependencies.length ; j++){
      if(dependencies[j] !== undefined) {
        if(this.table[this.componentEnum[dependencies[j]]][i] !== undefined){
          if(j === dependencies.length - 1){ // add entity's components to collection
            for(var x = 0; x < dependencies.length ; x++){
              collection.push(this.table[this.componentEnum[dependencies[x]]][i]);
            }
          }
        }
        else {
          break;
        }
      }
      else {
        // Queried for a component that does not exist.
        throw new Error('Component of type: ' + dependencies[j] + ' is undefined');
      }
    }
  }
  this.queryCache[key] = collection;
  return this.queryCache[key];
};
window.EntityComponentManager = EntityComponentManager;