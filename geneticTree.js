const init = (family) => {
  addGenerations(family);

  // var s = Raphael(10, 50, 1000, 600);
  var s = Snap("#tree");
  setTimeout(() => {
    svgPanZoom("#tree");
  }, 2500);

  nodesByGen = getNodesByGeneration(family);

  placeNodes(nodesByGen, family, s);
};

const buildLine = (s, f) => {
  s.path(f).attr({stroke: config.strokeColor, strokeWidth: config.strokeWidth}).addClass(config.className);
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

const config = {
  nodeXSize: 330,
  nodeYSize: 130,
  nodeXSpace: 40,
  nodeYSpace: 40,
  strokeWidth: 2,
  strokeColor: "#8796D0",
  className: "node",
};

const getChildren = (personIdArrm, family) => {
  // gets All the children of an a array of persons ids
  return family.filter(
    (mm) =>
      personIdArrm.includes(mm.motherId) || personIdArrm.includes(mm.fatherId)
  );
};

const increaseMyChildrenGen = (me, family) => {
  children = family.filter((f) => f.fatherId == me.id || f.motherId == me.id);
  children.forEach((c) => {
    c.gen = me.gen + 1;
    increaseMyChildrenGen(c, family);
  });
};

const addGenerations = (family) => {
  let withoutAncestors = family.filter((f) => !f.fatherId && !f.motherId);
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
      (f) => f.fatherId == current.id || f.motherId == current.id
    );

    if (children.length) {
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
        current.partner = partnersIds;
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
      }
    }
    siblings = family.filter((f) => {
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
      return (a.fatherId || 0) - (b.fatherId || 0);
    });
  });

  return nodesByGen;
};

const placeNodes = (nodesByGen, family, s) => {
  let longestGeneration = Object.keys(nodesByGen).reduce((longest, gen) => {
    if (!longest) return nodesByGen[gen];
    else {
      return longest.count < nodesByGen[gen].count ? nodesByGen[gen] : longest;
    }
  }, null);

  // Object.keys(nodesByGen).sort().reverse().forEach((g, i) => {

  let sortedGenNodes = sortGeneration(longestGeneration.nodes);

  let row = Object.keys(nodesByGen).length + 1 - sortedGenNodes[0].gen;

  sortedGenNodes.forEach((n, i) => {
    let rectx = i * config.nodeXSize + config.nodeXSpace * i;
    let recty = row * config.nodeYSize + config.nodeXSpace * row;
    n.x = rectx;
    n.y = recty;
    
    buildNode(s, n, rectx, recty, config.nodeXSize, config.nodeYSize);

    if (n.motherId || n.fatherId) {
      // line for each child
      buildLine(s, 
        `M${rectx + config.nodeXSize / 2},${recty + config.nodeYSize}L${
          rectx + config.nodeXSize / 2
        },${recty + config.nodeYSize + config.nodeYSpace / 2 + config.strokeWidth / 2}`
      );
    }

    let children = nodesByGen[n.gen + 1]
      ? nodesByGen[n.gen + 1].nodes.filter(
          (c) => c.fatherId == n.id || c.motherId == n.id
        )
      : [];

    if (children.length && n.gender == "F") {
      let childrenx =
        n.x +
        (config.nodeXSize + config.nodeXSpace) -
        (children.length * (config.nodeXSize + config.nodeXSpace)) / 2;
      let childreny = n.y - (config.nodeYSize + config.nodeYSpace);
      placeChildren(children, row - 2, childrenx, childreny, s);
    }

    let father, mother;
    if (n.fatherId)
      father = nodesByGen[n.gen - 1].nodes.find((f) => f.id == n.fatherId);
    if (n.motherId)
      mother = nodesByGen[n.gen - 1].nodes.find((m) => m.id == n.motherId);

    if (mother || father) {
      let siblings = nodesByGen[n.gen].nodes.filter((s) =>
        n.siblings.includes(s.id)
      );
      placeParents(n, siblings, row - 1, mother, father, family, s);
    }
  });

  // })
};

