const init = (family) => {
  addGenerations(family)

  // var s = Raphael(10, 50, 1000, 600);
  var s = Snap('#tree');
  setTimeout(() => {
    svgPanZoom('#tree')
  }, 2500);

  nodesByGen = getNodesByGeneration(family)

  placeNodes(nodesByGen, family, s)
  
}

const confing = {
  nodeWidth: 200,
  nodeHeight: 100,
}

const buildNode = (s, n, x, y, w, h) => {
  let group = s.group()

  let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  foreignObject.setAttribute('width', w)
  foreignObject.setAttribute('height', h)
  foreignObject.setAttribute('x', x)
  foreignObject.setAttribute('y', y)
      
  foreignObject.innerHTML = `
    <div class="node">
      <div class="node_header">
        <button class="node_button">
          <img class="node_buttonIcon">
        </button>
        <button class="node_button">
          <img class="node_buttonIcon">
        </button>
      </div>
      <div class="node_content">
        <div class="node_userpic">
          <img class="node_userpicFile">
        </div>
        <div class="node_titles">
          <p class="title">${n.name}</p>
          <p class="subtitle"></p>
        </div>
      </div>
    </div>
  `

  group.append(foreignObject)

}

const getChildren = (personIdArrm, family) => {
  // gets All the children of an a array of persons ids
  return family.filter(mm => personIdArrm.includes(mm.motherId)  || personIdArrm.includes(mm.fatherId) )
}

const increaseMyChildrenGen = (me, family) => {
  children = family.filter(f => f.fatherId == me.id || f.motherId == me.id)
  children.forEach(c => {
    c.gen = me.gen + 1
    increaseMyChildrenGen(c, family)
  }) 
}

const addGenerations = (family) => {
  let withoutAncestors = family.filter(f => !f.fatherId && !f.motherId)
  withoutAncestors.forEach(wa => {
    wa.gen = 1
    increaseMyChildrenGen(wa, family)
  })
  let index = 0
  let current 

  while (index < family.length) {
    let change = false
    current = family[index]
    let children = family.filter(f => f.fatherId == current.id || f.motherId == current.id)
    
    if (children.length) {
      let childrenGen = children.reduce((max, c) => {
        return Math.max(max, c.gen)
      }, 0)

      if (childrenGen - current.gen > 1) {
        current.gen++
        change = true
      }
      
      let partnersIds = children.reduce((acc, c) => {
        if (c.fatherId && c.fatherId != current.id) {
          return acc.includes(c.fatherId) ? acc : [...acc, c.fatherId]
        } 
        if (c.motherId && c.motherId != current.id) {
          return acc.includes(c.motherId) ? acc : [...acc, c.motherId]
        } 
        return acc
      }, [])

      if (partnersIds.length) {
        current.partner = partnersIds
        partnersIds.forEach(p => {
          let partner = family.find(f => f.id == p)
          if (partner.gen > current.gen) {
            current.gen = partner.gen
            change = true
          }
          if (partner.gen < current.gen) {
            partner.gen = current.gen 
            change = true
          } 
        } )
      }
    }
    siblings = family.filter(f => {
      if (f.id == current.id) return false
      else return ((f.motherId && f.motherId == current.motherId) || (f.fatherId && f.fatherId == current.fatherId))
    })
    
    if (siblings.length) {
      current.siblings = siblings.map(s => s.id)
      siblings.forEach(s => {
        if (s.gen > current.gen) {
          current.gen = s.gen
          change = true
        }
        if (s.gen < current.gen) {
          s.gen = current.gen 
          change = true
        } 
      } )
    }

    if (change) {
      index = 0
    } else {
      index++
    }
  }
  // return family
} 

const getNodesByGeneration = (family) => {
  let nodesByGen = family.reduce((nodes, m) => {
    if (!nodes[m.gen]) {
      nodes[m.gen] = {nodes: [m]}
    } else {
      nodes[m.gen].nodes.push(m)
    }
    return nodes
  }, {}) 
  
  Object.keys(nodesByGen).forEach(ng => {
    nodesByGen[ng].count = nodesByGen[ng].nodes.length
    nodesByGen[ng].nodes = nodesByGen[ng].nodes.sort((a,b) => {
      return (a.fatherId || 0) - (b.fatherId || 0)
    })
  })
  
  return nodesByGen
}

const placeNodes = (nodesByGen, family, s) => {

  let longestGeneration = Object.keys(nodesByGen).reduce((longest, gen) => {
    if (!longest) return nodesByGen[gen]
    else {
      return longest.count < nodesByGen[gen].count ? nodesByGen[gen] : longest  
    } 
  }, null)
    
    // Object.keys(nodesByGen).sort().reverse().forEach((g, i) => {
    
  let sortedGenNodes = sortGeneration(longestGeneration.nodes)
  
  let row = Object.keys(nodesByGen).length + 1 - sortedGenNodes[0].gen
  
 
  sortedGenNodes.forEach((n, i) => {
    
    let rectx = (i * 200) + (30 * i)
    let recty = (row * 100) + (40 * row)
    n.x = rectx
    n.y = recty
    
    buildNode(s, n, rectx, recty, 200, 100)

    if (n.motherId || n.fatherId) {
      // line for each child
      s.path(`M${rectx+100},${recty+100}L${rectx+100},${recty+120}`).attr({stroke: 'black', strokeWidth: '4'})
    }

    let children = nodesByGen[n.gen + 1] ? nodesByGen[n.gen + 1].nodes.filter(c => c.fatherId == n.id || c.motherId == n.id ) : []

    if (children.length && n.gender == 'F') {
      let childrenx = n.x + 230 - (children.length * 115)
      let childreny = n.y - 140
      placeChildren(children, row - 2, childrenx, childreny, s)
    }

    let father, mother
    if (n.fatherId) father = nodesByGen[n.gen - 1].nodes.find(f => f.id == n.fatherId)
    if (n.motherId) mother = nodesByGen[n.gen - 1].nodes.find(m => m.id == n.motherId)
    

    if (mother || father) {
      let siblings = nodesByGen[n.gen].nodes.filter(s => n.siblings.includes(s.id))
      placeParents(n,siblings, row -1  , mother, father, family, s)
    }
  })
  

  // })

}

