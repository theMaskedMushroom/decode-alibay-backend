var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.raw({ type: '*/*' }))
const MongoClient = require("mongodb").MongoClient;
var md5 = require('md5');
//PASTE YOUR MLAB URI STRING HERE
const url = "mongodb://admin:password1@ds153093.mlab.com:53093/decodedb";

var create_UUID = () => {
  var dt = new Date().getTime();
  var uuid = 'xxx-xxx-4xx-yxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

app.get("/products", (req, res) => {
  MongoClient.connect(url, (err, db) => {
      if (err) throw err;
      var dbo = db.db('decodedb');
      dbo.collection('products').aggregate([
        { $lookup:
          {
            from: 'users',
            localField: 'vendor_id',
            foreignField: 'id',
            as: 'seller'
          }
        },
        {
           $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$seller", 0 ] }, "$$ROOT" ] } }
        },
        { $project: { seller: 0 } }
      ]).toArray((err, result) => {
        if(err) throw err;
        db.close();
        res.send(JSON.stringify({status:true, products: result}))
      })
  })
});

app.post("/addproduct", (req, res) => {
  var parsed = JSON.parse(req.body);
  var productid = create_UUID();
  var vendorid = parsed.vendor_id;
  var product_name = parsed.name;
  var product_price = parsed.price;
  var product_desc = parsed.description;
  var product_imageUrl = parsed.imageUrl;
  //var vendor_id = parsed.vendor_id;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("decodedb");
    var myobj = { product_id: productid, vendor_id: vendorid, pname: product_name, price: product_price,
      description: product_desc, imageUrl: product_imageUrl };
    dbo.collection("products").insertOne(myobj, function(err, result) {
      if (err) throw err;
      //res.send("");
      db.close();
      res.send(JSON.stringify({ status: true, message:"Success!" }));
    });
  });
});

app.post("/signup", (req, res) => {
  var parsed = JSON.parse(req.body);
  var thisid = create_UUID();
  var thisusername = parsed.username;
  var thispassword = md5(parsed.password);
  var thisname = parsed.name;
  var thisaddress = parsed.address;
  var thisphonenumber = parsed.phonenumber;
  var thisemail = parsed.email;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("decodedb");
    var myobj = { id: thisid, username: thisusername, password: thispassword, name: thisname,
      address: thisaddress, phonenumber: thisphonenumber, email: thisemail };
    dbo.collection("users").insertOne(myobj, function(err, result) {
      if (err) throw err;
      //res.send("");
      db.close();
      res.send(JSON.stringify({status: true, message:"Success!"}));
    });
  });
});

app.post("/login", (req, res) => {
  var parsed = JSON.parse(req.body);
  var thisusername = parsed.username;
  //var thispassword = md5(parsed.password);
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("decodedb");
    //var myobj = { username: thisusername };
    dbo.collection("users").findOne({}, function(err, result) {
      if (err) throw err;
      //res.send("");
      db.close();
      res.send(JSON.stringify({status: true, message: "Success!"}));
    });
  });
});



app.listen(4000, () => { 
  console.log("Server started on port 4000");
})

/*
app.get("/products", (req, res) => {
  MongoClient.connect(url, (err, db) => {
      if (err) throw err;
      var dbo = db.db('decodedb');
      dbo.collection('products').aggregate([
        { $lookup:
          {
            from: 'users',
            localField: 'vendor_id',
            foreignField: 'id',
            as: 'seller'
          }
        }
      ]).toArray((err, result) => {
        if(err) throw err;
        db.close();
        res.send(JSON.stringify({status:true, products: result}))
      })
  })
});
*/