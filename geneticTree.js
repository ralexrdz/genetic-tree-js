const init = (family, s) => {
  addExtraInfo(family);

  // var s = Raphael(10, 50, 1000, 600);
  
  
  let nodesByGen = getNodesByGeneration(family);

  
  placeNodes(nodesByGen, family, s);
};

// const delay = ms => new Promise(res => setTimeout(res, ms));

const buildLine = (s, f) => {
  return s.path(f).attr({stroke: config.strokeColor, strokeWidth: config.strokeWidth}).addClass(config.className);
}

const buildNode = (s, n, x, y, w, h) => {
  
  let group = s.group()  

  let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  foreignObject.setAttribute('width', w)
  foreignObject.setAttribute('height', h)
  foreignObject.setAttribute('x', x)
  foreignObject.setAttribute('y', y)
      
  // let x = <div class="node_header">
    //     <button class="node_button">
    //     <img class="node_buttonIcon">
    //   </button>
    //   <button class="node_button">
    //     <img class="node_buttonIcon" >
    //   </button>
    // </div>
  foreignObject.innerHTML = `
    <div class="node ${n.me ? 'me': ''}">
      <div class="node_content">
        <div class="node_userpic">
          <img class="node_userpicFile" src="${n.picture ? n.picture.url : 'https://toppng.com/public/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png'}">
        </div>
        <div class="node_titles">
          <p class="title">${n.name}</p>
          <p class="subtitle"></p>
        </div>
      </div>
    </div>
  `

  group.append(foreignObject)

  if (n.motherId || n.fatherId) {
    let childConnector = buildLine(s,`M${x + (config.nodeXSize / 2)},${y + config.nodeYSize}L${x + (config.nodeXSize / 2)},${y + config.nodeYSize + (config.nodeYSpace / 2)}`)
    group.append(childConnector)
  }

}

const config = {
  nodeXSize: 330,
  nodeYSize: 130,
  nodeXSpace: 40,
  nodeYSpace: 40,
  strokeWidth: 2,
  strokeColor: "#8796D0",
  className: "node",
};



const increaseMyChildrenGen = (me, family) => {
  let children = family.filter((f) => {
    return (f.fatherId && f.fatherId == me.id) || (f.motherId && f.motherId == me.id)
  });
  
  children.forEach((c) => {
    c.gen = me.gen + 1;
    increaseMyChildrenGen(c, family);
  });
};

// includes generation calculation, if it has siblings and children
const addExtraInfo = (family) => {
  let withoutAncestors = family.filter((f) =>{
    return !f.fatherId && !f.motherId
  });
  withoutAncestors.forEach((wa) => {
    
    wa.gen = 1;
    increaseMyChildrenGen(wa, family);
  });
  let index = 0;
  let current;

  while (index < family.length) {
    let change = false;
    current = family[index];
    let children = family.filter(
      (f) => (f.fatherId  && f.fatherId == current.id) || (f.motherId && f.motherId == current.id)
    );

    
    if (children.length) {
      current.children = children.map(c => c.id)
      if (children.some(c => c.gender == 'female')) {
        current.hasDoughters = true
      } else {
        current.hasSons = true
      }
      
      let childrenGen = children.reduce((max, c) => {
        return Math.max(max, c.gen);
      }, 0);
      

      if (childrenGen - current.gen > 1) {
        current.gen++;
        change = true;
      }

      let partnersIds = children.reduce((acc, c) => {
        if (c.fatherId && c.fatherId != current.id) {
          return acc.includes(c.fatherId) ? acc : [...acc, c.fatherId];
        }
        if (c.motherId && c.motherId != current.id) {
          return acc.includes(c.motherId) ? acc : [...acc, c.motherId];
        }
        return acc;
      }, []);

      if (partnersIds.length) {
        
        current.partner = partnersIds[0];
        partnersIds.forEach((p) => {
          let partner = family.find((f) => f.id == p);
          
          if (partner.gen > current.gen) {
            current.gen = partner.gen;
            change = true;
          }
          if (partner.gen < current.gen) {
            partner.gen = current.gen;
            change = true;
          }
        });
        if (current.fatherId) {
          let father = family.find(m => m.id == current.fatherId)
          if (current.gender == 'female') {
            father.hasMarriedDoughters = true
          }
          else {
            father.hasMarriedSons = true
          }
        }
        if (current.motherId) {
          let mother = family.find(m => m.id == current.motherId)
          if (current.gender == 'female') {
            mother.hasMarriedDoughters = true
          }
          else {
            mother.hasMarriedSons = true
          }
        }
      }
    }
    let siblings = family.filter((f) => {
      if (f.id == current.id) return false;
      else
        return (
          (f.motherId && f.motherId == current.motherId) ||
          (f.fatherId && f.fatherId == current.fatherId)
        );
    });

    if (siblings.length) {
      current.siblings = siblings.map((s) => s.id);
      siblings.forEach((s) => {
        if (s.gen > current.gen) {
          current.gen = s.gen;
          change = true;
        }
        if (s.gen < current.gen) {
          s.gen = current.gen;
          change = true;
        }
      });
    }

    if (change) {
      index = 0;
    } else {
      index++;
    }
  }
  // return family
};

