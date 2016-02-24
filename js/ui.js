/**
 * library for DOM operation
 */
(function (factory) {
    var scope = (typeof self == 'object' && self.self === self && self) ||
        (typeof global == 'object' && global.global === global && global);

    scope.$$ = factory(scope, {});

})(function (scope, $) {
    var document = scope.document,
        idExp = /^#([\w-]*)$/,
        isEventSupported = (function () {
            var TAGNAMES = {
                'select': 'input', 'change': 'input',
                'submit': 'form', 'reset': 'form',
                'error': 'img', 'load': 'img', 'abort': 'img'
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

    $ = function (selector, context) {
        return new $.fn.init(selector, context);
    };

    $.fn = $.prototype = {
        constructor: $,

        find: function (selector) {
            var length = this.length,
                elements = [],
                elementsLength = 0,
                stack = [],
                el = new $();

            for (var i = 0; i < this.length; i++) {
                elements = this._e[i].querySelectorAll(selector);
                elementsLength = elements.length;

                for (var j = 0; j < elementsLength; j++) {
                    stack.push(elements[j]);
                }
            }

            el.length = stack.length;
            el.context = this._e[0];
            el.selector = selector;
            el._e = stack;

            return el;
        },

        appendChild: function (child) {
            this._each(function (element) {
                element.appendChild(child);
            });
        },


        html: function (html) {
            var length = this.length;
            if (html !== void 0) {
                for (var i = 0; i < length; i++) {
                    this._e[i].innerHTML = html;
                }
                return this;
            }
            return this;
        },

        on: function (event, listener) {
            if (!isEventSupported(event)) {
                this.error('Event ' + event + ' not supported.');
            }

            if (typeof listener !== 'function' && typeof listener !== 'object') {
                this.error('Listner should be a function. The ' + (typeof listener) + ' was specified.');
            }

            this._each(function (element) {
                if (element.attachEvent !== void listener) {
                    element.attachEvent(('on' + event), listener);
                    return;
                }
                element.addEventListener(event, listener, false);
            })
        },

        off: function (event, listener) {
            if (!isEventSupported(event)) {
                this.error('Event ' + event + ' not supported.');
            }

            if (typeof listener !== 'function' && typeof listener !== 'object') {
                this.error('Listner should be a function. The ' + (typeof listener) + ' was specified.');
            }

            this._each(function (element) {
                if (element.attachEvent !== void listener) {
                    element.detachEvent(('on' + event), listener);
                    return;
                }
                element.removeEventListener(event, listener, false);
            })
        },

        addClass: function (className) {
            this._each(function (element) {
                element.className = element.className.replace(new RegExp('(?:^|\\s)' + className + '(?!\\S)'), '');
                element.className += ((element.className.length) ? " " : "") + className;
            });
            return this;
        },

        removeClass: function (className) {
            this._each(function (element) {
                element.className = element.className.replace(new RegExp('(?:^|\\s)' + className + '(?!\\S)'), '');
            });
            return this;
        },

        hasClass: function (className) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                return this._e[i].className && new RegExp("(\\s|^)" + className + "(\\s|$)").test(this._e[i].className);
            }
            return this;
        },

        attr: function (attr, value) {
            if (attr === void 0 || typeof attr !== 'string') {
                this.error('Attribute name must be string');
            }
            this._each(function (element) {
                if (value === void 0) {
                    return element.removeAttribute(attr);
                }
                element.setAttribute(attr, value);
            });
            return this;
        },

        removeAttr: function (attr) {
            if (attr === void 0 || typeof attr !== 'string') {
                return this;
            }

            this._each(function (element) {
                return element.removeAttribute(attr);
            });
        },

        _each: function (cb) {
            var element;
            for (var i = 0; i < this.length; i++) {
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
        } else if (selector.nodeType !== void 0) {
            this.context = this._e[0] = selector;
            this.length = 1;
            return this;
        }
    };

    init.prototype = $.fn;
    return $;
});