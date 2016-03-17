module.exports ={
   debug:function(title, obj){
    if(process.env.DEBUG) console.log('\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n', title, '\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n', obj, '\n===========================================\n\n');
  }

}
