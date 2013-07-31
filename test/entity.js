'use strict';

describe('Entity Creation', function () {

  var entity = dima.createEntity();
  var secondEntity = dima.createEntity();

  it('should return an incremented id', function (){
    expect(entity).toEqual(0);
    expect(secondEntity).toEqual(1);
  });

});

