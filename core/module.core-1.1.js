/**
 * Created with JetBrains WebStorm.
 * Author: Dmitry Sidorenko
 * Date: 6/10/12
 * Time: 7:19 PM
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
	var scope = window.MJF || (window.MJF = {}),
		jsonLib = scope.JSON;

	var CoreClass = function () {
		this._modules = {};
		this._jsonLib = jsonLib;
		this._$ = $("<a/>");
		this.debug = true;
	};
	CoreClass.prototype = {
		/**
		 *
		 * @param {String} moduleID
		 * @return {*}
		 */
		startModule:function (moduleID, callback) {
			var m = this._modules[moduleID];
			if (m) {
				if (m.instance && $.isFunction(m.instance.init) && $.isFunction(m.instance.destroy)) {
					this.log(1, "Module '" + moduleID + "' Start : already started");
				}
				else{
					var instance = new m.constructor(new Sandbox(this, moduleID));
					if (instance && $.isFunction(instance.init) && $.isFunction(instance.destroy)) {
						m.instance = instance;
						m.instance.init();
						this.log(1, "Module [" + moduleID + "] Start: successfully started");
						(callback || $.noop)();
					} else {
						this.log(1, "Module '" + moduleID + "' Start : FAILED : instance is undefined or doesn't have init or destroy methods");
					}
				}
			}
			return this;
		},

		/**
		 *
		 * @param {String} moduleID
		 * @param {Function} callback
		 * @return {*}
		 */
		destroyModule:function (moduleID, callback) {
			var m = this._modules[moduleID];
			if (m && m.instance) {
				m.instance.destroy();
				this.log(1, "module [" + moduleID + "] Destroy: successfully stopped");
				m.instance = null;
				(callback || $.noop)();
			} else {
				this.log(1, "Stop Module '" + moduleID + "': FAILED : module does not exist or has not been started");
			}
			return this;
		},

		/**
		 *
		 * @param {String} moduleID
		 * @param {Function} constructor
		 * @return {*}
		 * @private
		 */
		_pushModule:function (moduleID, constructor) {
			if (typeof moduleID == 'string' && $.isFunction(constructor)) {
				this._modules[moduleID] = {
					constructor:constructor,
					instance:null
				};
			}
			return this;
		},

		/**
		 * Creates a new module, caching it to this._modules
		 * @param {String} moduleID
		 * @param {Function} constructor
		 * @return {*}
		 */
		createModule:function(moduleID, constructor){
			if (typeof moduleID === 'string' && typeof constructor === 'function') {
				this._pushModule(moduleID, constructor);
			} else {
				this.log(1, "Module '" + moduleID + "' Registration : FAILED : one or more arguments are of incorrect type");
			}
			return this;
		},

		/**
		 *
		 * @param {Array} events_obj
		 * @param {String} moduleID
		 * @return {*}
		 */
		listenEvents:function (events_obj, moduleID) {
			if (this.utils.is_arr(events_obj)) {
				var e = events_obj, eL = e.length, i = -1;
				while (++i < eL) {
					for (var p in e[i]) if (e[i].hasOwnProperty(p)) {
                        var fn = e[i][p];
                        this.log(1, "<bind> ", p, fn);
                        this._$.bind.apply(this._$, [p, fn]);
					}
				}
			} else {
				this.log(1, "bind events FAILED (MODULE : '" + moduleID + "')");
			}
			return this;
		},

		/**
		 *
		 * @param {Array} events_obj
		 * @param {String} moduleID
		 * @return {*}
		 */
		removeEvents:function (events_obj, moduleID) {
			if (this.utils.is_arr(events_obj)) {
				var e = events_obj, eL = e.length, i = -1;
				while (++i < eL) {
					this._$.unbind.apply(this._$, [e[i]]);
				}
			} else {
				this.log(1, "remove events FAILED (MODULE : '" + moduleID + "')");
			}
			return this;
		},

		/**
		 *
		 * @param {Array} events_obj
		 * @param {String} moduleID
		 * @return {*}
		 */
		triggerEvent:function (events_obj, moduleID) {
			if (this.utils.is_arr(events_obj)) {
				var e = events_obj, eL = e.length, i = -1, event_name = '';
				while (++i < eL) {
//					this.log(1, "trigger events SUCCESS (EVENT : " + events_obj[i].type + ", MODULE : '" + moduleID + "')");
					this._$.trigger.apply(this._$, [e[i].type, e[i].data]);
				}
			} else {
				this.log(1, "trigger events FAILED (MODULE : '" + moduleID + "')");
			}
			return this;
		},

		jQuery:$,

		/**
		 *
		 * @return {*}
		 */
		log:function (type, moduleID) {
			if (typeof console !== 'object' || this.debug === false) return;
			{
				var args = [(moduleID || 'unknown')].concat(Array.prototype.slice.call(arguments, 2, arguments.length));

                if($.browser.msie == true)
                    console[(type === 1) ? 'log' : (type === 2) ? 'warn' : (type === 3) ? 'dir' : 'error'](args);
                else
    				console[(type === 1) ? 'log' : (type === 2) ? 'warn' : (type === 3) ? 'dir' : 'error'].apply(console, args);
			}
			return this;
		},


		/**
		 *
		 */
		utils:{
			/**
			 * Each
			 *
			 * @param obj
			 * @param fn - params: key, item. this = item
			 */
			each:function (obj, fn) {
				fn || (fn = function () {
				});

				// for array
				if (this.utils.is_arr(obj)) {
					for (var i = 0; i < obj.length; i++) {
						var a = fn.call(obj[i], i, obj[i]);
						if (a) return a;
					}
				}

				// for obj
				if (this.utils.is_obj(obj)) {
					for (var key in obj) {
						if (obj.hasOwnProperty(key)) {
							var a = fn.call(obj[key], key, obj[key]);
							if (a) return a;
						}
					}
				}
			},
			/**
			 *
			 * @param arr
			 * @return {*}
			 */
			is_arr:function (arr) {
				return $.isArray(arr);
			},
			/**
			 *
			 * @param obj
			 * @return {*}
			 */
			is_obj:function (obj) {
				return $.isPlainObject(obj);
			},
			/**
			 *
			 * @param obj
			 * @return {*}
			 */
			isEmptyObject:function (obj) {
				return $.isEmptyObject(obj);
			},
			/**
			 *
			 * @param obj
			 * @return {*}
			 */
			clone:function (obj) {
				var self = this;

				function clone(original) {
					var p,
						value,
						res = (self.is_arr(original) ? [] : {});
					for (p in original) if (original.hasOwnProperty(p)) {
						if (self.is_obj(original[p]) || self.is_arr(original[p])) {
							value = clone(original[p]);
						}
						else {
							value = original[p];
						}
						self.is_arr(res) ? res.push(value) : res[p] = value;
					}
					return res;
				}

				return clone(obj);
			},
			/**
			 *
			 */
			reloadPage:function () {
				window.location.assign(window.location);
			},
			json:{
				stringify:jsonLib.stringify,
				parse:jsonLib.parse
			}
		}
	};

	/**
	 * Extends Core's prototype with new functions and fields
	 * @param ext
	 */
	CoreClass.extendCore = function (ext) {
		if (ext) {
			for (var prop in ext) {
				if (ext.hasOwnProperty(prop)) {
					if (!(prop in scope.CoreClass.prototype)) {
						scope.CoreClass.prototype[prop] = ext[prop];
					} else {
						if (typeof console === 'object')
							console[console.error ? 'error' : 'log']("[[Core Extender]] Core already has property '" + prop + "'!");
					}
				}
			}
		}
	};

	var Sandbox = function (core, moduleID) {
        var public = {
            $ : core.jQuery,
            bind : function(arr){return core.listenEvents.call(core, arr, moduleID);},
            trigger : function(arr){return core.triggerEvent.call(core, arr, moduleID);},
            ignore : function(arr){return core.removeEvents.call(core, arr, moduleID);},
            log : function(type){
                var args = [type, (moduleID || 'unknown')].concat(Array.prototype.slice.call(arguments, 1, arguments.length))
                if($.browser.msie == true)
                    core.log(args);
                else
                    core.log.apply(core, args);
            },
            each : function(arr, fn){return core.utils.each.call(core, arr, fn);},
            is_arr : function(obj){
                return core.utils.is_arr(obj)
            }
        };
        return public;
    };

	scope.CoreClass = CoreClass;
	scope.Core = new CoreClass();
}(jQuery));
