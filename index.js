
let family = [
  {
    id: '1',
    name: 'Mukti',
    gender: 'female',
    motherId: '2',
    fatherId: '3',
  },
  // {
  //   id: '0',
  //   name: 'Mukti2',
  //   gender: 'female',
  //   motherId: '2',
  //   fatherId: '3',
  // },
  // {
  //   id: '-1',
  //   name: 'Mukti3',
  //   gender: 'female',
  //   motherId: '2',
  //   fatherId: '3',
  // },
  {
    id: '2',
    name: 'Yori',
    gender: 'female',
    motherId: '4',
    fatherId: '5',
  },
  {
    id: '3',
    name: 'Ralex',
    gender: 'male',
    motherId: '6',
    fatherId: '7',
  },
  {
    id: '4',
    name: 'Mari',
    gender: 'female',
  },
  {
    id: '5',
    name: 'Dante',
    gender: 'male',
  },
  {
    id: '6',
    name: 'Lidia',
    gender: 'female',
    motherId: '14'
  },
  {
    id: '7',
    name: 'Rauli',
    gender: 'male',
    motherId: '15',
    fatherId: '17'
  },
  {
    id: '8',
    name: 'Maridan',
    gender: 'female',
    motherId: '4',
    fatherId: '5',
  },
  {
    id: '9',
    name: 'Rich',
    gender: 'male',
    motherId: '6',
    fatherId: '7',
  },
  // {
  //   id: '10',
  //   name: 'Dan',
  //   gender: 'male',
  //   motherId: '4',
  //   fatherId: '5',
  // },
  // {
  //   id: '11',
  //   name: 'Fana',
  //   gender: 'female',
  //   motherId: '6',
  //   fatherId: '7',
  // },
  // {
  //   id: '12',
  //   name: 'Salomón',
  //   gender: 'male',
  //   motherId: '4',
  //   fatherId: '5',
  // },
  // {
  //   id: '13',
  //   name: 'Mich',
  //   gender: 'female',
  //   motherId: '6',
  //   fatherId: '7',
  // },
  {
    id: '14',
    name: 'Coty',
    gender: 'female',
  },
  {
    id: '15',
    name: 'Lupita',
    gender: 'female',
  },
  {
    id: '17',
    name: 'Gumaro',
    gender: 'male',
  },
  {
    id: '16',
    name: 'Rafa',
    gender: 'male',
    motherId: '15',
    fatherId: '17'
  },
]
var s = Snap('#tree');

init(family, s);

setTimeout(() => {
  svgPanZoom('#tree')
}, 1500);
  

// var paper = Snap('#tree');

//   console.log(paper)

// Creates circle at x = 50, y = 40, with radius 10
// paper.rect(50, 40, 200, 100, 10)
//   .attr("stroke", "#E8EBF6")
//   .attr("fill", "#E8EBF6") 
//   .click(() => console.log(4))
// init(family)

// var paper = Raphael(10, 50, 1000, 600);

// // Creates circle at x = 50, y = 40, with radius 10
// paper.rect(50, 40, 200, 100, 10)
//   .attr("stroke", "#E8EBF6")
//   .attr("fill", "#E8EBF6") 
//   .click(() => console.log(4))

// let circle = paper.circle(90,90, 20)
// .attr("stroke", "#576CBE")
// .attr("stroke-width", "2px")
// .attr({fill: 'url(https://filestore.community.support.microsoft.com/api/images/c12b37db-ce79-4aa6-9c4a-4c0fa3fe3969)'})

// setTimeout(() => {
//   svgPanZoom(document.getElementsByTagName('svg')[0], {
//     zoomScaleSensitivity: 0.5
//   })

//   let patId = circle.node.getAttribute('fill').split('(')[1].split('#')[1].slice(0,-1)
//   document.getElementById(patId).removeAttribute('patternTransform')
//   document.getElementById(patId).removeAttribute('patternUnits')
//   document.getElementById(patId).removeAttribute('y')
//   document.getElementById(patId).removeAttribute('x')
//   document.getElementById(patId).setAttribute('viewBox', '0 0 100 100')
//   document.getElementById(patId).setAttribute('width', 1)
//   document.getElementById(patId).setAttribute('height', 1)
//   document.getElementById(patId).childNodes[0].setAttribute('width', 100)
//   document.getElementById(patId).childNodes[0].setAttribute('height', 100) 
// }, 1000);



