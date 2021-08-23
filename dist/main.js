/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/poor-man-jsx/index.js":
/*!********************************************!*\
  !*** ./node_modules/poor-man-jsx/index.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "settings": () => (/* binding */ settings),
/* harmony export */   "html": () => (/* binding */ html),
/* harmony export */   "createElementFromString": () => (/* binding */ createElementFromString),
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "createState": () => (/* binding */ createState),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Template {
  /**
   * Create a template
   * @param {String} str - an html string
   * @param {Array} handlers - an array of handlers
   */
  constructor(str, handlers) {
    this.str = str;
    this.handlers = handlers;
  }
}

const mockEl = document.createElement('div');
const defaultProps = [
  'textContent',
  'innerHTML',
  'outerHTML',
  'innerText',
  'style',
];
const booleanAttributes = [
  'checked',
  'selected',
  'disabled',
  'readonly',
  'multiple',
  'ismap',
  'noresize',
  'reversed',
  'autocomplete',
];
const lifecycleMethods = ['create', 'destroy', 'mount', 'unmount'];

/**
 * Is functions used for type checking
 */
const isObject = (value) => typeof value === 'object';

const isArray = (value) => Array.isArray(value);

const isTemplate = (value) => value instanceof Template;

const isNode = (value) => value instanceof Node;

const isState = (key) => key.startsWith('$');

const isLifecycleMethod = (key) => key.startsWith('@');

const isEventListener = (key) => key.toLowerCase().startsWith('on');

const isDefaultProp = (key) => defaultProps.includes(key);

const isStyleAttribute = (key) =>
  key in mockEl.style || key.startsWith('style_');

const isBooleanAttribute = (attr) => booleanAttributes.includes(attr);

/**
 * Utility functions
 */
const uniqid = (length = 8) => Math.random().toString(36).substr(2, length);

const pipe = (args, ...fns) =>
  fns.reduce((prevResult, fn) => fn(prevResult), args);

const reduceValue = (value, fn = null) => (fn ? fn.call(null, value) : value);

const reduceNode = (node) => (isTemplate(node) ? render(node) : node);

const reduceHandlerArray = (arr) =>
  arr.reduce(
    (acc, item) => {
      acc.str.push(item.str);
      acc.handlers.push(item.handlers);

      return acc;
    },
    { str: [], handlers: [] }
  );

const generateAttribute = (type) => {
  const id = uniqid();
  const seed = uniqid(4);
  const attrName = `data-${type}-${seed}`;
  const dataAttr = `${attrName}="${id}"`;

  return [dataAttr, attrName];
};

const determineType = (key) => {
  // Any unrecognizable key will be treated as attr
  let type = 'attr';
  let k = key;

  if (isState(key)) {
    type = 'state';
  } else if (isEventListener(key)) {
    type = 'listener';
  } else if (isDefaultProp(key)) {
    type = 'prop';
  } else if (isStyleAttribute(key)) {
    type = 'style';
  } else if (key === 'children') {
    type = 'children';
  } else if (isLifecycleMethod(key)) {
    if (!lifecycleMethods.includes(key.replace('@', ''))) {
      throw new Error(`${key} is not a lifecycle method`);
    }

    type = 'lifecycle';
  }

  if (type === 'listener') {
    k = key.toLowerCase();
  }

  return [k.replace(/^(\$|@|on|style_)/gi, ''), type];
};

const batchSameTypes = (obj) => {
  const batched = Object.entries(obj).reduce((acc, [rawKey, value]) => {
    const [key, type] = determineType(rawKey);

    if (!acc[type]) {
      acc[type] = {};
    }

    acc[type][key] = value;

    return acc;
  }, {});

  if (batched.state) {
    batched.state = batchSameTypes(batched.state);
  }

  return batched;
};

const generateHandler = (type, obj) => {
  const [dataAttr, attrName] = generateAttribute(type);
  const handlers = [];

  Object.entries(obj).forEach(([name, value]) => {
    handlers.push({
      type,
      selector: `[${dataAttr}]`,
      attr: attrName,
      data: { name, value },
      remove: false,
    });
  });

  handlers[handlers.length - 1].remove = true;

  return { str: dataAttr, handlers };
};

