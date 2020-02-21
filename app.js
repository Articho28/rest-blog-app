var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	expressSanitizer = require("express-sanitizer"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override");

// CONFIG MONGO ATLAS
//CHANGE THIS FOR LOCALHOST/CLOUD 
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/blog_app");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//MONGOOSE SETUP
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


// //CODE TO POPULATE DB
Blog.create({
	title: "A Test Blog",
	image: "https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074__340.jpg",
	body: "Some picture of a dog"
});

// RESTFUL ROUTES 


app.get("/", (req, res) => {
	res.redirect("/blogs");
});

// INDEX ROUTE 
app.get("/blogs", function(req,res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	})
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("new");
});


//CREATE ROUTE 
app.post("/blogs", function(req, res) {
	//sanitize
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog) {
		if (err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			console.log("There was an error");
			console.log(err);
		} else {
			res.render("show", {blog : foundBlog});
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
})

//UPDATE ROUTE
app.put("/blogs/:id/", function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id", function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
});

app.listen(3000, function() {
	console.log("Hello, it's running!");
	console.log("Blog app server running on port 3000");
});