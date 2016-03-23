"use strict";
module.exports = function(){
  function _debug(title, obj){
    if(process.env.DEBUG) console.log('\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n', title, '\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n', obj, '\n===========================================\n\n');
  }
  // FIXME: Need to fix dynamic flash messages
  function _setMsg(app,userId, message,route,msgType,userType){

    app.locals[userId][userType] = message;
    console.log('APP LOCALS After',app.locals);
  }

  function _unsetMsg(app,userId,route,msgType){
      app.locals[userId][route][msgType] = null;
  }

  function _getMsg(app,userId,route,msgType){
    console.log(userId);
    if (app.locals[userId][route][msgType]) {
      
      return app.locals[userId][route][msgType];
    }
    else {

      return '';
    }
  }

  return {
    setMsg: _setMsg,
    debug: _debug,
    unsetMsg: _unsetMsg,
    getMsg:_getMsg
  }
}();