const generateHandlerAll = (obj) =>
  pipe(
    Object.entries(obj),
    (items) => items.map((args) => generateHandler(...args)),
    reduceHandlerArray
  );

/**
 * Lifecycle
 */
const generateLifecycleHandler = (obj) => {
  const str = [];
  const handlers = [];

  Object.entries(obj).forEach(([type, fn]) => {
    const [dataAttr, attrName] = generateAttribute(type);

    str.push(dataAttr);
    handlers.push({
      type,
      fn,
      selector: `[${dataAttr}]`,
      attr: attrName,
      remove: true,
    });
  });

  return { str, handlers };
};

const LIFECYCLE_SYMBOLS = {
  destroy: Symbol('@destroy'),
  mount: Symbol('@mount'),
  unmount: Symbol('@unmount'),
};
const config = { childList: true, subtree: true };

const traverseNode = (node, callback) => {
  callback.call(null, node);

  if (node.children && node.children.length) {
    [...node.children].forEach((child) => traverseNode(child, callback));
  }
};

const mutationCallback = (mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        traverseNode(node, (n) => {
          const cb = n[LIFECYCLE_SYMBOLS.mount];

          if (cb) cb.call(n);
        });
      });

      mutation.removedNodes.forEach((node) => {
        if (!document.body.contains(node)) {
          traverseNode(node, (n) => {
            const cb = n[LIFECYCLE_SYMBOLS.destroy];

            if (cb) cb.call(n);
          });
        }

        traverseNode(node, (n) => {
          const cb = n[LIFECYCLE_SYMBOLS.unmount];

          if (cb) cb.call(n);
        });
      });
    }
  });
};

const observer = new MutationObserver(mutationCallback);
observer.observe(document.body, config);

/**
 * The parser
 * @param {*} value
 * @param {Array} handlers
 * @returns
 */
const parse = (value, handlers = []) => {
  if (isNode(value)) {
    const id = uniqid();

    return {
      str: `<marker id="node-${id}" />`,
      handlers: [
        ...handlers.flat(),
        { type: 'node', selector: `#node-${id}`, data: { value } },
      ],
    };
  }

  if (isTemplate(value)) {
    // Just add its string and handlers
    return {
      str: value.str,
      handlers: [...handlers, ...value.handlers],
    };
  }

  if (isArray(value)) {
    // Will be parsed as an array of object { str, handlers }
    // And will be reduced to a single { str, handlers }
    const final = reduceHandlerArray(
      value.map((item) => parse(item, handlers))
    );

    return {
      str: final.str.join(' '),
      handlers: [handlers, final.handlers].flat(2),
    };
  }

  if (isObject(value)) {
    const { state, lifecycle, ...otherTypes } = batchSameTypes(value);
    const blank = { str: [], handlers: [] };

    // Will be parsed to { str: [], handlers: [] }
    const a = generateHandlerAll(otherTypes);
    const b = state ? generateStateHandler(state) : blank;
    const c = lifecycle ? generateLifecycleHandler(lifecycle) : blank;

    return {
      str: [...a.str, ...b.str, ...c.str].join(' '),
      handlers: [handlers, a.handlers, b.handlers, c.handlers].flat(2),
    };
  }

  return {
    handlers,
    str: `${value}`,
  };
};

const addPlaceholders = (str) => {
  const placeholderRegex = /{%\s*(.*)\s*%}/;
  let newString = str;
  let match = newString.match(placeholderRegex);

  while (match) {
    newString = newString.replace(
      match[0],
      `<!-- placeholder-${match[1].trim()} -->`
    );

    match = newString.slice(match.index).match(placeholderRegex);
  }

  return newString;
};

/**
 * Creates a `Template` from a template literal. Must be used as a tag.
 * @param {Array.<String>} fragments
 * @param  {...(String|Object|Array|Template)} values
 * @returns {Template}
 */