const placeParents = (node, siblings, row, mother, father, family ,s) => {
  let left = siblings.length ? siblings.reduce((min, s) => {
    return Math.min(min, s.x, node.x)
  }, 9999999) : node.x
  let right = (siblings.length ? siblings.reduce((max, s) => {
    return Math.max(max, s.x, node.x)
  }, 0) : node.x) + 200

  if (!isNaN(left) && !isNaN(right)) {
    let center = (left + right) / 2
    let recty = node.y + (row * 100) + (row * 40)

    // lines joining siblings
    s.path(`M${left+100},${recty-20}L${right-100},${recty-20}`).attr({stroke: 'black', strokeWidth: '4'})
    s.path(`M${center},${recty-20}L${center},${recty+50}`).attr({stroke: 'black', strokeWidth: '4'})

    if ((mother && !father)) {
      mother.x = center - 100
      mother.y = recty
      // s.rect(center - 100, recty, 200, 100)
      // s.text(center - 90, recty + 30, mother.name).attr({fill: 'white'})

      buildNode(s, mother, center - 100, recty, 200, 100)

      // line joining
      s.path(`M${center},${recty}L${center},${recty-40}`).attr({stroke: 'black', strokeWidth: '4'})
    }
    else if ((father && !mother)) {
      father.x = center - 100
      father.y = recty
      // s.rect(center - 100, recty, 200, 100)
      // s.text(center - 90, recty + 30, father.name).attr({fill: 'white'})

      buildNode(s, father, center - 100, recty, 200, 100)

      // line joining
      s.path(`M${center},${recty}L${center},${recty-40}`).attr({stroke: 'black', strokeWidth: '4'})
    }
    else {

      if (right-left > 440) {
        left = center - 220
        right = center+220
      }
      mother.x = left
      mother.y = recty
      // s.rect( left, recty , 200, 100)
      // s.text( left + 10, recty + 30, mother.name).attr({fill: 'white'})

      buildNode(s, father, left, recty , 200, 100)
      
      // line joining parents
      s.path(`M${left+200},${recty+50}L${right},${recty+50}`).attr({stroke: 'black', strokeWidth: '4'})

      father.x = right-200
      father.y = recty
      // s.rect( right-200, recty , 200, 100)
      // s.text( right-190, recty + 30, father.name).attr({fill: 'white'})

      buildNode(s, father, right-200, recty , 200, 100)
    }

    if (mother) {
      console.log('mother', mother)
      let motherSiblings = mother.siblings ? family.filter(m => mother.siblings.includes(m.id)) : []
      let motherMother = family.find(m => mother.motherId && mother.motherId == m.id)
      let motherFather = family.find(m => mother.fatherId && mother.fatherId == m.id)
      console.log('motherSiblings', motherSiblings );
      console.log('motherMother', motherMother );
      console.log('motherFather', motherFather );
      
      if (motherMother || motherFather) placeParents(mother, motherSiblings, row , motherMother, motherFather, family, s )
    }
    
    
  } 
  
}

const placeChildren = (children, row, x, y, s) => {


  
  let left = 99999999
  let right = 0
  let recty = y + (row * 140) + (row  * 40)
  children.forEach((ch, chi) => {
    let rectx = x + (chi * 200) + (30 * chi)
    ch.x = rectx
    ch.y = recty
    // s.rect( rectx, recty , 200, 100)
    // s.text( rectx + 10, recty + 30, ch.name).attr({fill: 'white'})

    buildNode(s, ch, rectx, recty , 200, 100)

    // line for each child
    s.path(`M${rectx+100},${recty+100}L${rectx+100},${recty+120}`).attr({stroke: 'black', strokeWidth: '4'})

    left = Math.min(left, rectx)
    right = Math.max(right, rectx+200)
  })
  
  let center = (right + left) / 2

  //lines joining parents
  s.path(`M${center},${recty+120}L${center},${recty+190}`).attr({stroke: 'black', strokeWidth: '4'})
  s.path(`M${center-15},${recty+190}L${center+20},${recty+190}`).attr({stroke: 'black', strokeWidth: '4'})

  // line joining siblings
  s.path(`M${left+100},${recty+120}L${right-100},${recty+120}`).attr({stroke: 'black', strokeWidth: '4'})
} 

const sortGeneration = (nodes) => {
  let nodesByfatherIds = {}
  nodes.forEach(n => {
    if (nodesByfatherIds[n.fatherId])
      nodesByfatherIds[n.fatherId].push(n) 
    else
      nodesByfatherIds[n.fatherId] = [n]
  },{})

  let res = []

  Object.keys(nodesByfatherIds).forEach(fId => {
    res = [
      ...res, 
      ...nodesByfatherIds[fId].sort((a,b) => {
        // return a.gender.localeCompare(b.gender)
        if (a.gender != b.gender) {
          return b.gender.localeCompare(a.gender)
        } else {
          if (b.children && a.children) {
            b.children.length - a.children.length
          } else {
            if (b.children && !a.children) return a.gender == 'M' ? 1 : -1
            else return a.gender == 'M' ? -1 : 1
          }
        }
      }) 
    ]
  }) 

  return res

}
