var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.raw({ type: '*/*' }))
const MongoClient = require("mongodb").MongoClient;
var md5 = require('md5');
//PASTE YOUR MLAB URI STRING HERE
const url = "mongodb://admin:password1@ds153093.mlab.com:53093/decodedb";

app.get("/products", (req, res) => {
  MongoClient.connect(url, (err,db)=>{
      if (err) throw err;
      let dbo = db.db("decodedb")
      dbo.collection("products").find({}).toArray((err, result) => {
        if(err) throw err;
        db.close();
        res.send(JSON.stringify({status:true, products: result}))
      })
  })
});

app.post("/addproduct", (req, res) => {
  var parsed = JSON.parse(req.body);
  var product_id = parsed.product_id;
  var product_name = parsed.product_name;
  var product_price = parsed.product_price;
  var product_desc = parsed.product_desc;
  var product_imageUrl = parsed.product_imageUrl;
  var vendor_id = parsed.vendor_id;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("decodedb");
    var myobj = { id: product_id, name: product_name, price: product_price,
      description: product_desc, imageUrl: product_imageUrl, vendor_id: vendor_id };
    dbo.collection("products").insertOne(myobj, function(err, res) {
      if (err) throw err;
      //res.send("");
      db.close();
    });
  });
  res.send(JSON.stringify({status: true, message:"Success!"}));
});

app.post("/signup", (req, res) => {
  var parsed = JSON.parse(req.body);
  var thisusername = parsed.username;
  var thispassword = md5(parsed.password);
  var thisname = parsed.name;
  var thisaddress = parsed.address;
  var thisphonenumber = parsed.phonenumber;
  var thisemail = parsed.email;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("decodedb");
    var myobj = { username: thisusername, password: thispassword, name: thisname,
      address: thisaddress, phonenumber: thisphonenumber, email: thisemail };
    dbo.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      //res.send("");
      db.close();
    });
  });
  res.send(JSON.stringify({status: true, message:"Success!"}));
});




app.listen(4000, () => { 
  console.log("Server started on port 4000");
})
