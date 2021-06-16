class ExpenseItem {
  constructor(name, cost, owner = []) {
    this.name = name;
    this.cost = cost;
    this.owner = owner;
  }
}

class User {
  constructor(
    fullName,
    email,
    password,
    id,
    balance = 0,
    expenseItems = [],
    actions = []
  ) {
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.id = id;
    this.balance = balance;
    this.expenseItems = expenseItems;
    this.actions = actions;
  }
  deposit(amount) {
    if (isNaN(amount) || amount < 0) {
      alert("Invalid Amount");
    } else {
      this.balance += amount;
    }
    saveUser();
  }
  withdraw(amount) {
    if (amount > this.balance || isNaN(amount) || amount < 0) {
      alert("Invalid Amount");
    } else {
      this.balance -= amount;
    }
    saveUser();
  }
  send(id, amount) {
    if (isNaN(amount) || amount < 0 || amount > this.balance) {
      alert("Invalid Amount");
    } else {
      this.balance -= amount;

      const index = users.findIndex((user) => user.id === id);
      users[index].balance += amount;
    }
    saveUser();
  }
  addExpense(item, amount) {
    if (isNaN(amount)) {
      alert("Invalid Amount");
    } else {
      expenseItems.push(new ExpenseItem(item, amount));
      const index = expenseItems.findIndex(
        (expenseItem) => expenseItem.name === item
      );
      expenseItems[index].owner.push(this.id);
      saveItems();

      this.expenseItems.push(item);
      this.balance -= amount;
      saveUser();
    }
    this.listItems();
  }
  deleteExpense(item) {
    const index = this.expenseItems.findIndex(
      (expenseItem) => expenseItem.name === item
    );

    this.expenseItems.splice(index, 1);
    saveUser();
    getUsers();
    this.listItems();
  }
  listItems() {
    const table = document.createElement("table");
    table.id = "expense-table";

    this.expenseItems.forEach((expenseItem) => {
      const tr = document.createElement("tr");

      var td = document.createElement("td");
      const itemName = document.createElement("p");
      itemName.id = "item-name";
      itemName.textContent = expenseItem;
      td.appendChild(itemName);
      tr.appendChild(td);

      var td = document.createElement("td");
      const deleteItem = document.createElement("button");
      deleteItem.textContent = "Delete";
      deleteItem.id = "delete-button";
      deleteItem.addEventListener("click", (e) => {
        this.deleteExpense(expenseItem);
      });
      td.appendChild(deleteItem);
      tr.appendChild(td);

      table.appendChild(tr);
    });

    return table;
  }
}

let users = getUsers();

users = users.map((user) => {
  return new User(
    user.fullName,
    user.email,
    user.password,
    user.id,
    user.balance,
    user.expenseItems,
    user.actions
  );
});

let expenseItems = getItems();

expenseItems = expenseItems.map((item) => {
  return new ExpenseItem(item.name, item.cost, item.owner);
});

renderLoginForm();
