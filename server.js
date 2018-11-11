var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.raw({ type: '*/*' }))
const MongoClient = require("mongodb").MongoClient;
var md5 = require('md5');
//PASTE YOUR MLAB URI STRING HERE
const url = "mongodb://alibay:alibay@localhost:27017/alibay";//"mongodb://admin:password1@ds153093.mlab.com:53093/decodedb";
const useDb = 'alibay';

var create_UUID = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxx4xxyxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

app.get("/users", (req, res) => {
  MongoClient.connect(url, (err, db) => {
      if (err) throw err;
      var dbo = db.db(useDb);
      dbo.collection('users').find({}, {
        projection: { _id: 0, password: 0}
      }).toArray((err, result) => {
        if(err) throw err;
        db.close();
        res.send(JSON.stringify({status:true, users: result}))
      })
  })
});

app.get("/products", (req, res) => {
  MongoClient.connect(url, (err, db) => {
      if (err) throw err;
      var dbo = db.db(useDb);
      dbo.collection('products').find({}, {
        projection: { _id: 0}
      }).toArray((err, result) => {
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
    var dbo = db.db(useDb);
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

app.post("/deleteproduct", function(req, res){

  let parsedObj = JSON.parse(req.body);
  let productId = parsedObj.product_id;

  // Connedt to the db
  MongoClient.connect(url, function(err, client){
    
    if (err) throw err;// this will make the frontend choke with something like <HTML>...<h1>Error</h1>

    let db = client.db(useDb);

    // delete the document with productId in the product collection
    db.collection('products').deleteOne({"product_id":productId}, function(err,result){
      if (err) throw err;

      if (!result.deletedCount === 1) throw new Error('delete count was not === 1 ...');// just to be safe
    });

    // Then fetch all products and send those back to the frontend for updated display
    db.collection('products').find({}, {projection: {_id:0}}).toArray(function(err, result){
      if (err) throw err;
      
      // Ok, done with the db connection
      client.close();

      // send back the results as an array of product objects.
      res.send(JSON.stringify({products: result}));
    })
  })
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
    var dbo = db.db(useDb);
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
    var dbo = db.db(useDb);
    //var myobj = { username: thisusername };
    dbo.collection("users").findOne({}, function(err, result) {
      if (err) throw err;
      //res.send("");
      db.close();
      res.send(JSON.stringify({status: true, message: "Success!"}));
    });
  });
});

app.post("/postReview", (req, res) => {
  var parsed = JSON.parse(req.body);
  var thisid = create_UUID();
  var thisitem_id = parsed.item_id;
  var thisusername = parsed.username;
  var thisreview = parsed.review;
  var thisrating = parsed.rating
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(useDb);
    var myobj = { id: thisid, item_id: thisitem_id, username: thisusername,
      review: thisreview, rating: thisrating };
    dbo.collection("posts").insertOne(myobj, function(err, result) {
      if (err) throw err;
      db.close();
      res.send(JSON.stringify({status: true, message: "Success!"}));
    });
  });
});

app.get("/getreviews", (req, res) => {
  MongoClient.connect(url, (err, db) => {
      if (err) throw err;
      var dbo = db.db(useDb);
      dbo.collection('posts').find({}, {
        projection: { _id: 0}
      }).toArray((err, result) => {
        if(err) throw err;
        db.close();
        res.send(JSON.stringify({status:true, reviews: result}))
      })
  })
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
*/