// divides nodes array by generation
const getNodesByGeneration = (family) => {
  let nodesByGen = family.reduce((nodes, m) => {
    if (!nodes[m.gen]) {
      nodes[m.gen] = { nodes: [m] };
    } else {
      nodes[m.gen].nodes.push(m);
    }
    return nodes;
  }, {});

  Object.keys(nodesByGen).forEach((ng) => {
    nodesByGen[ng].count = nodesByGen[ng].nodes.length;
    nodesByGen[ng].nodes = nodesByGen[ng].nodes.sort((a, b) => {
      let res = (a.fatherId || "").localeCompare(b.fatherId || "")
      if (res == 0) {
        res = (b.gender || '').localeCompare(a.gender || '')
      }
      return res
    });
  });

  return nodesByGen;
};

const placeNodes = async (nodesByGen, family, s) => {

  let longGenNum
  let longestGeneration = Object.keys(nodesByGen).reduce((longest, gen) => {
    if (!longest) return nodesByGen[gen];
    else {
      if (longest.count < nodesByGen[gen].count) {
        longGenNum = gen
        return nodesByGen[gen] 
      } else return longest
    }
  }, null);

  
  
  // Object.keys(nodesByGen).sort().reverse().forEach((g, i) => {

  let sortedLongestGen = sortLongestGeneration(longestGeneration.nodes);
  
  let row = Object.keys(nodesByGen).length + 1 - sortedLongestGen[0].gen;

  sortedLongestGen.forEach((n,i) => {
    
    let rectx = i * config.nodeXSize + config.nodeXSpace * i;
    let recty = row * config.nodeYSize + config.nodeXSpace * row;
    n.x = rectx;
    n.y = recty;
    
    buildNode(s, n, rectx, recty, config.nodeXSize, config.nodeYSize);

  })

  drawSiblingsConnectors(s, sortedLongestGen)

  drawPartnersConnectors(s, sortedLongestGen)

  drawSingleParentConnectors(s, sortedLongestGen)

  Object.keys(nodesByGen)
    .filter(g => g != longGenNum)
    .sort((a, b) => {
      return Math.abs(a - longGenNum)-Math.abs(b - longGenNum)
    })
    .forEach((gen) => {
      let hasParents = doesSomeNodesInGenHasParents(nodesByGen[gen].nodes) 
      if (!hasParents) {
        let childrenHaveLocations = everyoneHasLocations(nodesByGen[parseInt(gen)+1].nodes)
        if (childrenHaveLocations) {
          let childrenByParents = groupByParents(nodesByGen[parseInt(gen)+1].nodes)
          Object.keys(childrenByParents).filter(parentIds => parentIds != 'undefined-undefined').forEach(pId => {
            
            placeParentsUnderChildren(s, childrenByParents[pId], nodesByGen[gen].nodes.filter(n => pId.split('-').filter(p => p != 'undefined').includes(n.id) ) );

          })
        }
      } else {
        let parentsHaveLocations = everyoneHasLocations(nodesByGen[parseInt(gen)-1].nodes)
        if (parentsHaveLocations) {
          let childrenByParents2 = groupByParents(nodesByGen[gen].nodes)
          Object.keys(childrenByParents2).filter(parentIds => parentIds != 'undefined-undefined').forEach(pId => {
            
            placeChildrenAboveParents(s, childrenByParents2[pId], nodesByGen[gen-1].nodes.filter(n => pId.split('-').filter(p => p != 'undefined').includes(n.id) ) );
            drawPartnersConnectors(s, nodesByGen[gen].nodes.filter(n => n.partner))
          })
        }
        
      }

    })

};
const placeChildrenAboveParents = (s, children, parents) => {
  parents.sort((a,b) => a.gender.localeCompare(b.gender))
  let xcenter 
  if (parents.length == 1) {
    xcenter = parents[0].x + (config.nodeXSize / 2)
  } else {
    xcenter = (parents[1].x + (parents[0].x + config.nodeXSize) ) / 2
  }
  let totalChildrenWidth = (children.length * config.nodeXSize) + ((children.length - 1) * config.nodeXSpace )
  
  children.sort(sortSiblingsFunction)
  
  let y = parents[0].y - config.nodeYSize - config.nodeYSpace
  children.forEach((c, i) => {
    
    c.x = xcenter - (totalChildrenWidth / 2) + (i * (config.nodeXSize + config.nodeXSpace))
    c.y = y
    buildNode(s, c, c.x, c.y, config.nodeXSize, config.nodeYSize)
  })
  if (children.length > 1) {
    buildLine(s, `M${xcenter - (totalChildrenWidth / 2) + (config.nodeXSize / 2)},${y + config.nodeYSize + (config.nodeYSpace / 2)}L${xcenter + (totalChildrenWidth / 2) - (config.nodeXSize / 2)},${y + config.nodeYSize + (config.nodeYSpace / 2)}`)
  }

}

