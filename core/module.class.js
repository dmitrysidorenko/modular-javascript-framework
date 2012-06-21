/**
 * Created with JetBrains WebStorm.
 * Author: Dmitry Sidorenko
 * Date: 6/20/12
 * Time: 1:09 AM
 * To change this template use File | Settings | File Templates.
 */
(function(){
    var scope = window.MJF || (window.MJF = {});
    var ModuleClass = function(moduleID, sandbox){
        this.destroy = function(){};
        this.init = function(){};
    };
    scope.ModuleClass = ModuleClass;
}());