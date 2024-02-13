const Product = require('../models/product');
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //findById is not our own method it is a mongoose method
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId') // 'productId' instead of 'cart.items.productId'
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};



exports.postCart = (req, res, next) => {
  console.log('req.user:', req.user); 
  const prodId = req.body.productId;
  if (!req.user) {
    console.log('User not found. Unable to add to cart.');
    return res.redirect('/'); // or some other appropriate action
  }
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      console.log('Error adding to cart:', err);
      next(err);
    });
};


exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeCartItems(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
  .populate('cart.items.productId') // 'productId' instead of 'cart.items.productId'
  .then(user => {
    const products = user.cart.items.map((i)=>{
      return {quantity:i.quantity,product: {...i.productId._doc}}
      //why this _doc   it is used to getting all data about the particular product and fetch the data by meta data
    });
    console.log("result",products)
    const order = new Order({
      user:{
        name:req.user.name,
        userId: req.user
      },
      products: products
    })
   
    return order.save();
  })
  .then(result => {
   return req.user.clearCart()
    
  })
  .then(result =>{
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
   
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId':req.user._id})
 
  .then(orders => {
    console.log("testinnnnnn",orders)
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
  .catch(err => console.log(err));
 
};
