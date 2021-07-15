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
/* harmony export */   "html": () => (/* binding */ parseString),
/* harmony export */   "createElementFromString": () => (/* binding */ createElementFromString),
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "createState": () => (/* binding */ createState)
/* harmony export */ });
// This is to hide the ref property an invoked state returns
// which is a reference to the original object
// to make sure we won't be able to access it outside of its intended use
const REF = Symbol('ref');

// classes
class Template {
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

const settings = {
  addDefaultProp: (...prop) => defaultProps.push(...prop),
  addBooleanAttr: (...attr) => booleanAttributes.push(...attr),
};

// is functions
const isObject = (val) => typeof val === 'object';

const isArray = (val) => Array.isArray(val);

const isTemplate = (val) => val instanceof Template;

const isState = (key) => key.startsWith('$');

const isEventListener = (key) => key.toLowerCase().startsWith('on');

const isDefaultProp = (key) => defaultProps.includes(key);

const isStyleAttribute = (key) => key in mockEl.style;

const isBooleanAttribute = (attr) => booleanAttributes.includes(attr);

// utils
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
  }

  if (type === 'listener') {
    k = key.toLowerCase();
  }

  return [k.replace(/^(\$|on)/gi, ''), type];
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

function generateHandler(type, obj) {
  const id = uniqid();
  const seed = uniqid(4);
  const attrName = `data-${type}-${seed}`;
  const dataAttr = `${attrName}="${id}"`;
  const handlers = [];

  Object.entries(obj).forEach(([name, value]) => {
    handlers.push({
      type,
      query: `[${dataAttr}]`,
      attr: attrName,
      data: { name, value },
      remove: false,
    });
  });

  handlers[handlers.length - 1].remove = true;

  return { str: dataAttr, handlers };
}

const generateHandlerAll = (obj) =>
  pipe(
    obj,
    Object.entries,
    (items) => items.map((args) => generateHandler(...args)),
    reduceHandlerArray
  );

