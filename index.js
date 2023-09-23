let family = [
  {
    id: 1,
    name: "Mukti",
    gender: "F",
    motherId: 2,
    fatherId: 3,
  },
  {
    id: 0,
    name: "Mukti2",
    gender: "F",
    motherId: 2,
    fatherId: 3,
  },
  {
    id: -1,
    name: "Mukti3",
    gender: "F",
    motherId: 2,
    fatherId: 3,
  },
  {
    id: 2,
    name: "Yori",
    gender: "F",
    motherId: 4,
    fatherId: 5,
  },
  {
    id: 3,
    name: "Ralex",
    gender: "M",
    motherId: 6,
    fatherId: 7,
  },
  {
    id: 4,
    name: "Mari",
    gender: "F",
  },
  {
    id: 5,
    name: "Dante",
    gender: "M",
  },
  {
    id: 6,
    name: "Lidia",
    gender: "F",
    motherId: 14,
  },
  {
    id: 7,
    name: "Rauli",
    gender: "M",
  },
  {
    id: 8,
    name: "Maridan",
    gender: "F",
    motherId: 4,
    fatherId: 5,
  },
  {
    id: 9,
    name: "Rich",
    gender: "M",
    motherId: 6,
    fatherId: 7,
  },
  {
    id: 10,
    name: "Dan",
    gender: "M",
    motherId: 4,
    fatherId: 5,
  },
  {
    id: 11,
    name: "Fana",
    gender: "F",
    motherId: 6,
    fatherId: 7,
  },
  {
    id: 12,
    name: "Salomón",
    gender: "M",
    motherId: 4,
    fatherId: 5,
  },
  {
    id: 13,
    name: "Mich",
    gender: "F",
    motherId: 6,
    fatherId: 7,
  },
  {
    id: 14,
    name: "Coty",
    gender: "F",
  },
];


  const config = {
    placeholder: "#tree",
    nodeXSize: 330,
    nodeYSize: 130,
    nodeXSpace: 40,
    nodeYSpace: 40,
    strokeWidth: 2,
    strokeColor: "#8796D0",
    lineClassName: "node",
  };

  var s = Snap(config.placeholder);
  setTimeout(() => {
    svgPanZoom(config.placeholder);
  }, 2500);

  init(s, family, (item) => {
    return `
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
            <p class="title">${item.name}</p>
            <p class="subtitle"></p>
          </div>
        </div>
      </div>`;
  },
    config
  )