require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const app = express();
const MemoryStore = require("memorystore")(session);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    secret: "mandmbank",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_PASSWORD, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const expenseItemsSchema = new mongoose.Schema({ name: String });
const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  balance: Number,
  expenseItems: [expenseItemsSchema],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_G,
      clientSecret: process.env.CLIENT_SECRET_G,
      callbackURL: "https://mm-bank-app.herokuapp.com/auth/google/user",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      console.log(profile._json.email);
      User.findOrCreate(
        {
          googleId: profile.id,
        },
        {
          username: profile._json.email,
          fullName: profile.displayName,
          balance: 0,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB,
      clientSecret: process.env.CLIENT_SECRET_FB,
      callbackURL: "https://mm-bank-app.herokuapp.com/auth/facebook/user",
      enableProof: true,
      profileFields: [
        "id",
        "email",
        "gender",
        "link",
        "locale",
        "name",
        "timezone",
        "updated_time",
        "verified",
      ],
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate(
        { facebookId: profile.id },
        {
          username: profile._json.email,
          fullName: `${profile.name.givenName} ${profile.name.familyName}`,
          balance: 0,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/user",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/user");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/user",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/user");
  }
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

let isAdmin = false;
app.get("/admin", (req, res) => {
  if (isAdmin === true) {
    User.find(function (err, foundUsers) {
      if (err) {
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("admin", { allUsers: foundUsers });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Deposit
app.post("/deposit", (req, res) => {
  const amountToDeposit = req.body.deposit;

  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.balance += parseFloat(amountToDeposit);
        foundUser.save(function () {
          res.redirect("/user");
        });
      }
    }
  });
});

//Withdraw
app.post("/withdraw", (req, res) => {
  const amountToWithdraw = req.body.withdraw;

  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.balance -= parseFloat(amountToWithdraw);
        if (foundUser.balance <= 0) {
          foundUser.balance = 0;
        }
        foundUser.save(function () {
          res.redirect("/user");
        });
      }
    }
  });
});

//Send
app.post("/send", (req, res) => {
  const amountToSend = req.body.amountToSend;
  const receiver = req.body.receiver;
  const currentUserID = req.user.id;
  const currentUserBalance = req.user.balance;

  if (currentUserBalance > amountToSend) {
    updateCurrentUserBalance();
  } else {
    console.log("Insufficient Balance");
    res.redirect("/user");
  }

  function sendMoney() {
    User.findOne({ username: receiver }, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.balance += parseFloat(amountToSend);
          foundUser.save();
        }
      }
    });
  }

  function updateCurrentUserBalance() {
    User.findById(currentUserID, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          sendMoney();
          foundUser.balance -= parseFloat(amountToSend);
          foundUser.save(function () {
            res.redirect("/user");
          });
        }
      }
    });
  }
});
//END of Send

app.get("/user", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          console.log(foundUser);
          res.render("user", {
            fullname: foundUser.fullName,
            username: foundUser.username,
            balance: foundUser.balance.toFixed(2),
          });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  User.register(
    { fullName: req.body.fullname, username: req.body.username, balance: 0 },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/user");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.email,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", {})(req, res, function () {
        if (req.body.username === "manager@mmbank.com") {
          isAdmin = true;
          res.redirect("/admin");
        } else {
          res.redirect("/user");
        }
      });
    }
  });
});

app.get("/logout", function (req, res) {
  isAdmin = false;
  req.logout();
  res.redirect("/");
});

//ADMIN DASHBOARD BUTTONS
app.get("/deposit/:id", function (req, res) {
  console.log(req.params.id);
  res.redirect("/admin");
});

app.get("/withdraw/:id", function (req, res) {
  console.log(req.params.id);
  res.redirect("/admin");
});

app.get("/send/:id", function (req, res) {
  console.log(req.params.id);
  res.redirect("/admin");
});

app.get("/edit/:id", function (req, res) {
  console.log(req.params.id);
  res.redirect("/admin");
});

app.get("/delete/:id", function (req, res) {
  User.findByIdAndDelete(req.params.id, function (err) {
    if (err) console.log(err);
    console.log("Successfully deleted: " + req.params.id);
  });
  res.redirect("/admin");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server started! on " + port);
});
