const path = require('path');
const {ObjectId} = require('mongodb')
const mongoose = require('mongoose')

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById(ObjectId('65bce92db6ebde6d4e69d114'))
    .then(user => {
      if (!user) {
        console.log('User not found.');
        req.user = null; // Set req.user to null if user is not found
      } else {
        const { name, email, cart, _id } = user;
        req.user = user;
      }
      next();
    })
    .catch(err => {
      console.log('Error fetching user:', err);
      next(err);
    });
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// mongoConnect(() => {
//   app.listen(4000);
// });

mongoose.connect('mongodb+srv://sabarinathan_stack:Sabari123@cluster0.whyrcgy.mongodb.net/test?retryWrites=true&w=majority')
.then(result =>{
  User.findOne().then(user =>{
    if(!user){
      const user = new User({
        name:'sabarinathan',
        email:'sabarinathan25052001@gmail.com',
        cart:{
          items:[]
        }
      })
      user.save();
    }
  })
  app.listen(4000);
})
.catch(err =>{
  console.log(err)
})
