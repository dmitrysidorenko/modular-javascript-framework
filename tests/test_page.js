/**
 * Created with JetBrains WebStorm.
 * User: SEA
 * Date: 6/20/12
 * Time: 12:44 AM
 * To change this template use File | Settings | File Templates.
 */
jQuery(function(){
    var logModuleName = "log";
    var newsModuleName = "news";
    MJF.Core.createModule(logModuleName, function(sandbox){
        var module = new MJF.ModuleClass(logModuleName, sandbox, ["New"]);
        sandbox.bind([{
            "New" : onNew
        }]);
        function onNew(e, d){
            sandbox.log(1, d);
        }
        return module;
    });

    MJF.Core.createModule(newsModuleName, function(sandbox){
        var module = new MJF.ModuleClass(newsModuleName, sandbox);

        module.init = function(){
//            setInterval(function(){
                sandbox.trigger([{type : "New", data : "new : " + new Date().getTime()}]);
//            }, 5000);
        }

        return module;
    });

    MJF.Core.startModule(logModuleName);
    MJF.Core.startModule(newsModuleName);
});