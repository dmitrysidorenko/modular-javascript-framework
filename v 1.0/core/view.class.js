/**
 * Created with JetBrains WebStorm.
 * Author: Dmitry Sidorenko
 * Date: 6/12/12
 * Time: 12:13 AM
 * To change this template use File | Settings | File Templates.
 */
(function(){
    var scope = window.MJF || (window.MJF = {});

    var ViewClass = function(){
        this._actions = {};
    };
    ViewClass.prototype = {
        bind : function(action, handler){
            if(typeof action == 'string' && typeof handler == 'function'){
                (this._actions[action] = this._actions[action] || []).push(handler);
            }
            return this;
        },
        ignore : function(action, handler){
            var actions = this._actions;
            if(typeof action == 'string' && actions){
                if(!handler){
                    actions[action] = [];
                }else{
                    if(handler in actions[action]){
                        actions[action].splice(actions.indexOf(handler), 1);
                    }
                }
            }
            return this;
        },
        trigger : function(action, data){
            if(typeof action == "string" && typeof this._actions[action] == 'array' && this._actions[action].length > 0){
                for(var i = 0, l = this._actions.length; i < l; i++){
                    if(typeof this._actions[action][i] == 'function'){
                        this._actions[action][i](data)
                    }
                }
            }
            return this;
        }
    };
}());