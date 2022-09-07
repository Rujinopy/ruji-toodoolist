//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { render } = require("ejs");
const _= require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Rujinopy:Rujinopy123@cluster0.xdptzzm.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
})

const item2 = new Item({
  name: "Hit the + button to add"
})

const item3 = new Item({
  name: "Hit this to delete an item"
}) 

const defaultItems = [item1, item2, item3];

const workItems = [];

app.get("/", function(req, res) {

  const day = date.getDate();
  
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0 ) {
      Item.insertMany(defaultItems, function(err){ 
        if (err) {
          console.log(err)
        } else {
          console.log("adding default items successful.")
        }
      })
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
  })
});

const listSchema = {
  name: String,
  todoList: [itemSchema]
}
const List = mongoose.model("customList", listSchema);

app.get("/:customlist", function( req, res) {
  
  const customTable = _.capitalize(req.params.customlist)

  List.findOne({name: customTable}, function(err, foundItem) {
    if (!err) {
      if (!foundItem){
        
        const newList = new List({
          name: customTable,
          todoList: defaultItems
        })
        newList.save()
        res.render("list", {listTitle: customTable, newListItems: newList.todoList});
      }
      else {
      res.render("list", {listTitle: customTable, newListItems: foundItem.todoList});
      }
    }

    else {
      console.log(err)
    }
    
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const urlPath = req.body.list;
  const newItem = new Item({
    name: itemName,
  })

  if (urlPath === "Today") {
    newItem.save()  
    res.redirect("/")
  }
  else {
    List.findOne({name: urlPath}, function(err, foundItem) {
      if (err){
        console.log(err)
        res.redirect("/" + urlPath)
      }
      else{
        foundItem.todoList.push(newItem)
        foundItem.save()
        res.redirect("/" + urlPath)
      }
    })
    
  }
});

app.post("/delete", function(req, res) {
  const checkedBox = req.body.checkbox
  const urlPath = req.body.listName;
  console.log(urlPath)
  if (urlPath === "Today"){
  Item.findByIdAndRemove(checkedBox, function(err, doc) {
    if(!err){
      res.redirect("/")
    }
    else {
      console.log(err)
    }
  })
  }
  else {
    List.findOneAndUpdate({name: urlPath}, {$pull: {todoList: {_id: checkedBox}}}, function(err, dog) {
      if (!err){
        console.log(dog)
        res.redirect("/" + urlPath)
      }
    })
  }
})
app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT
if (port == null || port === ""){
  port = 3000
}

app.listen(port, function() {
  console.log("Server started");
});