const html = (fragments, ...values) => {
  const result = reduceHandlerArray(values.map((value) => parse(value)));

  const htmlString = pipe(
    result.str.reduce(
      (acc, str, i) => `${acc}${str}${fragments[i + 1]}`,
      fragments[0]
    ),
    addPlaceholders
  );

  return new Template(htmlString, result.handlers.flat());
};

/**
 * Hydrate helpers
 */
const removeChildren = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
};

const modifyElement = (selector, type, data, context = document) => {
  const node = context.querySelector(selector);

  if (!node) {
    console.error(`Can't find node using selector ${selector}`);
    return;
  }

  switch (type) {
    case 'prop':
      node[data.name] = data.value;
      break;
    case 'attr':
      if (isBooleanAttribute(data.name)) {
        if (data.value) {
          node.setAttribute(data.name, '');
        } else {
          node.removeAttribute(data.name);
        }
      } else {
        node.setAttribute(data.name, data.value);
      }

      break;
    case 'listener':
      node.addEventListener(data.name, data.value);
      break;
    case 'style':
      node.style[data.name] = data.value;
      break;
    case 'children': {
      removeChildren(node);

      const fragment = document.createDocumentFragment();

      if (isArray(data.value)) {
        fragment.append(...data.value.map(reduceNode));
      } else {
        fragment.append(reduceNode(data.value));
      }

      node.append(fragment);

      break;
    }
    case 'node':
      node.replaceWith(data.value);
      break;
    default:
      throw new Error('Invalid type.');
  }
};

const replacePlaceholderComments = (root) => {
  const iterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_COMMENT,
    () => NodeFilter.FILTER_ACCEPT
  );

  let current;
  // eslint-disable-next-line
  while ((current = iterator.nextNode())) {
    const text = current.nodeValue.trim();
    const isPlaceholder = text.startsWith('placeholder-');

    if (isPlaceholder) {
      current.replaceWith(
        document.createTextNode(text.replace('placeholder-', ''))
      );
    }
  }
};

const createHydrateFn =
  (handlers = []) =>
  (context) =>
    handlers.forEach((handler) => {
      const el = context.querySelector(handler.selector);

      switch (handler.type) {
        case 'create':
          handler.fn.call(el);
          break;
        case 'destroy':
        case 'mount':
        case 'unmount':
          el[LIFECYCLE_SYMBOLS[handler.type]] = handler.fn;
          break;
        default:
          modifyElement(handler.selector, handler.type, handler.data, context);
          break;
      }

      if (handler.remove) {
        el.removeAttribute(handler.attr);
      }
    });

/**
 * Creates an element from string with `createContextualFragment`
 * @param {String} str - the html string to be rendered
 * @param {Array} handlers - array of handlers
 * @returns {DocumentFragment}
 */
function createElementFromString(str, handlers = []) {
  const fragment = document.createRange().createContextualFragment(str);
  const [createHandlers, otherHandlers] = handlers.reduce(
    (acc, current) => {
      if (current.type === 'create') acc[0].push(current);
      else acc[1].push(current);

      return acc;
    },
    [[], []]
  );

  createHydrateFn(otherHandlers)(fragment);
  [...fragment.children].forEach(replacePlaceholderComments);

  createHydrateFn(createHandlers)(fragment);

  return fragment;
}

/**
 * Creates element from a `Template` and appends it to `element` if provided.
 * If element is not provided, it'll return the created document fragment.
 * Otherwise, it'll return the `element`
 * @param {Template} template - a `Template` returned by `html`
 * @param {String|HTMLElement} element - the element to append to
 * @returns
 */
const render = (template, element) => {
  const fragment = createElementFromString(...Object.values(template));

  if (element) {
    const parent =
      typeof element === 'string' ? document.querySelector(element) : element;

    parent.append(fragment);

    /** @type {HTMLElement} */
    return parent;
  }

  /** @type {DocumentFragment} */
  return fragment;
};

/**
 * State
 */
