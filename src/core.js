'use strict';
var dima = {

  activeSystems: [],
  definedSystems: {},

  game: function (canvas, fn) {
    this.ctx = canvas.getContext('2d');
    // the fn should probably be called once the entire process is bootstrapped
    fn();
  },

  getRenderContext: function () {
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

  assemblage: function (name, fn) {
    return this.ecManager.defineAssemblage(name, fn);
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

  getComponents: function (entity) {
    return this.ecManager.getComponents(entity);
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
    window.console.log('-------------------');
    window.console.log('DEFINED SYSTEMS:');
    for(var sys in this.definedSystems) {
      window.console.log(sys);
    }
    window.console.log('-------------------');
    window.console.log('ACTIVE SYSTEMS:');
    this.activeSystems.forEach(function(system) {
      window.console.log(system);
    });
    window.console.log('-------------------');
    window.console.log('COMPONENTS');
    for(var i = 0 ; i < this.ecManager.table.length ; i++) {
      for(var j = 0 ; j < this.ecManager.table[i].length ; j++) {
        if(typeof this.ecManager.table[i][j] === 'undefined'){
          window.console.log('no component');
        }
        else {
          window.console.log(this.ecManager.table[i][j].type);
        }
      }
    }
    window.console.log('-------------------');
  }
};

dima.ecManager = new EntityComponentManager();
window.dima = dima;
