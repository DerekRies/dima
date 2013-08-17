'use strict';
(function () {

  var EntityComponentManager = function () {
    this.table = [];
    this.componentMap = {}; // lookup a component and get its definition
    this.componentEnum = {}; // convert component into an index in the table
    this.componentPool = [];
    this.entityPool = [];
    this.queryCache = {};
    this.entityCounter = 0;
  };

  EntityComponentManager.prototype.createEntity = function(assemblage) {
    if(typeof assemblage !== 'string') {
      // naive implementation is to just continuously incrementing the counter
      // another idea is to reuse the numbers (ids) of previously deleted entities before incrementing. But is this even worth it? Have to remember which numbers were deleted and then check if we can reuse numbers before falling back to incrementing. If done with naive implementation then it is likely there will be some array resizing concerns in the javascript jits.
      return this.entityPool.pop() || this.entityCounter++;
    }
    else {
      // window.console.log('create entity from assemblage');
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

  EntityComponentManager.prototype.attachComponentTo = function(componentType, entity) {
    // TODO: Invalidate caches where possible
    if(typeof this.componentMap[componentType] !== 'undefined'){
      if(this.componentPool[this.componentEnum[componentType]].length > 0) {
        this.table[this.componentEnum[componentType]][entity] = this.componentPool[this.componentEnum[componentType]].pop();
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
            if(j === dependencies.length - 1){
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

  var dima = {

    activeSystems: [],
    definedSystems: {},

    game: function (canvas, fn) {
      this.ctx = canvas.getContext('2d');
      // the fn should probably be called once the entire process is bootstrapped
      fn();
    },

    getContext: function () {
      return this.ctx;
    },

    system: function (name, fn) {
      this.definedSystems[name] = fn();
      if( typeof this.definedSystems[name].requires === 'undefined'){
        throw new Error('System missing a requires field with component dependencies');
      }
      if( typeof this.definedSystems[name].systemType === 'undefined') {
        this.definedSystems[name].systemType = name;
      }
      this.definedSystems[name].requiresString = this.definedSystems[name].requires.toString();
      return this;
    },

    addSystem: function (systemType) {
      this.activeSystems.push(this.definedSystems[systemType]);
      return this;
    },

    removeSystem: function (systemType) {
      this.activeSystems.splice(this.activeSystems.indexOf(this.definedSystems[systemType]));
    },

    resetSystemQueryCache: function (system) {
      var key = this.definedSystems[system].requires.toString();
      delete this.ecManager.queryCache[key];
      return this;
    },

    component: function (componentType, data) {
      this.ecManager.defineComponent(componentType, data);
      return this;
    },

    update: function () {
      var collectionInjection;
      for(var i = 0, l = this.activeSystems.length ; i < l ; i++) {
        collectionInjection = this.ecManager.query(this.activeSystems[i].requires, this.activeSystems[i].requiresString);
        if(typeof collectionInjection !== 'undefined'){
          this.activeSystems[i].process(collectionInjection);
        }
      }
    },


    // Generic Interface methods

    attachComponentTo: function (componentType, entity) {
      return this.ecManager.attachComponentTo(componentType, entity);
    },

    removeComponentFrom: function (componentType, entity) {
      return this.ecManager.removeComponentFrom(componentType, entity);
    },

    getComponent: function (componentType, entity) {
      return this.ecManager.getComponent(componentType, entity);
    },

    createEntity: function (assemblage) {
      return this.ecManager.createEntity(assemblage);
    },

    destroyEntity: function (entity) {
      return this.ecManager.destroyEntity(entity);
    },

    reset: function () {
      // this function is for testing purposes only to reset the entirety of dima
      this.activeSystems = [];
      this.definedSystems = {};
      this.ecManager = new EntityComponentManager();
      console.log('resetting dima state');
      this.testInfo();
    },

    testInfo: function () {
      console.log('-------------------');
      console.log('DEFINED SYSTEMS:');
      for(var sys in this.definedSystems) {
        console.log(sys);
      }
      console.log('-------------------');
      console.log('ACTIVE SYSTEMS:');
      this.activeSystems.forEach(function(system) {
        console.log(system);
      });
      console.log('-------------------');
      console.log('COMPONENTS');
      for(var i = 0 ; i < this.ecManager.table.length ; i++) {
        for(var j = 0 ; j < this.ecManager.table[i].length ; j++) {
          if(typeof this.ecManager.table[i][j] === 'undefined'){
            console.log('no component');
          }
          else {
            console.log(this.ecManager.table[i][j].type);
          }
        }
      }
      console.log('-------------------');
    }
  };

  dima.ecManager = new EntityComponentManager();
  window.dima = dima;

})();