const placeParentsUnderChildren = (s, children, parents) => {
  let xmin = children.reduce((min, n) => {
    return Math.min(min, n.x)
  }, 999999)
  let xmax = children.reduce((max, n) => {
    return Math.max(max, n.x)
  }, 0)
  let y = children[0].y + config.nodeYSpace + config.nodeYSize
  let x = (xmin+xmax) / 2
  if (parents.length == 1) {
    // single parent
    parents[0].x = x
    parents[0].y = y
    buildNode(s, parents[0], x, y, config.nodeXSize, config.nodeYSize)
    buildLine(s, `M${(x) + (config.nodeXSize/2)},${y}L${(x) + (config.nodeXSize/2)},${y - (config.nodeYSpace / 2)}`)
  } else {
    // both parents
    let x0 = x - ((config.nodeXSize / 2) + (config.nodeXSpace / 2))
    let x1 = x + (config.nodeXSize / 2) + (config.nodeXSpace / 2)
    parents.sort((a,b) => a.gender.localeCompare(b.gender))
    parents[0].x = x0
    parents[0].y = y
    buildNode(s, parents[0], x0, y, config.nodeXSize, config.nodeYSize)
    buildNode(s, parents[1], x1 , y, config.nodeXSize, config.nodeYSize)
    buildLine(s, `M${(x) + (config.nodeXSize / 2)},${y - (config.nodeYSpace / 2)}L${(x) + (config.nodeXSize / 2)},${y + (config.nodeYSize / 2)}`)
    buildLine(s, `M${x0 + config.nodeXSize},${y + (config.nodeYSize / 2)}L${x1},${y + (config.nodeYSize / 2)}`)

  }
}

const everyoneHasLocations = gen => {
  return gen.every((m) => m.x != undefined && m.y != undefined)
}

const doesSomeNodesInGenHasParents = gen => {
  return gen.some(n => n.fatherId || n.motherId)
}

const groupByParents = (nodes) => {

  let nodesByParentsIds = {};
  nodes.forEach((n) => {
    if (nodesByParentsIds[n.fatherId+'-'+n.motherId]) nodesByParentsIds[n.fatherId+'-'+n.motherId].push(n);
    else nodesByParentsIds[n.fatherId+'-'+n.motherId] = [n];
  }, {});

  return nodesByParentsIds
}

const drawSingleParentConnectors = (s, nodes ) => {
  let singleParents = nodes.filter(n => n.children && !n.partner)
  singleParents.forEach(sp => {
    buildLine(s, `M${sp.x + (config.nodeXSize / 2)},${sp.y}L${sp.x + (config.nodeXSize / 2)},${sp.y - (config.nodeYSpace / 2)}`)
  })
  
}

const drawSiblingsConnectors = (s, nodes) => {

  let nodesByParentsIds = groupByParents(nodes)

  Object.keys(nodesByParentsIds).filter(parentIds => parentIds != 'undefined-undefined').forEach((pId) => {
    let xmin = nodesByParentsIds[pId].reduce((min, n) => {
      return Math.min(min, n.x)
    }, 999999)
    let xmax = nodesByParentsIds[pId].reduce((max, n) => {
      return Math.max(max, n.x)
    }, 0)
    if (xmin != xmax) {
      let y = nodesByParentsIds[pId][0].y
      buildLine(s, `M${xmin + (config.nodeXSize / 2)},${y + config.nodeYSize + (config.nodeYSpace / 2)}L${xmax + (config.nodeXSize / 2)},${y + config.nodeYSize + (config.nodeYSpace / 2)}`)
    }
    
  });
  
}

