const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const mongoose = require("mongoose");
const https = require("https");
const path = require('path');


//connect mongoDB
mongoose.connect("mongodb://localhost:27017/blogDB", { useNewUrlParser: true });

//create schema and model in database
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);

const homeStartingContent = "Welcome to my blog! Here I share what I have learnt and what I am interested in.";
const aboutContent = "This is where I share my deep passion for hip-hop dance. \nI explore its history, various styles, and the influential artists who have shaped the genre.\nDance is more than just movement—it's a form of expression and a tool for promoting well-being.";
const contactContent = "Subscribe to my newsletter";

const app = express();

app.set("view engine", "ejs");
// console.log('__dirname:', __dirname);
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
  // res.render("home", { home: homeStartingContent, allPosts: posts });
  Post.find()
    .then(function (posts) {
      res.render("home", { home: homeStartingContent, allPosts: posts });
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/about", function (req, res) {
  res.render("about", { about: aboutContent.replace(/\n/g, "</p><p>") });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contact: contactContent});
});

app.get("/compose", function (req, res) {
  res.render("compose", { pageTitle: "Compose" });
});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId })
    .then(function (post) {
      res.render("post", {
        blogTitle: post.title,
        blogContent: post.content.replace(/\n/g, "</p><p>"),
      });
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/compose", function (req, res) {
  // console.log(req.body); //{ input: '123', compose: 'Compose' }
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  post.save();
  res.redirect("/");
});

app.post("/signup",function(req,res){
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
      members: [
          {
              email_address: email,
              status: "subscribed",
              merge_fields: {
                  FNAME: firstName,
                  LNAME: lastName
              },

          }
      ],
      update_existing:true
  }

  const jsonData = JSON.stringify(data);

  //post data to the api
  const url = "https://us21.api.mailchimp.com/3.0/lists/77e46269fd";
  const options = {
      method: "POST",
      auth: "emily:ac7635ffa3aae2862713f1ebf4c0d9e1-us21", //invalid, need to replace with valid api key  
  }

  const request = https.request(url,options,function(response){
    console.log(response.statusCode);
      if (response.statusCode===200){ //status code is not string!
          res.render("success");
      }else {
        console.log("singup fail");
          res.render("fail");
      }
  })

  request.write(jsonData);
  request.end();
})

app.post("/failure",function(req,res){
  res.redirect("/");
})
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