const StateStore = new WeakMap();

// This is to hide the ref property an invoked state returns
// which is a reference to the original object
// to make sure we won't be able to access it outside of its intended use
const REF = Symbol('ref');

/**
 * Creates a state
 * @param {any} value - the initial value of state
 * @param {Boolean} [seal=true] - seal the object with Object.seal
 * @returns {[Object, function]}
 */
const createState = (value, seal = true) => {
  const obj = isObject(value) ? value : { value };
  StateStore.set(obj, new Map());

  const { proxy, revoke } = Proxy.revocable(seal ? Object.seal(obj) : obj, {
    get: getter(obj),
    set: setter(obj),
  });

  /**
   * Delete the state and returns the original value
   * @returns {any}
   */
  const deleteState = () => {
    revoke();
    StateStore.delete(obj);

    return value;
  };

  return [proxy, deleteState];
};

const getter = (ref) => (target, rawProp, receiver) => {
  const [prop, type] = determineType(rawProp);

  const $ =
    (value) =>
    (trap = null) => ({
      [REF]: ref,
      data: {
        prop,
        trap,
        value,
      },
    });

  if (type === 'state' && prop in target) {
    return Object.assign($(target[prop]), $(target[prop])());
  }

  return Reflect.get(target, prop, receiver);
};

const setter = (ref) => (target, prop, value, receiver) => {
  const bindedElements = StateStore.get(ref);

  bindedElements.forEach((handlers, id) => {
    const selector = `[data-proxyid="${id}"]`;
    const el = document.querySelector(selector);

    if (el) {
      handlers.forEach((handler) => {
        if (prop !== handler.prop) return;

        modifyElement(selector, handler.type, {
          name: handler.target,
          value: reduceValue(value, handler.trap),
        });
      });
    } else {
      // delete handler when the target is unreachable (most likely deleted)
      bindedElements.delete(id);
    }
  });

  return Reflect.set(target, prop, value, receiver);
};

const generateStateHandler = (state = {}) => {
  const id = uniqid();
  const proxyId = `data-proxyid="${id}"`;
  const batchedObj = {};

  Object.entries(state).forEach(([type, batch]) => {
    Object.entries(batch).forEach(([key, info]) => {
      const bindedElements = StateStore.get(info[REF]);
      const existingHandlers = bindedElements.get(id) || [];

      if (!batchedObj[type]) {
        batchedObj[type] = {};
      }

      batchedObj[type][key] = reduceValue(info.data.value, info.data.trap);

      bindedElements.set(id, [
        ...existingHandlers,
        {
          type,
          target: key,
          prop: info.data.prop,
          trap: info.data.trap,
        },
      ]);
    });
  });

  const { str, handlers } = generateHandlerAll(batchedObj);

  return { handlers, str: [...str, proxyId] };
};

/**
 * Settings
 */

/**
 * Add a defaul property (anything that can be called directly from the element)
 * @param  {...string} prop - the default prop that will be added
 * @returns
 */
const addDefaultProp = (...prop) => defaultProps.push(...prop);

/**
 * Add a boolean attribute to the list.
 * @param  {...string} attr - the boolean attribute to be added
 * @returns
 */
const addBooleanAttr = (...attr) => booleanAttributes.push(...attr);

/**
 * Disconnect the MutationObserver. This will stop watching for added/removed nodes.
 * This means that `@mount`, `@unmount`, and `@destroy` will no longer work.
 * @returns
 */
const disableObserver = () => observer.disconnect();

const settings = {
  addDefaultProp,
  addBooleanAttr,
  disableObserver,
};


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (settings);


/***/ }),

/***/ "./src/App.js":
/*!********************!*\
  !*** ./src/App.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _history__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./history */ "./src/history.js");
/* harmony import */ var _Router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Router */ "./src/Router.js");
/* harmony import */ var _pages__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages */ "./src/pages/index.js");





