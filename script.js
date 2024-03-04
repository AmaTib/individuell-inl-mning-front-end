const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");
const form = document.getElementById("editForm");
const allSortIcons = document.getElementsByClassName("bi");
const pageList = document.getElementById("pager");

let currentSortCol = "id";
let currentSortOrder = "asc";
let currentSearchText = "";
let currentPageNo = 1;
let currentPageSize = 5;

function Player(id, name, jersey, team, position) {
  this.id = id;
  this.name = name;
  this.jersey = jersey;
  this.team = team;
  this.position = position;
  this.visible = true;
  this.matches = function (searchFor) {
    return (
      this.name.toLowerCase().includes(searchFor) ||
      this.position.toLowerCase().includes(searchFor) ||
      this.team.toLowerCase().includes(searchFor)
    );
  };
}

async function fetchPlayers() {
  return await (await fetch("http://localhost:3000/players")).json();
}

let players = await fetchPlayers();

const createTableTdOrTh = function (elementType, innerText) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  return element;
};

const playerName = document.getElementById("playerName");
const jersey = document.getElementById("jersey");
const position = document.getElementById("position");

let editingPlayer = null;

const onClickPlayer = function (event) {
  const htmlElementetSomViHarKlickatPa = event.target;

  const player = players.result.find(
    (p) => p.id == htmlElementetSomViHarKlickatPa.dataset.stefansplayerid
  );

  playerName.value = player.name;
  jersey.value = player.jersey;
  position.value = player.position;
  editingPlayer = player;

  MicroModal.show("modal-1");
};

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  let url = "";
  let method = "";

  var newPlayer = {
    name: playerName.value,
    jersey: jersey.value,
    position: position.value,
  };

  if (editingPlayer != null) {
    newPlayer.id = editingPlayer.id;
    url = "http://localhost:3000/players/" + newPlayer.id;
    method = "PUT";
  } else {
    url = "http://localhost:3000/players";
    method = "POST";
  }

  let response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(newPlayer),
  });

  //let json = await response.json();

  players = await fetchPlayers();
  refreshTable();
  MicroModal.close("modal-1");
});

btnAdd.addEventListener("click", () => {
  playerName.value = "";
  jersey.value = "";
  position.value = "";
  editingPlayer = null;

  MicroModal.show("modal-1");
});

async function refreshTable() {
  let offset = (currentPageNo - 1) * currentPageSize;

  let url =
    "http://localhost:3000/players?sortCol=" +
    currentSortCol +
    "&sortOrder=" +
    currentSortOrder +
    "&q=" +
    currentSearchText +
    "&limit=" +
    currentPageSize +
    "&offset=" +
    offset;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  players = await response.json();
  allPlayersTBody.innerHTML = "";

  players.result.forEach((pl) => {
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    let btn = document.createElement("button");

    btn.textContent = "EDIT";
    btn.dataset.stefansplayerid = pl.id;

    tr.appendChild(createTableTdOrTh("th", pl.name));
    tr.appendChild(createTableTdOrTh("td", pl.jersey));
    tr.appendChild(createTableTdOrTh("td", pl.position));
    td.appendChild(btn);
    tr.appendChild(td);

    btn.addEventListener("click", onClickPlayer);

    allPlayersTBody.appendChild(tr);
  });
  createPager(players.total, currentPageNo, currentPageSize);
}
await refreshTable();

//sortering-----------------------
Object.values(allSortIcons).forEach((link) => {
  link.addEventListener("click", () => {
    currentSortCol = link.dataset.sortcol;
    currentSortOrder = link.dataset.sortorder;
    refreshTable();
  });
});
//--------------------------------

//sök spelare-----------------------------
function debounce(cb, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

const updateQuery = debounce((query) => {
  currentSearchText = query;
  refreshTable();
}, 1000);

searchPlayer.addEventListener("input", (e) => {
  updateQuery(e.target.value);
});
//----------------------------------------

//paging----------------------------------
function createPager(count, pageNo, currentPageSize) {
  pageList.innerHTML = "";
  let totalPages = Math.ceil(count / currentPageSize);
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (i == pageNo) {
      li.classList.add("active");
    }
    const a = document.createElement("a");
    a.href = "#";
    a.innerText = i;
    a.classList.add("page-link");
    li.appendChild(a);
    a.addEventListener("click", () => {
      currentPageNo = i;
      refreshTable();
    });
    pageList.appendChild(li);
  }
}
//----------------------------------------

MicroModal.init({
  onShow: (modal) => console.info(`${modal.id} is shown`), // [1]
  onClose: (modal) => console.info(`${modal.id} is hidden`), // [2]

  openTrigger: "data-custom-open", // [3]
  closeTrigger: "data-custom-close", // [4]
  openClass: "is-open", // [5]
  disableScroll: true, // [6]
  disableFocus: false, // [7]
  awaitOpenAnimation: false, // [8]
  awaitCloseAnimation: false, // [9]
  debugMode: true, // [10]
});