const drawPartnersConnectors = (s, nodes) => {

  let i = 0
  while(i < nodes.length) {
    let n = nodes[i]
    if (n.partner) {
      let partner = nodes.find(n2 => n2.id == n.partner)
      let distance = partner.x - (n.x + config.nodeXSize)
      buildLine(s, `M${n.x + config.nodeXSize},${n.y + (config.nodeYSize / 2)}L${n.x + config.nodeXSize + distance},${n.y + (config.nodeYSize / 2)}`)
      buildLine(s, `M${n.x + config.nodeXSize + (distance / 2)},${n.y + (config.nodeYSize / 2)}L${n.x + config.nodeXSize + (distance / 2)},${n.y - (config.nodeYSpace / 2)}`)
      i = i+2

    } else i++
  }

}

// arrage members of a generation to easily place its children and parents
const sortLongestGeneration = (nodes) => {

  let sortedNodes = []

  // place members who was married doughters first with partner next to and siblings on the left
  nodes.filter(n => n.hasMarriedDoughters).forEach(n => {
    
    if (!sortedNodes.map(sn => sn.id).includes(n.id)) {
      if (n.partner) {
        if (!sortedNodes.map(sn => sn.id).includes(n.partner)) {
          let partner = nodes.find(n2 => n.partner == n2.id)
          // partner next to member with married douhters
          sortedNodes.push(n.gender == 'female'? n : partner)
          sortedNodes.push(n.gender == 'female'? partner : n)
          if (partner.siblings && partner.siblings.length) {
            nodes.filter(n3 => partner.siblings.includes(n3.id)).forEach(n3 => {
              if (!sortedNodes.map(sn => sn.id).includes(partner.id)) {
                // partner siblings on the right
                sortedNodes.push(n3)
              }
            })
          }
        }
      } 
      if (n.siblings && n.siblings.length) {
        let siblings = nodes.filter(n4 => n.siblings.includes(n4.id))

        siblings
          .sort((a,b) => a.gender.localeCompare(b.gender))
          .forEach(ss => {
            if (!sortedNodes.map(sn => sn.id).includes(n.id)) {
              // siblings of memeber with married doughter on the right
              if (n.gender == 'female') sortedNodes.splice(sortedNodes.length -1 , 0, ss)
              else sortedNodes.push(ss)
            }
          })
      } else {
        if (!sortedNodes.map(sn => sn.id).includes(n.id)) {
          sortedNodes.push(n)
        }
      }
    }
  })

  nodes.filter(n => n.hasMarriedSons).forEach(n => {
    if (!sortedNodes.map(sn => sn.id).includes(n.id)) {
      if (n.partner) {
        if (!sortedNodes.map(sn => sn.id).includes(n.partner)) {
          let partner = nodes.find(n2 => n.partner == n2.id)
          // partner next to member with married douhters
          sortedNodes.push(n.gender == 'female'? n : partner)
          sortedNodes.push(n.gender == 'female'? partner : n)
          if (partner.siblings && partner.siblings.length) {
            nodes.filter(n3 => partner.siblings.includes(n3.id)).forEach(n3 => {
              if (!sortedNodes.map(sn => sn.id).includes(partner.id)) {
                // partner siblings on the right
                sortedNodes.push(n3)
              }
            })
          }
        }
      } 
      if (n.siblings && n.siblings.length) {
        let siblings = nodes.filter(n4 => n.siblings.includes(n4.id))

        siblings
          .sort((a,b) => a.gender.localeCompare(b.gender))
          .forEach(ss => {
            if (!sortedNodes.map(sn => sn.id).includes(n.id)) {
              // siblings of memeber with married doughter on the right
              if (n.gender == 'female') sortedNodes.splice(sortedNodes.length -1 , 0, ss)
              else sortedNodes.push(ss)
            }
          })
      }
    }
  })

  nodes
    .filter(n => !sortedNodes.map(sn => sn.id).includes(n.id))
    .forEach(n => {
      
      if (!sortedNodes.map(sn => sn.id).includes(n.id)) {
      // partner next to member with married doughters
        if (n.siblings && n.siblings.length) {

          let siblings = nodes.filter(n2 => n.siblings.includes(n2.id))
          siblings.push(n)
          
          siblings
            .sort(sortSiblingsFunction)
            .forEach(n2 => {
              if (!sortedNodes.map(sn => sn.id).includes(n2.id)) {
                sortedNodes.push(n2)
              }
            })

        } else {
          sortedNodes.push(n)
        }
      }
  })

  return sortedNodes
};

const sortSiblingsFunction = (a,b) => {
  let res
  if (a.gender != b.gender) {
    res = b.gender.localeCompare(a.gender)
  } else {
    if (a.children && b.children) {
      res =  a.gender == 'female' ? (a.children.length - b.children.length) : (b.children.length - a.children.length)
    } else if (a.children) {
      res =  a.gender == 'female' ? 1 : -1
    } else {
      res =  a.gender == 'female' ? -1 : 1
    }
  }
  return res
}

// module.exports = init