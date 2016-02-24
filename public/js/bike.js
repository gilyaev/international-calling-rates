"use strict";

(function(factory){
    var scope = (typeof self == 'object' && self.self === self && self) ||
            (typeof global == 'object' && global.global === global && global);

    scope.$$ = factory(scope, {});
    
})(function(scope, $){
    var document = scope.document,
        idExp = /^#([\w-]*)$/,
        isEventSupported = (function(){
            var TAGNAMES = {
              'select':'input','change':'input',
              'submit':'form','reset':'form',
              'error':'img','load':'img','abort':'img'
            }
            function isEventSupported(eventName) {
              var el = document.createElement(TAGNAMES[eventName] || 'div');
              eventName = 'on' + eventName;
              var isSupported = (eventName in el);
              if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
              }
              el = null;
              return isSupported;
            }
            return isEventSupported;
        })();

    $ = function(selector, context) {    
        return new $.fn.init(selector, context);
    };

    $.fn = $.prototype = {
        constructor: $,

        find: function(selector) {
            var length = this.length,
                elements = [],
                elementsLength = 0,
                stack = [],
                el = new $();

            for(var i=0; i < this.length; i++) {
                elements = this._e[i].querySelectorAll(selector);
                elementsLength = elements.length;

                for(var j=0; j < elementsLength; j++) {
                    stack.push(elements[j]);
                }
            }

            el.length = stack.length;
            el.context = this._e[0];
            el.selector = selector;
            el._e = stack;

            return el;
        },

        appendChild: function(child) {
            this._each(function(element) {
                element.appendChild(child);
            });
        },



        html: function(html) {
            var length = this.length;
            if (html !== void 0) {
                for(var i=0; i < length; i++) {
                    this._e[i].innerHTML = html;
                }    
                return this;
            }
            return this;
        },

        on: function(event, listener) {
            if (!isEventSupported(event)) {
                this.error('Event ' + event + ' not supported.');
            }

            if (typeof listener !== 'function' && typeof listener !== 'object') {
                this.error('Listner should be a function. The ' + (typeof listener) + ' was specified.');
            }

            this._each(function(element) {
                if(element.attachEvent !== void listener){
                    element.attachEvent(('on' + event), listener);
                    return;
                }
                element.addEventListener(event, listener, false);
            })
        },

        off: function(event, listener) {
            if (!isEventSupported(event)) {
                this.error('Event ' + event + ' not supported.');
            }

            if (typeof listener !== 'function' && typeof listener !== 'object') {
                this.error('Listner should be a function. The ' + (typeof listener) + ' was specified.');
            }

            this._each(function(element) {
                if(element.attachEvent !== void listener){
                    element.detachEvent(('on' + event), listener);
                    return;
                }
                element.removeEventListener(event, listener, false);
            })
        },

        addClass: function(className){
            this._each(function(element){
                element.className = element.className.replace(new RegExp('(?:^|\\s)'+className+'(?!\\S)') ,'');
                element.className += ((element.className.length) ? " " : "") + className;
            });
            return this;
        },

        removeClass: function(className) {
            this._each(function(element) {
                element.className = element.className.replace(new RegExp('(?:^|\\s)'+className+'(?!\\S)') ,'');
            });
            return this;
        },

        hasClass: function(className) {
            var length = this.length;
            for(var i=0; i < length; i++) {
                return this._e[i].className && new RegExp("(\\s|^)" + className + "(\\s|$)").test(this._e[i].className);
            }    
            return this;
        },

        attr: function(attr, value) {
            if (attr === void 0 || typeof attr !=='string') {
                this.error('Attribute name must be string');
            }
            this._each(function(element) {
                if (value === void 0) {
                    return element.removeAttribute(attr);
                }
                element.setAttribute(attr, value);
            });
            return this;
        },

        removeAttr: function(attr) {
            if (attr === void 0 || typeof attr !=='string') {
                return this;
            }

            this._each(function(element) {
                return element.removeAttribute(attr);
            });
        },

        _each: function(cb) {
            var element;
            for(var i=0; i < this.length; i++) {
                element = this._e[i];
                cb(element);
            }
        },

        error: function (message) {
            throw new Error(message);
        }
    }

    var init = $.fn.init = function (selector, context) {
        var idMatch = idExp.exec(selector),
            element
            this._e = [];

        if (selector === void 0) {
            return this;
        }

        if (typeof selector === 'string') {
            if (idMatch !== null) {
                element = document.getElementById(idMatch[1]);
                this.context = document;
                this.selector = selector;
                this.length = 0;

                if (element !== null) {
                    this.length = 1;
                    this._e[0] = element;
                    return this;   
                }
            } else {
                context = (context === void 0) ? document : context; 
                return this.constructor(context).find(selector);                        
            }
        } else if(selector.nodeType !== void 0) {
	        this.context = this._e[0] = selector;
			this.length = 1;
			return this;
        }
    };
    
    init.prototype = $.fn;
    return $;
});

