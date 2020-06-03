const express = require('express');
const app = express();
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
const port = process.env.PORT || 3000;

// TODO: APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true, useUnifiedTopology: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// TODO: MONGOOSE/ MODEL CONFIG
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

let Blog = mongoose.model("Blog", blogSchema);

// created the below test to ensure that it was saving to the db
// blog.create({
//     title: "Test Blog",
//     image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=660&q=80',
//     body: "Hello this is a blog post test!"
// })

// TODO: RESTFUL ROUTES

app.get("/", (req, res) => {
    res.redirect("/blogs");
})

// INDEX ROUTE
app.get("/blogs", (req, res) => {
    Blog.find({}, function(err, blogs){
        if(err){
            console.log('ERROR', err)
        } else {
            res.render("index.ejs", {blogs: blogs});
        }
    })
})
// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new.ejs")
})

// CREATE ROUTE
app.post("/blogs", function(req, res){
    //sanitize
    req.body.blog.body = req.sanitize(req.body.blog.body)
    //create blog
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
                //redirect to index
            res.redirect("/blogs");
        }
    });
})

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
})

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
})

//UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    //sanitize
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

//DELETE ROUTE
app.delete("/blogs/:id", (req, res)=>{
    // DESTROY Blog
    Blog.findByIdAndRemove(req.params.id, (err)=> {
        if(err){
            res.redirect("/blogs");
        } else {
            // redirect somewhere
            res.redirect("/blogs");
        }
    })
})

app.listen(port, (req, res) => {
    console.log(`Listening on port: ${port}`);
})