const routes = [
  {
    path: '/',
    name: 'Home',
    title: 'My Restaurant',
    component: _pages__WEBPACK_IMPORTED_MODULE_3__.Home,
  },
  {
    path: '/menu',
    name: 'Menu',
    title: 'My Restaurant | Menu',
    exact: false,
    component: _pages__WEBPACK_IMPORTED_MODULE_3__.Menu,
  },
  {
    path: '/about',
    name: 'About',
    title: 'My Restaurant | About Us',
    component: _pages__WEBPACK_IMPORTED_MODULE_3__.About,
  },
  {
    path: '/contact',
    name: 'Contact',
    title: 'My Restaurant | Contact',
    component: _pages__WEBPACK_IMPORTED_MODULE_3__.Contact,
  },
];

const App = () => poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
  <header class="header">
    <span class="header__brand title">My Restaurant</span>
    <nav class="header__nav nav">
      <ul class="nav__menu">
        ${routes.map(
          (route) =>
            poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
              <li class="nav__item">
                <a
                  class="nav__link link"
                  ${{ onClick: () => _history__WEBPACK_IMPORTED_MODULE_1__.default.push(route.path) }}
                >
                  ${route.name}
                </a>
              </li>
            `
        )}
      </ul>
    </nav>
  </header>
  ${(0,_Router__WEBPACK_IMPORTED_MODULE_2__.default)(routes, _pages__WEBPACK_IMPORTED_MODULE_3__.Error, 'container', 'main')}
  <footer class="footer">
    <div class="footer__links"></div>
  </footer>
`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);


/***/ }),

/***/ "./src/Router.js":
/*!***********************!*\
  !*** ./src/Router.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/utils.js");
/* harmony import */ var _history__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./history */ "./src/history.js");




// Will only render one component at a time
const Router = (routes, error, className = '', tagName = 'div') => {
  const [current, revoke] = (0,poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.createState)({
    path: '',
    isExact: true,
    component: [],
  });

  const _routes = routes.map((route) => {
    const [pattern, params] = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getParams)(route.path, route.exact);
    return { ...route, path: pattern, params };
  });

  const changeContent = (path, state) => {
    if (
      (!current.isExact && path.startsWith(current.path)) ||
      current.path === path
    )
      return;
    const route = _routes.find((route) => route.path.exec(path));

    if (route && route.component) {
      const payload = {
        path,
        state,
      };

      if (route.params.length) {
        payload.params = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getParamValues)(path, route.path, route.params);
      }

      if (route.title) {
        document.title = route.title;
      }

      current.component = route.component.call(null, payload);
    } else {
      current.component = error.call();
    }

    current.isExact = route?.exact ?? true;
    current.path = path;
  };

  return poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <${tagName} ${className && `class="${className}"`} 
    ${{
      '@mount': () =>
        changeContent(window.location.pathname, window.history.state),
      '@create': () => _history__WEBPACK_IMPORTED_MODULE_2__.default.onPopState(changeContent),
      '@destroy': () => {
        revoke();
        _history__WEBPACK_IMPORTED_MODULE_2__.default.off(changeContent);
      },
      $children: current.$component,
    }}>
    </${tagName}>
  `;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Router);


/***/ }),

/***/ "./src/components/Card.js":
/*!********************************!*\
  !*** ./src/components/Card.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");


const Card = (id) =>
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <div class="card">
      <img
        class="card__img"
        src="https://via.placeholder.com/200"
        alt="placeholder"
      />
      <div class="card__body">
        <h1 class="title card__title">This is card #${id}</h1>
        <p class="card__text">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
          officiis mollitia obcaecati officia repellat dolores.
        </p>
        <hr />
        <p class="card__subtext">Lorem ipsum dolor sit amet.</p>
      </div>
    </div>
  `;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Card);


/***/ }),

/***/ "./src/components/Category.js":
/*!************************************!*\
  !*** ./src/components/Category.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Card */ "./src/components/Card.js");