(function(factory) {
  var scope = (typeof self == 'object' && self.self === self && self) ||
            (typeof global == 'object' && global.global === global && global);

   scope.BikeJS = factory(scope, {}, $$);

})(function(scope, BikeJS, $) {

    var Utils = BikeJS.Utils = {},
        JsonP = BikeJS.JsonP = {},
        Model = BikeJS.Model = {},
        Collection = BikeJS.Collection = {},
        View = BikeJS.View = {},

    _isUndefined = function (obj) {
        return obj === void 0;
    },

    _extend = function(keyFn, override) {
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

    throwError = function(message) {
        throw new Error(message);    
    },
    
    extend = function(properties) {   
        var parent = this,
            child,
            Surrogate;

        if (properties !== void 0 && properties.hasOwnProperty('constructor')) {
            child = properties.constructor
        } else {
            child = function() {return parent.apply(this, arguments)}
        }

        BikeJS.Utils.extend(child, parent);

        Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        if (properties !== void 0) {
            BikeJS.Utils.extend(child.prototype, properties, true);
        }

        child.__parent__ = parent.prototype;

        return child;
    };

    Utils.getKeys = function(obj) {
        var keys = [],
            type = typeof obj,
            isObject = (type == 'function' || type === 'object' && !!obj);

        if (!isObject)  {
            return [];
        }

        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    };

    Utils.isArray = function(obj) {
        return Array.isArray(obj) || toString.call(obj) === '[object Array]';
    }

    Utils.extend = _extend(Utils.getKeys);

    JsonP.isValidResponse = function() {
        return true;
    };

    JsonP.CallbackRegistry = {};

    JsonP.request = function(url, onSuccess, onError) {
        var scriptOk = false;
        var callbackName = 'cb' + String(Math.random()).slice(-6);

        url += ~url.indexOf('?') ? '&' : '?';
        url += 'callback=BikeJS.JsonP.CallbackRegistry.' + callbackName;
        JsonP.CallbackRegistry[callbackName] = function(data) {
            scriptOk = JsonP.isValidResponse(data);
            delete JsonP.CallbackRegistry[callbackName];
            if(scriptOk) onSuccess(data);
        };

        function checkCallback() {
            if (scriptOk) return;
            delete JsonP.CallbackRegistry[callbackName];
            onError(url);
        }

        var script = document.createElement('script');
            script.onreadystatechange = function() {
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
    Collection = BikeJS.Collection = function(options) {
        options = options || {};
        if (options.model !== void 0) this.model = options.model;
        this.models = [],
        this.init.apply(this, arguments);
    }

    Utils.extend(Collection.prototype, {
        init: function() {},
        model : Model,
        url: function() {},
        parse: function(data) {
            return data;
        },
        set: function(models, options){
            var length, 
                model,
                self = this,
                attrs;

            this.models = [];

            if (models === null || models === void 0) return;
            models = !Utils.isArray(models) ? [models] : models.slice();
            length = models.length;
        
            for(var i = 0; i < length; i++) {
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

            for(var i=0; i < lenght; i++) {
                var model = models[i];
                cb.call(model);
            }
        },

        fetch: function(options) {
            var self = this, data,
                options = options || {},
                params = {};

            if(options['params'] !== void 0) {
                params = options['params'];
            }

            if (this.url === void 0) {
                throwError('The url function must be specified');
            }
            
            BikeJS.JsonP.request(this.url(params), function(response) {
                var models = self.parse(response),
                    success = options.success;

                if(!self.set(models)) return false;
                if (typeof success === 'function') {
                    success.call(self, response, models); 
                }
            }, function() {
                var error = options.error;
                if (typeof error === 'function') {
                    error.call(self); 
                }
            });
        },

        _createModel: function(attrs) {
            var model = new this.model(attrs);
            return model;
        }
    });


    /*************Model declaration*******************/
    Model = BikeJS.Model = function(attributes, options) {
        var attrs = attributes || {};
        this.attributes = BikeJS.Utils.extend({}, attrs);
        this.init.apply(this, arguments);
    };

    Utils.extend(Model.prototype, {
        init: function() { 
        },

        url: function(params) {

        },

        parse: function(data) {
            return data;
        },

        get: function(attr, defaultValue) {
            defaultValue = (defaultValue === void 0) ? null : defaultValue;
            return this.attributes[attr] !== void 0 ? this.attributes[attr] : defaultValue;
        },

        set: function(attrs) {
            this.attributes = attrs;
            return true;
        },

        fetch: function(options) {
            var self = this, data,
                options = options || {},
                params = {};

            if(options['params'] !== void 0) {
                params = options['params'];
            }

            if (this.url === void 0) {
                throwError('The url function must be specified');
            }

            BikeJS.JsonP.request(this.url(params), function(response) {
                var models = self.parse(response),
                    success = options.success;

                if(!self.set(models)) return false;
                if (typeof success === 'function') {
                  success.call(self, response, models); 
                }
            }, function() {
                var error = options.error;
                if (typeof error === 'function') {
                    error.call(self); 
                }
            });
        }
    });

    /*************View declaration*******************/
    View = BikeJS.View = function(options) {
        this._initElement()
        this.init.apply(this, arguments);
    };


    Utils.extend(View.prototype, {
        id: null,
        events: {},

        delegateEvents: function(events) {
            var eventsPattern = /^(\S+)\s*(.*)$/,
                match,
                method;

            events || (events = this.events);
            if (!events) {
                return true;
            }

            for(var key in events) {
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


        delegateEvent: function(event, selector, listener) {
            this.$el.find(selector).on(event, listener);
        },

        init: function() {},

        _initElement: function() {
            if (this.id === null) {
                throwError('The id of View container must be specified');
            }

            this.$el = $$('#' + this.id);
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
        fNOP = function () {},
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