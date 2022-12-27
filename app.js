//jshint esversion:6

// var string = "2021-04-26T14:40:16.461Z";    <------ to display date in right format
// var string2 = string.split('T')[0];

// console.log(string.split('T')[0]);
// var splitString = string2.split("-");

// var reverseArray = splitString.reverse();

// var joinArray = reverseArray.join("/");
// console.log(joinArray);

function convToShortDate(str) {
  // var string = "2021-04-26T14:40:16.461Z";    <------ to display date in right format
  var string2 = string.split("T")[0];

  console.log(string.split("T")[0]);
  var splitString = string2.split("-");

  var reverseArray = splitString.reverse();

  var joinArray = reverseArray.join("/");
  return joinArray;
}

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session");
const { noConflict } = require("lodash");
const saltRounds = 11;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// var customPhoneNo = null;    <--- never used them
// var customerName = null;

mongoose.connect(
  "mongodb+srv://admin-omkar:Omkar@1301@cluster0.ytoxl.mongodb.net/tiffinDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "NAME required"],
  },
  phoneNo: {
    type: String,
    minLength: 10,
    maxLength: 10,
    required: [true, "PHONE NUMBER required"],
    unique: [true, "user with the phone number already exists"],
  },
  address: {
    type: String,
    required: [true, "ADDRESS required"],
  },
  password: {
    type: String,
    required: [true, "PASSWORD required"],
  },
  role: {
    type: String,
    default: "customer",
  },
});

const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema({
  itemId: String,
  itemName: String,
  itemPrice: Number,
  itemAvail: Boolean,
});

const Item = mongoose.model("Item", itemSchema);

// const item = new Item({
//   itemId: "item0027",
//   itemName: "stroberry milk shake",
//   itemPrice: 80

// });

// item.save();

function date() {
  var date = new Date();
  // date.setDate(date.getDate() + no. of days);
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  var isodate = date.toISOString();

  var string2 = isodate.split("T")[0];

  var splitString = string2.split("-");

  var reverseArray = splitString.reverse();

  return reverseArray.join("/");
}

const orderSchema = new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  customerId: String,
  orderDate: {
    type: String,
    default: date(),
  },
  orderList: itemSchema,
  payment: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model("Order", orderSchema);

// Order.deleteOne({_id : 5f9eab7caa0a5a0ad821b70c"}, function(err){        <------ just in case to delete wrong orders
//   if(err)
//      console.log(err);
//      else
//      console.log("Successfully deleted one item");
// });

app.get("/", function (req, res) {
  // res.render("categories");
  res.render("landing-page");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/error", function (req, res) {
  res.render("error");
});

app.post("/change-avail-admin", async function (req, res) {
  const ItemId = req.body.clickedItemId;

  console.log(typeof req.body.clickedItemId);
  console.log(typeof req.body.itemStatus);
  console.log("itemid : " + ItemId);
  var changeItemStatus;
  if (req.body.itemStatus === "true") {
    changeItemStatus = false;
  } else {
    changeItemStatus = true;
  }

  const foundItem = await Item.updateOne(
    {
      itemId: req.body.clickedItemId,
    },
    {
      itemAvail: changeItemStatus,
    }
  );

  res.send("changed status");
});

app.post("/admin-view", async function (req, res) {
  var customers;
  var ordersArray = [];

  await User.find(
    {
      role: "customer",
    },
    function (err, foundUsers) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundUsers);
        customers = foundUsers;
      }
    }
  );

  for (var i = 0; i < customers.length; i++) {
    await Order.find(
      {
        customerId: customers[i].phoneNo,
      },
      function (err, foundOrders) {
        if (err) {
          console.log(err);
        } else {
          ordersArray.push(foundOrders);
        }
      }
    );
  }

  res.render("orders-details", {
    foundOrders: ordersArray,
    customers: customers,
    customerCount: customers.length,
  });
});

app.post("/custom-date-orders-details", async function (req, res) {
  var dd = req.body.dd;
  var mm = req.body.mm;
  var yyyy = req.body.yyyy;

  if (dd.length == 1) {
    dd = "0" + dd;
  }

  if (mm.length == 1) {
    mm = "0" + mm;
  }

  if (yyyy.length == 4) {
    const ordersDate = dd + "/" + mm + "/" + yyyy;
    var customers;
    var ordersArray = [];

    await User.find(
      {
        role: "customer",
      },
      function (err, foundUsers) {
        if (err) {
          console.log(err);
        } else {
          console.log(foundUsers);
          customers = foundUsers;
        }
      }
    );

    for (var i = 0; i < customers.length; i++) {
      await Order.find(
        {
          customerId: customers[i].phoneNo,
          orderDate: ordersDate,
        },
        function (err, foundOrders) {
          if (err) {
            console.log(err);
          } else {
            ordersArray.push(foundOrders);
          }
        }
      );
    }

    res.render("orders-details", {
      foundOrders: ordersArray,
      customers: customers,
      customerCount: customers.length,
    });
  } else {
    res.send("Enter correct date format");
  }
});