const Category = ({ params }) => {
  const length = 5;
  const lowerLimit = params.id * length - length + 1;

  return poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    ${new Array(length).fill().map((_, i) => (0,_Card__WEBPACK_IMPORTED_MODULE_1__.default)(lowerLimit + i))}
  `;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Category);


/***/ }),

/***/ "./src/emitter.js":
/*!************************!*\
  !*** ./src/emitter.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const VALUES = {
  first: -999,
  last: 999,
};

class EventEmitter {
  constructor() {
    this.events = [];
  }

  on(name, fn, options = {}) {
    this.events.push({ name, fn, options });
  }

  once(name, fn, options = {}) {
    this.on(name, fn, { ...options, once: true });
  }

  off(name, fn) {
    this.events = this.events.filter((event) => {
      if (event.name.toString() === name.toString() && event.fn === fn)
        return false;
      return true;
    });
  }

  delete(name) {
    this.events = this.events.filter(
      (event) => event.name.toString() !== name.toString()
    );
  }

  clear() {
    this.events = [];
  }

  emit(name, ...payload) {
    this.events
      .filter((event) =>
        event.name instanceof RegExp
          ? event.name.test(name)
          : event.name === name
      )
      .sort((a, b) => {
        const x = a.options.order;
        const y = b.options.order;
        const aValue = Number.isInteger(x) ? x : VALUES[x] || 0;
        const bValue = Number.isInteger(y) ? y : VALUES[y] || 0;

        return aValue - bValue;
      })
      .forEach((handler) => {
        try {
          const result = handler.fn.apply(handler.options.context, payload);

          if (result) this.emit(`${name}.success`, result);
          if (handler.options.once) this.off(name, handler.fn);
        } catch (e) {
          console.error(e);
          this.emit(`${name}.error`, e);
        }
      });
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EventEmitter);


/***/ }),

/***/ "./src/event.js":
/*!**********************!*\
  !*** ./src/event.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./emitter */ "./src/emitter.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new _emitter__WEBPACK_IMPORTED_MODULE_0__.default());


/***/ }),

/***/ "./src/history.js":
/*!************************!*\
  !*** ./src/history.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./emitter */ "./src/emitter.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/utils.js");



const History = (() => {
  const $ = new _emitter__WEBPACK_IMPORTED_MODULE_0__.default();
  const cache = new Map();
  const history = window.history;

  const sync = () => {
    $.emit('popstate', window.location.pathname, history.state);
  };

  const onPopState = (fn, options) => {
    $.on('popstate', fn, options);
  };

  const onChangeToPath = (path, fn, options) => {
    const order = path.split('/').length - 1;
    const [pattern, paramNames] = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getParams)(path);

    const cb = (path, state) => {
      if (!pattern.exec(path)) return;

      const payload = {
        path,
        state,
      };

      if (paramNames.length) {
        payload.params = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getParamValues)(path, pattern, paramNames);
      }

      fn.call(null, payload);
    };

    cache.set(fn, cb);
    $.on('popstate', cb, { ...options, order });
  };

  const off = (fn) => {
    $.off('popstate', cache.get(fn) || fn);
  };

  const clear = () => $.clear();

  const push = (path, state) => {
    if (window.location.host.includes('github')) {
      history.pushState(state, null, '/restaurant-page' + path);
    } else {
      history.pushState(state, null, path);
    }
    sync();
  };

  const replace = (path, state) => {
    history.replaceState(state, null, path);
    sync();
  };

  const forward = () => {
    history.forward();
    sync();
  };

  const back = () => {
    history.back();
    sync();
  };

  const go = (n = 0) => {
    history.go(n);
    sync();
  };

  window.addEventListener('popstate', sync);

  return {
    back,
    clear,
    forward,
    go,
    push,
    replace,
    off,
    onChangeToPath,
    onPopState,
    sync,
  };
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (History);


/***/ }),

/***/ "./src/pages/About.js":
/*!****************************!*\
  !*** ./src/pages/About.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");


const About = () =>
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <h1 class="title title--centered">This is my About</h1>
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Exercitationem
      id numquam inventore porro animi quia repellat nisi eum voluptatibus
      aspernatur, dolor quibusdam autem quaerat doloribus ut quis consequatur!
      Suscipit, accusantium! Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Mollitia delectus, eius quod in eligendi harum minima perferendis
      ex, officiis odit molestiae ipsam quam provident excepturi enim saepe
      adipisci eaque. Ut?
    </p>
    <p>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corrupti ipsam
      voluptatum deserunt ullam quibusdam expedita ratione iure nesciunt,
      accusantium dolorum? Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Deleniti cupiditate saepe mollitia est asperiores beatae.
    </p>
  `;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (About);


/***/ }),