const placeParents = (node, siblings, row, mother, father, family, s) => {
  let left = siblings.length
    ? siblings.reduce((min, s) => {
        return Math.min(min, s.x, node.x);
      }, 9999999)
    : node.x;
  let right =
    (siblings.length
      ? siblings.reduce((max, s) => {
          return Math.max(max, s.x, node.x);
        }, 0)
      : node.x) + config.nodeXSize;

  if (!isNaN(left) && !isNaN(right)) {
    let center = (left + right) / 2;
    let recty = node.y + row * config.nodeYSize + row * config.nodeYSpace;

    // lines joining siblings
    buildLine(s,
      `M${left + config.nodeXSize / 2 - config.strokeWidth / 2},${recty - config.nodeYSpace / 2}L${
        right - config.nodeXSize / 2 + config.strokeWidth / 2
      },${recty - config.nodeYSpace / 2}`
    );
    buildLine(s, 
      `M${center},${recty - config.nodeYSpace / 2 - config.strokeWidth / 2}L${center},${
        recty + config.nodeYSize / 2 + config.strokeWidth / 2
      }`
    );

    if (mother && !father) {
      mother.x = center - config.nodeXSize / 2;
      mother.y = recty;
      buildNode(s, mother,
        center - config.nodeXSize / 2,
        recty,
        config.nodeXSize,
        config.nodeYSize
      );

      // line joining
      buildLine(s, `M${center},${recty}L${center},${recty - config.nodeYSpace}`);
    } else if (father && !mother) {
      father.x = center - config.nodeXSize / 2;
      father.y = recty;
      buildNode(s, father,
        center - config.nodeXSize / 2,
        recty,
        config.nodeXSize,
        config.nodeYSize
      );

      // line joining
      buildLine(s, `M${center},${recty}L${center},${recty - config.nodeYSpace}`);
    } else {
      if (right - left > config.nodeXSize * 2 + config.nodeXSpace) {
        left = center - (config.nodeXSize + config.nodeXSpace / 2);
        right = center + (config.nodeXSize + config.nodeXSpace / 2);
      }

      mother.x = left;
      mother.y = recty;
      buildNode(s, mother, left, recty, config.nodeXSize, config.nodeYSize);

      // line joining parents
      buildLine(s,
        `M${left + config.nodeXSize},${recty + config.nodeYSize / 2}L${right - config.nodeXSize},${
          recty + config.nodeYSize / 2
        }`
      );

      father.x = right - config.nodeXSize;
      father.y = recty;
      buildNode(s, father,
        right - config.nodeXSize,
        recty,
        config.nodeXSize,
        config.nodeYSize
      );
    }

    if (mother) {
      console.log("mother", mother);
      let motherSiblings = mother.siblings
        ? family.filter((m) => mother.siblings.includes(m.id))
        : [];
      let motherMother = family.find(
        (m) => mother.motherId && mother.motherId == m.id
      );
      let motherFather = family.find(
        (m) => mother.fatherId && mother.fatherId == m.id
      );
      console.log("motherSiblings", motherSiblings);
      console.log("motherMother", motherMother);
      console.log("motherFather", motherFather);

      if (motherMother || motherFather)
        placeParents(
          mother,
          motherSiblings,
          row,
          motherMother,
          motherFather,
          family,
          s
        );
    }
  }
};

const placeChildren = (children, row, x, y, s) => {
  let left = 99999999;
  let right = 0;
  let recty =
    y + row * (config.nodeYSize + config.nodeYSpace) + row * config.nodeYSpace;
  children.forEach((ch, chi) => {
    let rectx = x + chi * config.nodeXSize + config.nodeXSpace * chi;
    ch.x = rectx;
    ch.y = recty;
    buildNode(s, ch, rectx, recty, config.nodeXSize, config.nodeYSize);

    // line for each child
    buildLine(s, 
      `M${rectx + config.nodeXSize / 2},${recty + config.nodeYSize}L${
        rectx + config.nodeXSize / 2
      },${recty + config.nodeYSize + config.nodeYSpace / 2 + config.strokeWidth / 2}`
    )

    left = Math.min(left, rectx);
    right = Math.max(right, rectx + config.nodeXSize);
  });

  let center = (right + left) / 2;

  // lines joining parents
  buildLine(s,
    `M${center},${recty + config.nodeYSize + config.nodeYSpace / 2}L${center},${
      recty + config.nodeYSize + config.nodeYSpace + config.nodeYSize / 2
    }`
  );

  buildLine(s, 
    `M${center - config.nodeXSpace / 2},${
      recty + config.nodeYSize + config.nodeYSpace + config.nodeYSize / 2
    }L${center + config.nodeYSpace / 2},${
      recty + config.nodeYSize + config.nodeYSpace + config.nodeYSize / 2
    }`
  );

  // line joining siblings
  buildLine(s, 
    `M${left + config.nodeXSize / 2 - config.strokeWidth / 2},${
      recty + config.nodeYSize + config.nodeYSpace / 2
    }L${right - config.nodeXSize / 2 + config.strokeWidth / 2},${
      recty + config.nodeYSize + config.nodeYSpace / 2
    }`
  );
};

const sortGeneration = (nodes) => {
  let nodesByfatherIds = {};
  nodes.forEach((n) => {
    if (nodesByfatherIds[n.fatherId]) nodesByfatherIds[n.fatherId].push(n);
    else nodesByfatherIds[n.fatherId] = [n];
  }, {});

  let res = [];

  Object.keys(nodesByfatherIds).forEach((fId) => {
    res = [
      ...res,
      ...nodesByfatherIds[fId].sort((a, b) => {
        // return a.gender.localeCompare(b.gender)
        if (a.gender != b.gender) {
          return b.gender.localeCompare(a.gender);
        } else {
          if (b.children && a.children) {
            b.children.length - a.children.length;
          } else {
            if (b.children && !a.children) return a.gender == "M" ? 1 : -1;
            else return a.gender == "M" ? -1 : 1;
          }
        }
      }),
    ];
  });

  return res;
};
