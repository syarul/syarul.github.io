(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Krom = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** 
 * Krom.js v0.1.3 (Alpha) version: https://github.com/syarul/krom
 * A data-driven view, OO, pure js without new paradigm shift
 *
 * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Krom.js >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 *
 * Copyright 2017, Shahrul Nizam Selamat
 * Released under the MIT License.
 */

module.exports = Krom

/**
 * Krom constructor, each component is an instance of Krom
 * @returns {constructor}
 */
function Krom() {
  var ctx = this, childs, child, childAttr, regc, injc

  this.obs = {}
  this.ctor = {}

  this.ctor.doc = (function() {
    return typeof document == 'object' ? true : false
  }())

  this.ctor.tags = {}

  var camelCase = function(s) {
    var rx = /\-([a-z])/g
    if (s === s.toUpperCase()) s = s.toLowerCase()
    return s.replace(rx, function(a, b) {
      return b.toUpperCase()
    })
  }

  var getId = function(id) { return document.getElementById(id) }

  var testEval = function(ev) {
    try { return eval(ev) } catch (e) { return false }
  }

  var _processTags = function(str) {
    childs = str.match(/{{([^{}]+)}}/g, '$1')
    if(childs){
      childs.forEach(function(c){
        regc = c.replace(/{{([^{}]+)}}/g, '$1')
        // skip tags which not being declared yet
        child = testEval(regc) ? eval(regc) : false
        if(child){
          // handle child tag
          childAttr = {
            selector: child._linkElem,
            state: child.obs._state_
          }
          ctx.ctor.tags[regc] = childAttr
          // inject value into child template
          if(child.tmpl) injc = child.tmpl.replace(/></, '>'+child.obs._state_.value+'<')
          // if template does not exist return value as parameter
          else injc = child.obs._state_ ? child.obs._state_.value : ''
          str = str.replace('{{'+regc+'}}', injc)
        }
      })
    }
    if (ctx.ctor.d !== str) {
      // store this string @id
      ctx.ctor.d = str
      return str
    } else {
      return false
    }
  }

  var applyAttrib = function(selector, o) {
    var cty, attr, ts, type
    for (attr in o) {
      ts = new RegExp('-')
      if (attr.match(ts)) {
        type = attr.split('-')
        if (type[0] === 'attr') {
          getId(selector).setAttribute(type[1], o[attr])
        } else if (type[0] === 'css') {
          cty = camelCase(attr.substring(4))
          getId(selector).style[cty] = o[attr]
        }
      }
    }
  }

  var _triggerElem = function() {
    var o = ctx.obs._state_, c = ctx._linkElem, processStr,
      ele = getId(c), t = ctx.ctor.tags, i
    if (ele) {
      // process each {{instance}} before parsing to html
      processStr = _processTags(o.value)
      // parsing string to DOM only when necessary
      if (processStr && o.value.length) ele.innerHTML = processStr
      else if (!processStr && o.value.length < 1) ele.innerHTML = ''
      // attributes class and style
      applyAttrib(c, o)
      // if child ctor exist apply the attributes to child tags
      for (i in t) applyAttrib(t[i].selector, t[i].state)
    }
  }

  var _registerElem = function() {
    var reg = ctx.ctor.register, evReg
    // if this is registered, called this Instance.prototype.compose
    evReg = testEval(reg) ? eval(reg) : false
    if(evReg && typeof evReg.__proto__.compose === 'function') {
      evReg.compose()
    }
  }

  Object.defineProperty(this.obs, '_state_', {
    __proto__: null,
    writeable: true,
    get: function() {
      return this._
    },
    set: function(value) {
      this._ = value
      if (ctx._linkElem) _triggerElem()
      if (ctx.ctor.register) _registerElem()
    }
  })
}
/**
 * Register this component instance as a child of a parent component i.e ```<div>{{childComponent}}</div>```.
 * Updates on child are automatically updated to parent whenever the child called ```set/compose/link```
 * @param {string} - the parent component instance declared variable name. 
 * @returns {context}
 */
Krom.prototype.register = function(instance) {
  if (typeof instance === 'string') this.ctor.register = instance
  else throw ('supply argument is not a string.')
  return this
}
/**
 * Deregister this component instance from a parent component. Update on child component will not notify the parent automatically until parent 
 * called ```set/compose/link```
 * @returns {context}
 */
Krom.prototype.deRegister = function() {
  this.ctor.register = null
  return this
}
/**
 * Wrap this component instance in a template i.e ```<div id="wrapper"></div>```. If the template has an id, it'll register that as well.
 * @param {string} - the template string. 
 * @returns {context}
 */
Krom.prototype.template = function(str) {
  // virtual templating wrapper
  var r = str.match(/id="([^"]+)/)
  this.tmpl = str
    // apply id from string if it has one
  if (r) this.link(r[1])
  return this
}
/**
 * Reevaluate the state of this component instance, if value changed from last update to DOM, update it again. If a **function** is supplied,
 * return the result from it instead.
 * @param {function} - ***optional*** function with ```this``` context as argument
 * @returns {context}
 */