// parser
const parse = (val, handlers = []) => {
  if (isArray(val)) {
    // Will be parsed as an array of object { str, handlers }
    // And will be reduced to a single { str, handlers }
    const final = reduceHandlerArray(val.map((item) => parse(item, handlers)));

    return {
      str: final.str.join(' '),
      handlers: [...handlers, ...final.handlers].flat(),
    };
  }

  if (isTemplate(val)) {
    // Just add its string and handlers
    return {
      str: val.str,
      handlers: [...handlers, ...val.handlers],
    };
  }

  if (isObject(val)) {
    const { state, ...otherTypes } = batchSameTypes(val);

    // Will be parsed to { str: [], handlers: [] }
    const a = generateHandlerAll(otherTypes);
    const b = state ? generateStateHandler(state) : { str: [], handlers: [] };

    return {
      str: [...a.str, ...b.str].join(' '),
      handlers: [...handlers, ...a.handlers, ...b.handlers].flat(),
    };
  }

  return {
    handlers,
    str: `${val}`,
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

const parseString = (fragments, ...values) => {
  const result = reduceHandlerArray(values.map((value) => parse(value)));

  const htmlString = addPlaceholders(
    result.str.reduce(
      (acc, str, i) => `${acc}${str}${fragments[i + 1]}`,
      fragments[0]
    )
  );

  return new Template(htmlString, result.handlers.flat());
};

function modifyElement({ query, type, data, context = document }) {
  const node = context.querySelector(query);

  if (!node) {
    console.error(`Can't find node using selector ${query}`);
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
    case 'children':
      [...node.children].map((child) => child.remove());

      if (isArray(data.value)) {
        node.append(...data.value.map(reduceNode));
      } else {
        node.append(reduceNode(data.value));
      }

      break;
    default:
      throw new Error('Invalid type.');
  }
}

// Taken from https://stackoverflow.com/questions/13363946/how-do-i-get-an-html-comment-with-javascript
function replacePlaceholderComments(root) {
  // Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
  const iterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_COMMENT,
    () => NodeFilter.FILTER_ACCEPT,
    false
  );

  let current = iterator.nextNode();
  while (current) {
    const isPlaceholder = current.nodeValue.trim().startsWith('placeholder-');

    if (isPlaceholder) {
      current.replaceWith(
        document.createTextNode(
          current.nodeValue.trim().replace('placeholder-', '')
        )
      );
    }

    current = iterator.nextNode();
  }
}

function createElementFromString(str, handlers = []) {
  const fragment = document.createRange().createContextualFragment(str);

  handlers.forEach((handler) => {
    const el = fragment.querySelector(handler.query);

    modifyElement({
      query: handler.query,
      type: handler.type,
      data: handler.data,
      context: fragment,
    });

    if (handler.remove) {
      el.removeAttribute(handler.attr);
    }
  });

  // Replace all placeholder comments
  [...fragment.children].forEach(replacePlaceholderComments);

  return fragment;
}

function render(template) {
  return createElementFromString(...Object.values(template));
}

// State
const StateStore = new WeakMap();

function generateStateHandler(state = {}) {
  const id = uniqid();
  const proxyId = `data-proxyid="${id}"`;
  const batchedObj = {};

  Object.entries(state).forEach(([type, batch]) => {
    Object.entries(batch).forEach(([key, info]) => {
      const bindedElements = StateStore.get(info[REF]);
      const existingHandlers = bindedElements.get(id) || [];

      const finalValue = reduceValue(info.data.value, info.data.trap);

      if (!batchedObj[type]) {
        batchedObj[type] = {};
      }

      batchedObj[type][key] = finalValue;

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
}

const setter = (ref) => (target, prop, value, receiver) => {
  const bindedElements = StateStore.get(ref);

  bindedElements.forEach((handlers, id) => {
    const query = `[data-proxyid="${id}"]`;
    const el = document.querySelector(query);

    if (el) {
      handlers.forEach((handler) => {
        if (prop !== handler.prop) return;

        const finalValue = reduceValue(value, handler.trap);

        modifyElement({
          query,
          type: handler.type,
          data: { name: handler.target, value: finalValue },
        });
      });
    } else {
      // delete handler when the target is unreachable (most likely deleted)
      bindedElements.delete(id);
    }
  });

  return Reflect.set(target, prop, value, receiver);
};

const _bind =
  (ref, prop, value) =>
  (trap = null) => ({
    [REF]: ref,
    data: {
      prop,
      trap,
      value,
    },
  });

const getter = (ref) => (target, rawProp, receiver) => {
  const [prop, type] = determineType(rawProp);

  if (type === 'state' && prop in target) {
    return Object.assign(
      _bind(ref, prop, target[prop]),
      _bind(ref, prop, target[prop])()
    );
  }

  return Reflect.get(target, prop, receiver);
};

const createState = (value, seal = true) => {
  const obj = isObject(value) ? value : { value };
  StateStore.set(obj, new Map());

  const { proxy, revoke } = Proxy.revocable(seal ? Object.seal(obj) : obj, {
    get: getter(obj),
    set: setter(obj),
  });

  // To make sure state gets deleted from memory
  const _deleteState = () => {
    revoke();
    StateStore.delete(obj);

    return obj;
  };

  return [proxy, _deleteState];
};




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
/* harmony import */ var _pages__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages */ "./src/pages/index.js");
/* harmony import */ var _Router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Router */ "./src/Router.js");




const routes = [
  {
    path: '/',
    name: 'Home',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.Home,
  },
  {
    path: '/menu',
    name: 'Menu',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.Menu,
  },
  {
    path: 'about',
    name: 'About Us',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.About,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.Contact,
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
                <a class="nav__link link" href="#${route.path}">
                  ${route.name}
                </a>
              </li>
            `
        )}
      </ul>
    </nav>
  </header>
  ${(0,_Router__WEBPACK_IMPORTED_MODULE_2__.default)(routes, _pages__WEBPACK_IMPORTED_MODULE_1__.Error, 'container', 'main')}
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
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event */ "./src/event.js");



// Will only render one component at a time
const Router = (routes, error, className = '', tagName = 'div') => {
  const [currentLocation] = (0,poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.createState)(
    window.location.hash.replace('#', '') || '/'
  );

  _event__WEBPACK_IMPORTED_MODULE_1__.default.on('hashchange', (path) => {
    currentLocation.value = path;
  });

  const changeContent = (path) => {
    const route = routes.find((route) => route.path === path);

    if (!route || !route.component) {
      return error.call(null);
    }

    return route.component.call(null);
  };

  return poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <${tagName} ${className && `class="${className}"`} 
    ${{
      $children: currentLocation.$value(changeContent),
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


const Card = () =>
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`<div class="card">
    <img
      class="card__img"
      src="./assets/images/placeholder.png"
      alt="placeholder"
    />
    <div class="card__body">
      <h1 class="title card__title">This is a card</h1>
      <p class="card__text">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
        officiis mollitia obcaecati officia repellat dolores.
      </p>
      <hr />
      <p class="card__subtext">Lorem ipsum dolor sit amet.</p>
    </div>
  </div>`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Card);


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
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(eventName, fn, options) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName).push({ fn, options });
  }

  off(eventName, fn) {
    let handlers = this.events.get(eventName);
    handlers = handlers.filter((handler) => handler.fn !== fn);

    console.log(`Shutting off ${eventName}...`);
    this.events.set(eventName, handlers);
  }

  clear() {
    this.events.clear();
  }

  emit(eventName, payload = null) {
    console.log(`${eventName} event emitted... `);
    const handlers = this.events.get(eventName) || [];

    handlers.forEach((handler) => {
      handler.fn.call(null, payload);

      if (handler.options && handler.options.once) {
        this.off(eventName, handler.fn);
      }
    });
  }
}

const event = new EventEmitter();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (event);


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
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`<h1 class="title title--centered">This is my About</h1>
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
    </p>`;

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



const Contact = () => poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`<h1 class="title title--centered">Message us</h1>
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
  </form>`;

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


const Error = () =>
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <div class="error">
      <h1 class="error__message">Page not found</h1>
      <p class="link error__link" ${{ onClick: () => window.history.back() }}>
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
        <a class="banner__link link" href="#/menu">See menu</a>
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
/* harmony import */ var _components_Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Card */ "./src/components/Card.js");



const Menu = () =>
  poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`
    <aside class="sidenav">
      <ul class="nav__menu sidenav__menu">
        ${new Array(5).fill('Category').map(
          (str, i) =>
            poor_man_jsx__WEBPACK_IMPORTED_MODULE_0__.html`<li class="nav__item sidenav__item">
              <a class="link sidenav__link" href="#/">${str} ${i + 1}</a>
            </li>`
        )}
      </ul>
    </aside>
    <section class="menu">
      <h1 class="title">Category title</h1>
      ${new Array(10).fill((0,_components_Card__WEBPACK_IMPORTED_MODULE_1__.default)())}
    </section>
  `;

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
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ "./src/App.js");
/* harmony import */ var poor_man_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! poor-man-jsx */ "./node_modules/poor-man-jsx/index.js");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./event */ "./src/event.js");




let formHasValue = false;

_event__WEBPACK_IMPORTED_MODULE_2__.default.on('form input', (hasInput) => {
  formHasValue = hasInput;
});

window.addEventListener('hashchange', () => {
  _event__WEBPACK_IMPORTED_MODULE_2__.default.emit('hashchange', window.location.hash.replace('#', ''));
});

window.addEventListener('beforeunload', (e) => {
  if (formHasValue && window.location.hash.replace('#', '') === '/contact') {
    e.preventDefault();
    e.returnValue = '';
  }
});

document.body.prepend((0,poor_man_jsx__WEBPACK_IMPORTED_MODULE_1__.render)((0,_App__WEBPACK_IMPORTED_MODULE_0__.default)()));

})();

/******/ })()
;
//# sourceMappingURL=main.js.map