/***/ "./src/pages/Contact.js":
/*!******************************!*\
  !*** ./src/pages/Contact.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../event */ "./src/event.js");



const Contact = () => poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
  <h1 class="title title--centered">Message us</h1>
  <form
    class="form"
    ${{
      onChange: (e) => {
        _event__WEBPACK_IMPORTED_MODULE_1__.default.emit(
          'form input',
          [...e.currentTarget.elements].some((el) => el.value)
        );
      },
      onSubmit: (e) => {
        e.preventDefault();
        alert('Thank you for your message');
        e.target.reset();
        _event__WEBPACK_IMPORTED_MODULE_1__.default.emit('form input', false);
      },
    }}
  >
    <input
      class="form__input"
      type="text"
      name="name"
      id="name"
      placeholder="Your name"
      required
    />
    <input
      class="form__input"
      type="email"
      name="email"
      id="email"
      placeholder="Your email"
      required
    />
    <textarea
      class="form__textarea"
      name="message"
      id="message"
      cols="30"
      rows="15"
      placeholder="Your message"
      required
    ></textarea>
    <button class="form__submit" type="submit">Send</button>
  </form>
`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Contact);


/***/ }),

/***/ "./src/pages/Error.js":
/*!****************************!*\
  !*** ./src/pages/Error.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _history__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../history */ "./src/history.js");



const Error = () =>
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <div class="error">
      <h1 class="error__message">Page not found</h1>
      <p class="link error__link" ${{ onClick: () => _history__WEBPACK_IMPORTED_MODULE_1__.default.back() }}>
        Go back
      </p>
    </div>
  `;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Error);


/***/ }),

/***/ "./src/pages/Home.js":
/*!***************************!*\
  !*** ./src/pages/Home.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _history__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../history */ "./src/history.js");



const Home = () => poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
  <div class="banner">
    <div class="banner__column-l">
      <h1 class="banner__title title">Welcome to our Restaurant</h1>
      <p class="banner__subtext">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsum,
        accusamus! Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        Amet, vel!
      </p>
      <div class="banner__btns">
        <button class="banner__btn">Order now</button>
        <a
          class="banner__link link"
          ${{ onClick: () => _history__WEBPACK_IMPORTED_MODULE_1__.default.push('/menu') }}
        >
          See menu
        </a>
      </div>
    </div>
    <div class="banner__column-r">
      <img
        class="banner__img"
        src="./assets/images/banner_image.jpg"
        alt="picture of ramen"
      />
    </div>
  </div>
