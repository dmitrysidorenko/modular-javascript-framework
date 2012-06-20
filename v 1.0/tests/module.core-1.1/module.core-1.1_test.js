/**
 * Created by JetBrains WebStorm.
 * User: Dmytriy.Sidorenko
 * Date: 07.06.12
 * Time: 11:20
 * To change this template use File | Settings | File Templates.
 */
var core;
module("CoreClass", {
	setup:function () {
		core = window.__VisualCampaignBuilder__.Core;
	},
	teardown:function () {

	}
});

test("CoreClass.extend() - correct work", function () {
	//arrange
	var extension = {
		someNewFunction:function () {
			return 1
		},
		startModule:{}
	};

	//act
	__VisualCampaignBuilder__.CoreClass.extendCore(extension);

	//assert
	strictEqual(typeof core.someNewFunction, 'function', 'Core extended with function "someNewFunction"');
	strictEqual(core.someNewFunction(), 1, 'Function "someNewFunction" is a new function');
	strictEqual(typeof core.startModule, 'function', "Function 'startModule' wasn't replaced");
});

module("Core", {
	setup:function () {
		core = window.__VisualCampaignBuilder__.Core;
	},
	teardown:function () {

	}
});
test("Module.core.base has added into one's scope", function () {
	//arrange
	var scope = window.__VisualCampaignBuilder__;

	//assert
	ok(scope.Core, "Core is defined");
});

test("Module.core.base has all required functions and fields", function () {
	//assert
	strictEqual(typeof core.startModule, 'function', "Core has public function startModule");
	strictEqual(typeof core.startAllModules, 'function', "Core has public function startAllModules");
	strictEqual(typeof core.destroyModule, 'function', "Core has public function destroyModule");
	strictEqual(typeof core.destroyAllModules, 'function', "Core has public function destroyAllModules");
	strictEqual(typeof core.createModule, 'function', "Core has public function createModule");
	strictEqual(typeof core._pushModule, 'function', "Core has function pushModule");

	strictEqual(typeof core.jQuery, 'function', "Core has public function 'jQuery'");
	strictEqual(typeof core.log, 'function', "Core has public function log");
	strictEqual(typeof core._modules, 'object', "Core has field '_modules'");
	strictEqual(typeof core._$, 'object', "Core has field '_$'");
});

test("Core.createModule()", function () {
	//arrange
	var wrongModuleConstructor = {},
		correctModuleConstructor = function () {
			this.init = function () {
			};
			this.destroy = function () {
			};
		},
		undefined;

	//act
	core.createModule("wrongModule", wrongModuleConstructor);
	core.createModule("correctModule", correctModuleConstructor);

	//assert
	strictEqual(core._modules["wrongModule"], undefined, "constructor's type is object");
	strictEqual(typeof core._modules["correctModule"], "object", "constructor's type is function");

	//cleanup
	core._modules = {};
});

test("Core.pushModule()", function () {
	//arrange
	var correctModule = {
		moduleId:"module1",
		constructor:function () {
		}
	},
		wrongModule1 = {
			moduleId:{},
			constructor:function () {
			}
		},
		wrongModule2 = {
			moduleId:"module2",
			constructor:{}
		};

	//act
	core._pushModule(correctModule.moduleId, correctModule.constructor);
	core._pushModule(wrongModule1.moduleId, wrongModule1.constructor);
	core._pushModule(wrongModule2.moduleId, wrongModule2.constructor);

	//assert
	strictEqual(typeof core._modules[correctModule.moduleId], "object", "Correct module was pushed to the storage");
	strictEqual(typeof core._modules[wrongModule1.moduleId], "undefined", "Incorrect module wasn't pushed to the storage. First argument must be a string");
	strictEqual(typeof core._modules[wrongModule2.moduleId], "undefined", "Incorrect module wasn't pushed to the storage. Second argument must be a function");

	//cleanup
	core._modules = {};
});

test("Core.startModule() - module without 'init' or 'destroy' functions in its constructor should not be started", function () {
	//arrange
	var module1 = {
		id:"module1ID",
		constructor:function () {
			this.init = function () {
			};
		}
	},
		module2 = {
			id:"module2ID",
			constructor:function () {
				this.destroy = function () {
				};
			}
		};

	//act
	core.createModule(module1.id, module1.constructor);
	core.createModule(module2.id, module2.constructor);
	core.startModule(module1.id);
	core.startModule(module2.id);

	//assert
	strictEqual(core._modules[module1.id].instance, null, "module has not destroy method");
	strictEqual(core._modules[module2.id].instance, null, "module has not init method");

	//cleanup
	mmm = core._modules;
	core._modules = {};
});

test("Core.startModule() - should be created instance of the correct module", function () {
	//arrange
	var m = {
		id:"moduleID",
		constructor:function () {
			this.init = function () {
			};
			this.destroy = function () {
			};
		}
	};

	//act
	console.log("--------------------------------------");
	core.createModule(m.id, m.constructor);
	core.startModule(m.id);

	//assert
	strictEqual(typeof core._modules[m.id].instance, "object", "new instance of the module was created and saved")

	//cleanup
	core._modules = {};
});

asyncTest("Core.startModule() - should b called module's function 'init'", function () {
	//arrange
	var module = {
		id:"moduleID",
		constructor:function () {
			this.init = function () {
				//assert
				ok(true, "module was started");
				start();
			};
			this.destroy = function () {
			};
		}
	};

	//act
	core.createModule(module.id, module.constructor);
	core.startModule(module.id);

	//cleanup
	core._modules = {};
});