Krom.prototype.compose = function(fn) {
  // compose with a function
  // also as callee for setter
  var c = this.obs._state_, res
  if (typeof fn === 'function') {
    res = fn(this)
    this.obs._state_ = res.obs._state_
  } else {
    this.obs._state_ = c
  }
  return this
}
/**
 * Link this component instance to an attribute ```id```. If value is supplied, notify update to DOM.
 * @param {string} - the id string
 * @param {object|string} - ***optional*** value to parse into DOM
 * @param {string} - ***optional*** if specified this is the value instead, while previous argument is the attribute
 * @returns {context}
 */
Krom.prototype.link = function(id, value, vProp) {
  if (this.ctor.doc) {
    this._linkElem = id
    if (this.tmpl) {
      var r = this.tmpl.match(/id="([^"]+)/)
      this.tmpl = !r ? this.tmpl.replace(/></, ' id="'+id+'"><') : this.tmpl
    }
  } else {
    throw ('linking failed, not a document object model.')
  }

  if (value) this.set(value)
  else if (vProp) this.set(value, vProp)
  return this
}
/**
 * Set value for this component instance from an array of objects
 * @param {object} - instance of the array
 * @param {string} - the template string i.e ```<li>{{index}} name:{{name}} age:{{age}}</li>```. Each handlebar is the reference to attribute in the ***array*** objects
 * @returns {context}
 */
Krom.prototype.array = function(array, templateString) {
  var tmplStr = '', arrProps, tmpl, rep
  this.ctor.arrayProto = array
  this.ctor.tmplString = templateString
  arrProps = templateString.match(/{{([^{}]+)}}/g, '$1')
  array.forEach(function(r) {
    tmpl = templateString
    arrProps.forEach(function(s) {
      rep = s.replace(/{{([^{}]+)}}/g, '$1')
      tmpl = tmpl.replace(/{{([^{}]+)}}/, r[rep])
    })
    tmplStr += tmpl
  })
  this.set(tmplStr)
  return this
}
/**
 * Remove a particular index from the array.
 * @param {object} - a lookup to find particular property of an object usually the index i.e  ```{index: index}```
 * @param {function} - ***optional*** delegate the result array to a **function**, the return result is used instead
 * @returns {context}
 */
Krom.prototype.remove = function(obj, fn) {
  var arr = this.ctor.arrayProto, 
    str = this.ctor.tmplString, i, attr, value, idx
  if(arr.length > 0){
    for(i in obj){ 
      attr = i
      value = obj[i]
    }
    idx = arr.map(function(f){
      return f[attr]
    }).indexOf(value)
    if(~idx) arr.splice(idx, 1)
    if(typeof fn === 'function') arr = fn(arr)
    this.array(arr, str)
  } else {
    throw('object reference not created from array.')
  }
  return this
}
/**
 * Add a new object into the array.
 * @param {object} - the object reference
 * @param {function} - ***optional*** delegate the result array to a **function**, the return result is used instead
 * @returns {context}
 */
Krom.prototype.insert = function(obj, fn) {
  var arr = this.ctor.arrayProto, str = this.ctor.tmplString
  if(Array.isArray(arr)){
    arr.push(obj)
    if(typeof fn === 'function') arr = fn(arr)
    this.array(arr, str)
  } else {
    throw('object reference not created from array.')
  }
  return this
}
/**
 * Input bindings, add an event listener to an input with a lookup to an id, subsequently notify the listener of the changes
 * @param {string} - the id of the input
 * @param {object} - the listener, a component instance
 * @param {string} - the type of this bind event listener
 * @returns {context}
 */
Krom.prototype.bindListener = function(inputId, listener, type) {
  var e = document.getElementById(inputId)
  type = type || 'input'
  e.addEventListener(type, function() {
    listener.set(e.value)
  })
  return this
}
/**
 * Setter for component instance, takes value as ```string```, ```object``` or ```number```. If supplied with a secondary argument the first argument is the 
 * attributes reference in type of either ```value/attributes/css```, to apply as DOM attributes use ```attr-[attributesName]``` i.e 
 * ```{attr-href: 'http://somelink.com'}```, to apply as style use ```css-[cssStyleProperty]``` i.e ```{css-background-color: 'grey'}```
 * @param {object|string} - a value can be an object, string or number
 * @param {string} - ***optional*** if specified, this is the property instead, while previous argument is the attribute
 * @returns {context}
 */
Krom.prototype.set = function(value, vProp) {
  var obj, assign
  if (vProp) {
    obj = {}
    obj[value] = vProp
    if (!this.obs._state_) {
      this.obs._state_ = obj
    } else {
      assign = Object.assign(this.obs._state_, obj)
      this.obs._state_ = assign
    }
  } else {
    if (!this.obs._state_ && typeof value !== 'object') {
      obj = {}
      obj.value = value
      this.obs._state_ = obj
    } else if (!this.obs._state_ && typeof value === 'object') {
      this.obs._state_ = value
    } else if (typeof value === 'object') {
      assign = Object.assign(this.obs._state_, value)
      this.obs._state_ = assign
    } else {
      this.obs._state_ = { value: value }
    }
  }
  return this
}
},{}]},{},[1])(1)
});