`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);


/***/ }),

/***/ "./src/pages/Menu.js":
/*!***************************!*\
  !*** ./src/pages/Menu.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _components_Category__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Category */ "./src/components/Category.js");
/* harmony import */ var _history__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../history */ "./src/history.js");
/* harmony import */ var _Router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Router */ "./src/Router.js");
/* harmony import */ var _Error__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Error */ "./src/pages/Error.js");






const Menu = () => {
  let self;

  const changeToDefaultTitle = () => {
    self.textContent = 'Category';
  };

  const changeCategoryTitle = ({ params }) => {
    self.textContent = `Category ${params.name}`;
  };

  return poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <aside class="sidenav">
      <ul class="nav__menu sidenav__menu">
        ${new Array(5).fill('Category').map(
          (str, i) =>
            poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
              <li class="nav__item sidenav__item">
                <a
                  class="link sidenav__link"
                  ${{ onClick: () => _history__WEBPACK_IMPORTED_MODULE_2__.default.push(`/menu/${i + 1}`) }}
                >
                  {% ${str} ${i + 1} %}
                </a>
              </li>
            `
        )}
      </ul>
    </aside>
    <section class="menu">
      <h1
        class="title"
        ${{
          '@mount': function () {
            self = this;

            _history__WEBPACK_IMPORTED_MODULE_2__.default.onChangeToPath('/menu', changeToDefaultTitle);
            _history__WEBPACK_IMPORTED_MODULE_2__.default.onChangeToPath('/menu/:name', changeCategoryTitle);
          },
          '@unmount': () => {
            _history__WEBPACK_IMPORTED_MODULE_2__.default.off(changeToDefaultTitle);
            _history__WEBPACK_IMPORTED_MODULE_2__.default.off(changeCategoryTitle);
          },
        }}
      >
        Category
      </h1>
      ${(0,_Router__WEBPACK_IMPORTED_MODULE_3__.default)(
        [
          {
            path: '/menu/:id',
            component: _components_Category__WEBPACK_IMPORTED_MODULE_1__.default,
          },
          {
            path: '/menu',
            component: () =>
              'This is a nested route. Choose a category from sidebar for a demo.',
          },
        ],
        _Error__WEBPACK_IMPORTED_MODULE_4__.default
      )}
    </section>
  `;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Menu);


/***/ }),

/***/ "./src/pages/index.js":
/*!****************************!*\
  !*** ./src/pages/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Home": () => (/* reexport safe */ _Home__WEBPACK_IMPORTED_MODULE_0__.default),
/* harmony export */   "Menu": () => (/* reexport safe */ _Menu__WEBPACK_IMPORTED_MODULE_1__.default),
/* harmony export */   "Contact": () => (/* reexport safe */ _Contact__WEBPACK_IMPORTED_MODULE_2__.default),
/* harmony export */   "Error": () => (/* reexport safe */ _Error__WEBPACK_IMPORTED_MODULE_4__.default),
/* harmony export */   "About": () => (/* reexport safe */ _About__WEBPACK_IMPORTED_MODULE_3__.default)
/* harmony export */ });
/* harmony import */ var _Home__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Home */ "./src/pages/Home.js");
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Menu */ "./src/pages/Menu.js");
/* harmony import */ var _Contact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Contact */ "./src/pages/Contact.js");
/* harmony import */ var _About__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./About */ "./src/pages/About.js");
/* harmony import */ var _Error__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Error */ "./src/pages/Error.js");









/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getParams": () => (/* binding */ getParams),
/* harmony export */   "getParamValues": () => (/* binding */ getParamValues)
/* harmony export */ });
const getParams = (path, exact = true) => {
  const defaultParamPattern = '(\\w+)';

  const paramNames = (path.match(/:\w+/g) || []).map((param) =>
    param.replace(':', '')
  );
  const base = paramNames.length
    ? paramNames.reduce(
        (str, name) => str.replace(':' + name, defaultParamPattern),
        path
      )
    : path;
  const pattern = new RegExp(exact ? `^${base}$` : base);

  return [pattern, paramNames];
};

const getParamValues = (path, pattern, paramNames) => {
  const paramValues = (path.match(pattern) || []).slice(1);

  return paramValues.reduce((data, current, i) => {
    data[paramNames[i]] = current;

    return data;
  }, {});
};




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App */ "./src/App.js");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./event */ "./src/event.js");
/* harmony import */ var _history__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./history */ "./src/history.js");





let formHasValue = false;

_event__WEBPACK_IMPORTED_MODULE_2__.default.on('form input', (hasInput) => {
  formHasValue = hasInput;
});

window.addEventListener('beforeunload', (e) => {
  if (formHasValue && window.location.pathname === '/contact') {
    e.preventDefault();
    e.returnValue = '';
  }
});

(0,poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.render)((0,_App__WEBPACK_IMPORTED_MODULE_1__.default)(), document.body);

})();

/******/ })()
;
//# sourceMappingURL=main.js.map