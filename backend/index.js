import express from 'express';
import './db/config.js';
import User from './db/user.js';
import Products from './db/products.js';
import Cart from './db/cart.js';
import Order from './db/order.js';
import Message from './db/message.js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer storage config for local image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype.split('/')[1]);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Auth Routes
app.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  if (req.body.password && req.body.email) {
    try {
      let user = await User.findOne({ email: req.body.email, password: req.body.password }).select("-password");
      if (user) {
        res.send(user);
      } else {
        res.send({ result: "No user found" });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  } else {
    res.send({ result: "No user found" });
  }
});

// Products Routes
app.post('/add-product', upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.body.price) productData.price = Number(req.body.price);
    if (req.body.stock_quantity) productData.stock_quantity = Number(req.body.stock_quantity);
    if (req.file) {
      productData.image_url = `/uploads/${req.file.filename}`;
    }
    const products = new Products(productData);
    const result = await products.save();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/products', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const products = await Products.find(filter);
    res.send(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete('/product/:id', async (req, res) => {
  try {
    const result = await Products.deleteOne({ _id: req.params.id });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/product/:id', async (req, res) => {
  try {
    const result = await Products.findOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No record found" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put('/product/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.stock_quantity) updateData.stock_quantity = Number(req.body.stock_quantity);
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }
    let result = await Products.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/search/:key', async (req, res) => {
  try {
    const searchRegex = { $regex: req.params.key, $options: 'i' };
    const query = {
      $or: [
        { name: searchRegex },
        { company: searchRegex },
        { category: searchRegex }
      ]
    };
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    let result = await Products.find(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Cart Routes
app.get('/cart/:buyerId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyerId: req.params.buyerId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ buyerId: req.params.buyerId, items: [] });
      await cart.save();
    }
    res.send(cart);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/cart/add', async (req, res) => {
  const { buyerId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ buyerId });
    if (!cart) {
      cart = new Cart({ buyerId, items: [] });
    }
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ productId, quantity: quantity || 1 });
    }
    await cart.save();
    res.send(cart);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put('/cart/update', async (req, res) => {
  const { buyerId, productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ buyerId });
    if (cart) {
      const item = cart.items.find(item => item.productId.toString() === productId);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        }
        await cart.save();
      }
    }
    res.send(cart);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete('/cart/remove/:buyerId/:productId', async (req, res) => {
  const { buyerId, productId } = req.params;
  try {
    const cart = await Cart.findOne({ buyerId });
    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
    }
    res.send(cart);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Order Routes
app.post('/order/checkout', async (req, res) => {
  const { buyerId } = req.body;
  try {
    const cart = await Cart.findOne({ buyerId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).send({ error: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;

      if (product.stock_quantity < item.quantity) {
        return res.status(400).send({ error: `Not enough stock for ${product.name}` });
      }

      product.stock_quantity -= item.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtTime: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      buyerId,
      items: orderItems,
      totalAmount,
      status: 'pending'
    });

    await order.save();
    cart.items = [];
    await cart.save();

    res.send(order);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/orders/buyer/:buyerId', async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.params.buyerId })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.send(orders);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/orders/seller/:sellerId', async (req, res) => {
  try {
    const sellerProducts = await Products.find({ userId: req.params.sellerId });
    const sellerProductIds = sellerProducts.map(p => p._id.toString());

    const orders = await Order.find({
      'items.productId': { $in: sellerProductIds }
    })
    .populate('buyerId', 'name email address')
    .populate('items.productId')
    .sort({ createdAt: -1 });

    const sellerOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item =>
        item.productId && sellerProductIds.includes(item.productId._id.toString())
      );
      return orderObj;
    });

    res.send(sellerOrders);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put('/order/:orderId/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    res.send(order);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Message Routes
app.get('/messages/contacts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== userId) {
        contactIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== userId) {
        contactIds.add(msg.receiverId.toString());
      }
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('name email role company');
    res.send(contacts);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/messages/chat/:userId/:contactId', async (req, res) => {
  const { userId, contactId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    })
    .populate('productId', 'name price image_url')
    .sort({ createdAt: 1 });
    res.send(messages);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/messages/send', async (req, res) => {
  const { senderId, receiverId, content, productId } = req.body;
  try {
    const message = new Message({ senderId, receiverId, content, productId });
    await message.save();

    const populatedMessage = await Message.findById(message._id).populate('productId', 'name price image_url');
    res.send(populatedMessage);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(5000);