//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"Our goal is same.",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/testDB",{useNewUrlParser: true});
mongoose.set("useCreateIndex",true);

const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
const feedbackSchema={
  name:String,
  message:String,
  subject:String
};
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const FeedBack = new mongoose.model("FeedBack",feedbackSchema);


app.get("/",function(req,res){
  if(req.isAuthenticated()){
    res.sendFile(__dirname+"/"+index.html);
  }else{
    res.redirect("/login");
  }
 
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/:custom",function(req,res){
   const page=req.params.custom;
   if(req.isAuthenticated()){
     res.sendFile(__dirname+"/"+page);
   }else{
     res.redirect("/login");
   }
});



app.post("/register",function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.sendFile(__dirname+"/index.html");
      });
    }
  });
});


app.post("/login",function(req,res){
  const user=new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.sendFile(__dirname+"/index.html");
      });
    }
  });

});

app.post("/contactus.html",function(req,res){
    const name=req.body.naam;
    const message=req.body.pata;
    const subject=req.body.bol;
    const newFeed= new FeedBack({
      name:name,
      message:message,
      subject:subject
    });
    newFeed.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.sendFile(__dirname+"/contactus.html");
      }
    });
  });


app.listen(3000,function(){
  console.log("Server started at post 3000");
});
