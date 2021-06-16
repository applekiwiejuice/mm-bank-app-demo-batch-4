let users = JSON.parse(localStorage.getItem("users")) || [];

function saveUser() {
  localStorage.setItem("users", JSON.stringify(users));
}

function renderUsers() {
  const userEntryPoint = document.getElementById("entryPoint");
  userEntryPoint.textContent = "";

  if (users.length !== 0) {
    if (document.getElementById("welcome")) {
      document.getElementById("welcome").remove();
    }

    users.forEach((user) => {
      createCard(user.name, user.userPhoto, user.balance, user.userID);
    });
  }
}

renderUsers();

function deposit(userID) {
  const indexOfUser = users.findIndex((user) => {
    return user.userID === userID;
  });

  const depositAmount = Number(prompt("Deposit Amount: "));

  users[indexOfUser].balance += depositAmount;
}

function withdraw(userID) {
  const indexOfUser = users.findIndex((user) => {
    return user.userID === userID;
  });

  const withdrawAmount = Number(prompt("Withdraw Amount: "));

  users[indexOfUser].balance -= withdrawAmount;
}

function send(senderID, receiverID, amount) {
  const indexOfSender = users.findIndex((user) => {
    return user.userID === senderID;
  });

  const indexOfReceiver = users.findIndex((user) => {
    return user.userID === receiverID;
  });

  users[indexOfSender].balance -= amount;
  users[indexOfReceiver].balance += amount;
}

function editUser(userID) {
  const userIndex = users.findIndex((user) => {
    return user.userID === userID;
  });

  console.log(userIndex);

  const name = prompt("Name:");

  users[userIndex].name = name;
}

function deleteUser(userID) {
  const user = users.findIndex((user) => {
    return user.userID === userID;
  });

  users.splice(user, 1);
}

function createCard(user, userPhoto, balance, userID) {
  let userEntryPoint = document.getElementById("entryPoint");
  let colMd4 = document.createElement("div");
  colMd4.className = "col-md-4";
  colMd4.id = userID;

  let card = document.createElement("div");
  card.className = "card";

  let bgImage = document.createElement("div");
  bgImage.className = "bg-image hover-overlay ripple";
  let att = document.createAttribute("data-mdb-ripple-color");
  att.value = "light";
  bgImage.setAttributeNode(att);

  let image = document.createElement("img");
  image.className = "img-fluid img-circle mt-1 loading";
  image.src = userPhoto;

  let anchor = document.createElement("a");
  anchor.href = "#!";

  let mask = document.createElement("div");
  mask.className = "mask";
  mask.style.backgroundColor = "rgba(251, 251, 251, 0.15)";

  let cardBody = document.createElement("div");
  cardBody.className = "card-body";

  let cardTitle = document.createElement("h5");
  cardTitle.innerText = user; //Username goes here
  cardTitle.className = "card-title";

  let cardText = document.createElement("p");
  cardText.innerText = "Balance: $" + balance; //Balance goes here
  cardText.className = "card-title";

  let depositButton = document.createElement("a");
  depositButton.innerText = "Deposit";
  depositButton.className = "btn btn-light m-1";
  depositButton.href = "#!";

  depositButton.addEventListener("click", (e) => {
    deposit(userID);
    saveUser();
    renderUsers();
  });

  let withdrawButton = document.createElement("a");
  withdrawButton.innerText = "Withdraw";
  withdrawButton.className = "btn btn-light m-1";
  withdrawButton.href = "#!";

  withdrawButton.addEventListener("click", (e) => {
    withdraw(userID);
    saveUser();
    renderUsers();
  });

  let sendButton = document.createElement("a");
  sendButton.innerText = "Send";
  sendButton.className = "btn btn-light m-1";
  sendButton.href = "#!";

  sendButton.addEventListener("click", (e) => {
    const receiverName = prompt("Name of Receiver: ");
    const indexOfReceiver = users.findIndex((user) => {
      return user.name === receiverName;
    });

    const amount = Number(prompt("Amount: "));

    send(userID, users[indexOfReceiver].userID, amount);
    saveUser();
    renderUsers();
  });

  let editButton = document.createElement("a");
  editButton.innerText = "Edit";
  editButton.className = "btn btn-light m-1";
  editButton.href = "#!";

  editButton.addEventListener("click", (e) => {
    editUser(userID);
    saveUser();
    renderUsers();
  });

  let deleteButton = document.createElement("a");
  deleteButton.innerText = "Delete";
  deleteButton.className = "btn btn-light m-1";

  deleteButton.addEventListener("click", (e) => {
    deleteUser(userID);
    saveUser();
    renderUsers();
  });

  userEntryPoint.appendChild(colMd4);
  colMd4.appendChild(card);
  card.appendChild(bgImage);
  bgImage.appendChild(image);
  bgImage.appendChild(anchor);
  anchor.appendChild(mask);
  card.appendChild(cardBody);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);
  cardBody.appendChild(depositButton);
  cardBody.appendChild(withdrawButton);
  cardBody.appendChild(sendButton);
  cardBody.appendChild(editButton);
  cardBody.appendChild(deleteButton);
}

// Creates New User Card
function Create_user(user, userPhoto, balance, userID) {
  users.push({
    name: user,
    userPhoto: userPhoto,
    balance: 0,
    userID: userID,
  });

  saveUser();
  renderUsers();
}

// Button Click Listeners
document
  .getElementById("createUserButton")
  .addEventListener("click", function () {
    if (document.getElementById("welcome")) {
      document.getElementById("welcome").remove();
    }
  });

let uniqueIdentifier = 0;
document.getElementById("createButton").addEventListener("click", function () {
  console.log("createButton clicked!");
  let userNameValue = document.getElementById("username").value;
  let isMale = document.getElementById("male").checked;
  let isFemale = document.getElementById("female").checked;
  let randomImageAPI = "";

  if (isMale === true) {
    randomImageAPI = "https://randomuser.me/api/?gender=" + "male";
  }
  if (isFemale === true) {
    randomImageAPI = "https://randomuser.me/api/?gender=" + "female";
  }

  fetch(randomImageAPI)
    .then((res) => res.json())
    .then((user) => {
      let randomImageLink = user.results[0].picture.large;

      // let balanceValue = document.getElementById("balance").value;
      // let randomImageLink = "https://loremflickr.com/320/320/paris,girl/all";
      let balanceValue = "";
      uniqueIdentifier += 1;
      if (
        userNameValue === ""
        // || balanceValue === ""
      ) {
        console.log("Input Fields Empty");
      } else {
        // Create_user(
        //   userNameValue,
        //   randomImageLink,
        //   balanceValue,
        //   userNameValue + uniqueIdentifier
        // );
        userCreation(
          userNameValue,
          randomImageLink,
          balanceValue,
          userNameValue + uniqueIdentifier
        );
        // randomImageAPI = "";
      }
    });
});

function userCreation(name, image, bal, uniID) {
  let isApproved;
  console.log(image);
  users.forEach((user) => {
    if (name === user.name) {
      console.log("Username already existed!");
      isApproved = false;
    } else {
      isApproved = true;
    }
  });

  if (isApproved === true || users.length === 0) {
    Create_user(name, image, bal, uniID);
  }
}

window.addEventListener("storage", (e) => {
  users = JSON.parse(localStorage.getItem("users")) || [];
  renderUsers();
});
