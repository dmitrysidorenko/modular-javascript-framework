(function (scope) {
	function is_arr(obj) {
		return Object.prototype.toString.call(obj) == '[object Array]';
	}

	function is_obj(obj) {
		return obj === Object(obj);
	}

	/**
	 * Model Object
	 */
	var Model = (function () {
		"use strict";

		// save link to this

		function Model() {
			var self = this;
			self.errors = null;

			// collection of attributes
			self.attributes = {};

			if (arguments.length > 0 && typeof arguments[0] === "object") {
				self.parseJSON(arguments[0]);
			}
		}

		/**
		 * For using custom validation logic the function `validate(attributes)` should be exists
		 * if error occure it should return something (error descripton), if not - should return nothing (undefined)
		 *
		 * @param attributes
		 *
		 * @return true or false
		 */
		function _validate(attributes) {
			var self = this;
			self.errors = null;
			if (!self.validate) return true;

			var errors = self.validate(attributes);
			if (!errors) return true;

			self.errors = errors;
			return false;
		}

		/**
		 * checks if current attributes is valid
		 *
		 * @return true or false
		 */
		Model.prototype.isValid = function () {
			return _validate(this.attributes);
		};


		/**
		 * Set certain attribute name => value
		 *
		 * @param name String   key
		 * @param value Object  object that associate with key
		 *
		 * @return true or false
		 */
		Model.prototype.set = function (name, value) {
			var attrs = {}, self = this;
			attrs[name] = value;
			if (!_validate.call(self, attrs)) return false;

			if (!self.attributes) self.attributes = {};
			self.attributes[name] = value;
			return true;
		};

		/**
		 * Update (force rewrite) all attributes in model
		 *
		 * @param attrs JSON Object (ex. {attr:value, attr1:value1, attr2:alue2})
		 *
		 */
		Model.prototype.update = function (attrs) {
			var p,
				self = this;
			if (typeof attrs === "object") {
				for (p in attrs) if (attrs.hasOwnProperty(p) && p != "id") {
					self.set(p, attrs[p]);
				}
			}
		};

		/**
		 * Get attribute by name
		 *
		 * @param name String
		 *
		 * @return value by key
		 */
		Model.prototype.get = function (name) {
			var attr = this.attributes ? this.attributes[name] : null;
			return attr;
		};

		/**
		 * @return new instance of a Model with attributes of current model
		 */
		Model.prototype.clone = function () {
			var clone = new this.constructor();
			return clone.parseJSON(this.toJSON());
		};

		/**
		 * Transform json to internal model's attributes representation
		 *
		 * @param json(JSON string)
		 *
		 * @return this
		 */
		Model.prototype.parseJSON = function (json) {
			var self = this, key;
			if (json && typeof json === "object") {
				for (key in json) {
					if (json.hasOwnProperty(key)) {
						self.set(key, json[key]);
					}
				}
			} else {
				__VisualCampaignBuilder__.Core.log(1, "[Model::parse] argument `json` is incorrect");
			}
			return self;
		};

		/**
		 * Transform object model to json object
		 *
		 * @return Object   attributes
		 */
		Model.prototype.toJSON = function () {
			var json = {}, self = this;

			function clone_json(original) {
				var p,
					value,
					res = (is_arr(original) ? [] : {});
				if (original && original.toJSON) {
					res = original.toJSON();
				}
				else {
					for (p in original) if (original.hasOwnProperty(p)) {
						if (is_obj(original[p]) || is_arr(original[p])) {
							value = clone_json(original[p]);
						}
						else {
							value = original[p];
						}
						is_arr(res) ? res.push(value) : res[p] = value;
					}
				}
				return res;
			}

			json = clone_json(self.attributes);

			return json;
		};

		/**
		 * Remove attribute from model
		 *
		 * @param attrName String    attribute name
		 */
		Model.prototype.removeAttr = function (attrName) {
			delete this.attributes[attrName];
		};

		return Model;
	}());

	function copy_proto_methods(from, to) {
		for (var p in from.prototype) if (from.prototype.hasOwnProperty(p)) to.prototype[p] = from.prototype[p];
		return to;
	}

	function Variant() {
	}

	Variant = copy_proto_methods(Model, Variant);
	Variant.prototype.validate = function (attributes) {
	};


	/**
	 * Collection of Model objects
	 */
	var Collection = (function () {
		"use strict";

		/**
		 * Collection of models
		 */
		function Collection() {
			var self = this;
			self.models = [];

			//Create Collection from JSON
			if (arguments.length > 0 && typeof arguments[0] === "object") {
				self.parseJSON(arguments[0]);
			}
		}

		Collection.prototype.last = function () {
			return (this.models.length > 0 ? this.models[this.models.length - 1] : null);
		};

		Collection.prototype.first = function () {
			return this.models.length > 0 ? this.models[0] : null;
		};

		/**
		 * Add model object into collection, to the end
		 *
		 * @param model __VisualCampaignBuilder__.Model   model
		 *
		 * @return true or false
		 */
		Collection.prototype.push = function (model) {
			var self = this;
			self.ModelObject || (self.ModelObject = Model);
			if (model /*&& model instanceof self.ModelObject*/ /*&& !self.get(model.get("id"))*/) {
				self.models.push(model);
				return true;
			}
			return false;
		};

		/**
		 * Get certain model by id
		 *
		 * @param model_id Number       model id
		 *
		 * @return model object from collection by id
		 */
		Collection.prototype.get = function (model_id) {
			var i = 0, self = this;
			for (i = 0; i < self.models.length; i++) {
				if (self.models[i].get("id") === model_id) {
					return self.models[i];
				}
			}
			return null;
		};

		/**
		 * Get model object from collection by it index in collection
		 *
		 * @param ind Number    model's index in collection
		 *
		 * @return model object from collection by index
		 */
		Collection.prototype.at = function (ind) {
			return this.models[ind];
		};

		/**
		 * Remove model object from collection by id
		 *
		 * @param model_id Number   model's id
		 *
		 * @return Array of models after remove model from it
		 */
		Collection.prototype.remove = function (model_id) {
			var self = this;
			if (model_id) {
				for (var ind in self.models) if (self.models[ind].get("id") === model_id) return self.models.splice(ind, 1)[0];
			}
			return null;
		};

		/**
		 * @return Array of __VisualCampaignBuilder__.Models
		 */
		Collection.prototype.toArray = function () {
			var res = [];
			for (var i = 0; i < this.models.length; i++) res.push(this.models[i]);
			return res;
		};

		/**
		 * Convert Collection Object to JSON Object
		 *
		 * @return Array of Objects
		 */
		Collection.prototype.toJSON = function () {
			var res = [], self = this;
			for (var i = 0; i < self.models.length; i++) (function (i) {
				res.push(self.models[i].toJSON());
			}(i));
			return res;
		};

		/**
		 * @param json String
		 * @param ModelObject Constructor   type of model. __VisualCampaignBuilder__.Model by default
		 *
		 * @return (some Model)
		 */
		Collection.prototype.parseJSON = function (json, ModelObject) {
			var self = this;
			if (json && typeof json === "object") {
				ModelObject = ModelObject || Model;
				for (var p in json) if (json.hasOwnProperty(p)) {
					//(function(json) {self.push(new ModelObject(json));})(json[p]);
					self.push(new ModelObject(json[p]));
				}
			}
			return self;
		};

		/**
		 * @return Number of Models in this Collection
		 */
		Collection.prototype.size = function () {
			return this.models.length;
		};

		/**
		 * Sort collection by attr key
		 *
		 * @param attr - string key
		 * @return this collection sorted by attr
		 */
		Collection.prototype.sort = function (attr, isAscending) {
			if (typeof Array.prototype.sort == 'function') {
				this.models.sort(function (a, b) {
					return (isAscending ? a : b).get(attr) - (isAscending ? b : a).get(attr)
				});
			}
			return this;
		};


		return Collection;

	}());

	scope.MJF = scope.__VisualCampaignBuilder__ || (scope.__VisualCampaignBuilder__ = {});
	scope.MJF.Model = Model;
	scope.MJF.Variant = Variant;
	scope.MJF.Collection = Collection;
}(window));
