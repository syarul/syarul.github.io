let data = [{
  id: 0,
  index: 'home',
  url: '/home',
  data: {
    title: 'The homepage',
    desc: 'Welcome to our spectacular web page with nothing special here.',
    link: 'Contact us'
  }
}, {
  id: 1,
  index: 'about',
  url: '/about',
  data: {
    title: 'Read more about us',
    desc: 'This is the page where we describe ourselves.',
    link: 'Contact us'
  }
}, {
  id: 2,
  index: 'resource',
  url: '/resource',
  data: {
    title: 'Resources',
    desc: 'For more info visit <a href="https://github.com/syarul/krom">https://github.com/syarul/krom</a>',
    link: 'Contact us'
  }
}, {
  id: 3,
  index: 'noroute',
  url: '/noroute',
  data: {
    title: '404 Page does not exist',
    desc: 'This is the landing page when route is not found.',
    link: 'Contact us'
  }
}]

let _data = data.map(x => x)
_data.pop()

const app = new Krom

app
  .link('app', '<img src="./k.jpg"><h1>Krom.js</h1>{{menu}}{{view}}') // mind the temporary logo :))
  .set({
    'css-text-align': 'center',
    'css-margin-top': '20px'
  })

const menu = new Krom

menu.template('<ul id="menu"></ul>')
  .register('app')
  .array(_data, '<li style="padding:0 10px 0 10px"><a href="#{{url}}" onclick="updateView({{id}})">{{index}}</a></li>')
  .set({
    'css-list-style-type': 'none',
    'css-display': 'inline-flex',
    'css-cursor': 'pointer',
    'css-margin': 0,
    'css-padding': 0
  })

const view = new Krom

view
  .template('<div id="view"></div>')
  .register('app')
  .set('{{container}}')
  .set({'css-padding-top': '20px'})

const isHomePage = window.location.href.match('#')
const url = window.location.href.split('#')[1]
const idx = data.map(x => x.url).indexOf(url)
const redirect = isHomePage ? idx : 0

const container = new Krom

// show data base on url, if it does not found the hashbang return to homepage else return 404 page
container
  .register('view')
  .set(getData(redirect))

function getData(index){
  let d = index === -1 ? data[3].data : data[index].data
  let str = `<div>
              <h2>${d.title}</h2>
              <p>${d.desc}</p>
              <i><a href="mailto:hottincup@gmail.com">${d.link}</a></i>
            </div>`
  return str
}

// update page on user clicking menu link
function updateView(index){
  container.set(getData(index))
}

// if user click back/foward, update the page as well
window.onpopstate = function() {
  let url = document.location.href.split('#')[1]
  let idx = data.map(x => x.url).indexOf(url)
  container.set(getData(idx))
}