app.post("/server", async function (req, res) {
  const resArray = req.body.myArray;
  const phoneNo = req.body.phoneNo;
  console.log(phoneNo);
  console.log("Into the server side");

  if (resArray.length > 0) {
    console.log(resArray);

    for (var i = 0; i < resArray.length; i++) {
      await Item.findOne(
        {
          itemId: {
            $eq: resArray[i],
          },
        },
        function (err, foundItem) {
          if (err) {
            console.log(err);
          } else {
            console.log(foundItem);
            console.log("itemFound");
            const order = new Order({
              customerId: phoneNo,
              orderList: foundItem,
            });
            order.save();
          }
        }
      );
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // error code starts

    // this code is having a problem of save() being asynchronous see afterwards

    // const order = new Order({
    //   customerId : phoneNo
    // });

    // for(var i = 0 ; i < resArray.length; i++ ){

    //   await Item.findOne({itemId : {$eq :resArray[i]} },  function (err, foundItem) {
    //     if (err){
    //         console.log(err);
    //     }
    //     else{

    //         // itemsObj.push(foundItem);
    //         await order.orderList.push(foundItem);
    //         console.log(foundItem);
    //         console.log("item found ");
    //         console.log(i);
    //     }
    //  });

    // }
    //  order.save( function(err, orderData){
    //   if (err){
    //     console.log(err);

    //   }else{
    //     console.log(orderData);
    //     console.log("this is the data which is having error");
    //   }
    // });

    //  check later code ends
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // const orderSchema = new mongoose.Schema({
    //   orderId: mongoose.Schema.Types.ObjectId,
    //   customerId: String,
    //   orderDate: { type: Date, default: Date.now },
    //   orderList: [itemSchema],
    // });

    // Order.insertMany(orders , function(err){
    //   if(err)
    //   console.log(err);
    //   else
    //   console.log("Successfully saved default items to DB.");
    // });

    console.log("status -> success");
    res.send({
      status: "successfull",
    });
  } else {
    console.log("status -> fail");
    res.send({
      status: "fail",
    });
  }
});

app.post("/proceed", function (req, res) {
  console.log("I am inside /proceed");

  const customerName = req.body.fname;
  const customerId = req.body.userPhoneNo;

  const currentDate = date();
  //   let found =  Order.find(
  //     {
  //       customerId : customerId,
  //       orderDate : currentDate
  //     },
  //      function (err, foundOrder) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log("this is the found order");
  //         console.log(foundOrder);
  //         ordersArray = foundOrder;

  //       }
  // }).then(res.render("success", {cusName: req.body.fname, orders: ordersArray, orderDate : currentDate}));
  Order.find(
    {
      customerId: customerId,
      orderDate: currentDate,
    },
    function (err, foundOrders) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundOrders);
        res.render("success", {
          orders: foundOrders,
          orderDate: currentDate,
        });
      }
    }
  );

  //  function getOrdersPromise(customerId, currentDate){
  //   var promise =  Order.find(
  //     {
  //       customerId : customerId,
  //       orderDate : currentDate
  //     }).exec();
  //   return promise;
  // }

  // var promise = getOrdersPromise(customerId, currentDate);
  // console.log(promise);
  // promise.then(function(foundOrders){
  //   console.log(foundOrders);
  //   res.render("success", {cusName: req.body.fname, orders: foundOrders, orderDate : currentDate});
  //    });

  // await Order
  //    .find({orderDate : date() },function(err, orderDetails){
  //      if(err){
  //        console.log(err);
  //      }else{
  //       res.render("success", {cusName: req.body.fname, orders: orderDetails});
  //      }
  //    });
});
app.get("/itemAvail", async function (req, res) {
  var availArray = [];
  await Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      foundItems.forEach(function (item) {
        availArray.push(item.itemAvail);
      });
    }
  });
  console.log("this is the available items array");
  console.log(availArray);
  res.send(availArray);
});

app.post("/delete", function (req, res) {
  const orderId = req.body.checkbox;
  const customerId = req.body.customerId;

  Order.findByIdAndDelete(
    {
      _id: orderId,
    },
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted : ", docs);
      }
    }
  );

  res.redirect("/" + customerId);
});

app.post("/my-orders", function (req, res) {
  const customerId = req.body.customerId;

  res.redirect("/" + customerId);
});

app.get("/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const currentDate = date();

  Order.find(
    {
      customerId: customerId,
      orderDate: currentDate,
    },
    function (err, foundOrders) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundOrders);
        res.render("success", {
          orders: foundOrders,
          orderDate: currentDate,
        });
      }
    }
  );
});

app.post("/set-item-avail", async function (req, res) {
  var items;
  console.log("inside item avail");
  await Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      items = foundItems;
    }
  });
  res.render("item-avail", {
    items: items,
  });
});

app.post("/signup", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    bcrypt.compare(req.body.reEnterPassword, hash).then(function (result) {
      if (result === true) {
        const register = new User({
          name: req.body.name,
          phoneNo: req.body.phoneNo,
          address: req.body.address,
          password: hash,
        });
        register.save(function (err) {
          if (err) {
            res.redirect("/error");
          } else {
            console.log("successfully registered");
            res.redirect("/login");
          }
        });
      } else {
        console.log("error in passwords");
        res.redirect("/error");
      }
    });
  });
});

app.post("/login", function (req, res) {
  const username = req.body.myPhoneNo;
  const password = req.body.password;

  User.findOne(
    {
      phoneNo: username,
    },
    function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password).then(function (result) {
            if (result === true) {
              console.log("success");
              loggedIn = true;
              customPhoneNo = foundUser.phoneNo;
              customerName = foundUser.name;

              if (foundUser.role === "customer") {
                res.render("menu", {
                  titleName: foundUser.name,
                  userPhoneNo: foundUser.phoneNo,
                });
              } else {
                res.render("admin-page", {
                  adminName: foundUser.name,
                  adminPhoneNo: foundUser.phoneNo,
                });
              }
            } else {
              console.log("fail");
              res.render("error");
            }
          });
        }
      }
    }
  );
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server started on port 3000");
});
