var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const localStrategy = require('passport-local');
const cloudinary = require('cloudinary').v2;

const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res, next) {
  res.render('register', { nav: false });
});


router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});

router.get('/login', function (req, res, next) {
  res.render('login', { nav: false });
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts")

  res.render('profile', { user, nav: true });
});


router.get('/posts', isLoggedIn, async function (req, res, next) {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts")

  res.render('pshow', { user, nav: true });
});


router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.find()
    .populate("user")

  res.render("feed", { user, posts, nav: true });
});



router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('add', { user, nav: true });
});



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})



router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    console.log(req.file);
    // Since the file is uploaded directly to Cloudinary, req.file will have the Cloudinary response
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.path // Use Cloudinary's secure URL
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect('/feed');
  } catch (err) {
    console.error(err);
    next(err); // Handle the error appropriately
  }
});



router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.path;
  await user.save();
  res.redirect("/profile");
});


router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    name: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact
  })

  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      })
    })
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
}), function (req, res, next) {
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;