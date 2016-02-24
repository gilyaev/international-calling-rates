"use strict";
/**
 * ModelView
 */
(function (factory) {
    var scope = (typeof self == 'object' && self.self === self && self) ||
        (typeof global == 'object' && global.global === global && global);

    scope.BikeJS = factory(scope, {}, $$);

})(function (scope, BikeJS, $) {

    var Utils = BikeJS.Utils = {},
        JsonP = BikeJS.JsonP = {},
        Model = BikeJS.Model = {},
        Collection = BikeJS.Collection = {},
        View = BikeJS.View = {},

        _isUndefined = function (obj) {
            return obj === void 0;
        },

        _extend = function (keyFn, override) {
            override = override === void 0 ? true : override;
            return function (obj) {
                var length = arguments.length;
                for (var index = 1; index < length; index++) {
                    var source = arguments[index],
                        keys = keyFn(source),
                        keysLength = keys.length;

                    for (var i = 0; i < keysLength; i++) {
                        var key = keys[i];
                        if (override || obj[key] === void 0) {
                            obj[key] = source[key];
                        }
                    }
                }

                return obj;
            }
        },

        throwError = function (message) {
            throw new Error(message);
        },

        extend = function (properties) {
            var parent = this,
                child,
                Surrogate;

            if (properties !== void 0 && properties.hasOwnProperty('constructor')) {
                child = properties.constructor
            } else {
                child = function () {
                    return parent.apply(this, arguments)
                }
            }

            BikeJS.Utils.extend(child, parent);

            Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            if (properties !== void 0) {
                BikeJS.Utils.extend(child.prototype, properties, true);
            }

            child.__parent__ = parent.prototype;

            return child;
        };

    Utils.getKeys = function (obj) {
        var keys = [],
            type = typeof obj,
            isObject = (type == 'function' || type === 'object' && !!obj);

        if (!isObject) {
            return [];
        }

        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    };

    Utils.isArray = function (obj) {
        return Array.isArray(obj) || toString.call(obj) === '[object Array]';
    }

    Utils.extend = _extend(Utils.getKeys);

    JsonP.isValidResponse = function () {
        return true;
    };

    JsonP.CallbackRegistry = {};

    JsonP.request = function (url, onSuccess, onError) {
        var scriptOk = false;
        var callbackName = 'cb' + String(Math.random()).slice(-6);

        url += ~url.indexOf('?') ? '&' : '?';
        url += 'callback=BikeJS.JsonP.CallbackRegistry.' + callbackName;
        JsonP.CallbackRegistry[callbackName] = function (data) {
            scriptOk = JsonP.isValidResponse(data);
            delete JsonP.CallbackRegistry[callbackName];
            if (scriptOk) onSuccess(data);
        };

        function checkCallback() {
            if (scriptOk) return;
            delete JsonP.CallbackRegistry[callbackName];
            onError(url);
        }

        var script = document.createElement('script');
        script.onreadystatechange = function () {
            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                this.onreadystatechange = null;
                setTimeout(checkCallback, 0);
            }
        }

        script.onload = script.onerror = checkCallback;
        script.src = url;
        document.body.appendChild(script);
    }

    /*************Collection declaration*******************/
    Collection = BikeJS.Collection = function (options) {
        options = options || {};
        if (options.model !== void 0) this.model = options.model;
        this.models = [],
            this.init.apply(this, arguments);
    }

    Utils.extend(Collection.prototype, {
        init: function () {
        },
        model: Model,
        url: function () {
        },
        parse: function (data) {
            return data;
        },
        set: function (models, options) {
            var length,
                model,
                self = this,
                attrs;

            this.models = [];

            if (models === null || models === void 0) return;
            models = !Utils.isArray(models) ? [models] : models.slice();
            length = models.length;

            for (var i = 0; i < length; i++) {
                attrs = models[i];
                model = self._createModel(attrs);
                this.models.push(model);
            }

            return this.models;
        },

        each: function (cb) {
            var models = this.models,
                lenght = models.length,
                model;

            if (typeof cb !== 'function') {
                throwError('The cb parameter must be function');
            }

            for (var i = 0; i < lenght; i++) {
                var model = models[i];
                cb.call(model);
            }
        },

        fetch: function (options) {
            var self = this, data,
                options = options || {},
                params = {};

            if (options['params'] !== void 0) {
                params = options['params'];
            }

            if (this.url === void 0) {
                throwError('The url function must be specified');
            }

            BikeJS.JsonP.request(this.url(params), function (response) {
                var models = self.parse(response),
                    success = options.success;

                if (!self.set(models)) return false;
                if (typeof success === 'function') {
                    success.call(self, response, models);
                }
            }, function () {
                var error = options.error;
                if (typeof error === 'function') {
                    error.call(self);
                }
            });
        },

        _createModel: function (attrs) {
            var model = new this.model(attrs);
            return model;
        }
    });


    /*************Model declaration*******************/
    Model = BikeJS.Model = function (attributes, options) {
        var attrs = attributes || {};
        this.attributes = BikeJS.Utils.extend({}, attrs);
        this.init.apply(this, arguments);
    };

    Utils.extend(Model.prototype, {
        init: function () {
        },

        url: function (params) {

        },

        parse: function (data) {
            return data;
        },

        get: function (attr, defaultValue) {
            defaultValue = (defaultValue === void 0) ? null : defaultValue;
            return this.attributes[attr] !== void 0 ? this.attributes[attr] : defaultValue;
        },

        set: function (attrs) {
            this.attributes = attrs;
            return true;
        },

        fetch: function (options) {
            var self = this, data,
                options = options || {},
                params = {};

            if (options['params'] !== void 0) {
                params = options['params'];
            }

            if (this.url === void 0) {
                throwError('The url function must be specified');
            }

            BikeJS.JsonP.request(this.url(params), function (response) {
                var models = self.parse(response),
                    success = options.success;

                if (!self.set(models)) return false;
                if (typeof success === 'function') {
                    success.call(self, response, models);
                }
            }, function () {
                var error = options.error;
                if (typeof error === 'function') {
                    error.call(self);
                }
            });
        }
    });

    /*************View declaration*******************/
    View = BikeJS.View = function (options) {
        this._initElement()
        this.init.apply(this, arguments);
    };


    Utils.extend(View.prototype, {
        id: null,
        events: {},

        delegateEvents: function (events) {
            var eventsPattern = /^(\S+)\s*(.*)$/,
                match,
                method;

            events || (events = this.events);
            if (!events) {
                return true;
            }

            for (var key in events) {
                method = events[key];

                if (typeof method !== 'function') {
                    method = this[method]
                }

                if (method === void 0) {
                    continue;
                }

                match = key.match(eventsPattern);
                this.delegateEvent(match[1], match[2], method.bind(this));
            }
        },


        delegateEvent: function (event, selector, listener) {
            this.$el.find(selector).on(event, listener);
        },

        init: function () {
        },

        _initElement: function () {
            if (this.id === null) {
                throwError('The id of View container must be specified');
            }

            this.$el = $('#' + this.id);
            if (this.$el.length < 1) {
                throwError('The container with id #' + this.id + ' not found');
            }

            this.el = this.$el._e[0];
            this.delegateEvents();
        }
    });

    Model.extend = Collection.extend = View.extend = extend;

    return BikeJS;
});

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}