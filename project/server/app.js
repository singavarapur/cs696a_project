require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Configure AWS SDK for Digital Ocean Spaces
const spacesEndpoint = new AWS.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DIGITAL_OCEAN_ACCESS_KEY,
  secretAccessKey: process.env.DIGITAL_OCEAN_SECRET_KEY,
  region: "nyc3",
  s3ForcePathStyle: true,
});

// Configure multer for uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "sew-smart",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `uploads/${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
  },
});

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.auth = { userId: decoded.sub };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: String,
  avatar: String,
  bio: String,
  stats: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  image: { type: String, required: true },
  description: String,
  category: String,
  tags: [String],
  likes: [String],
  comments: [
    {
      userId: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      designId: String,
      designerId: String,
      title: String,
      price: Number,
      image: String,
      quantity: { type: Number, default: 1 },
    },
  ],
});

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      designId: String,
      designerId: String,
      title: String,
      price: Number,
      image: String,
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      designId: String,
      designerId: String,
      title: String,
      price: Number,
      image: String,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Post = mongoose.model("Post", PostSchema);
const Cart = mongoose.model("Cart", CartSchema);
const Wishlist = mongoose.model("Wishlist", WishlistSchema);
const Order = mongoose.model("Order", OrderSchema);

// Helper function to get user info
const getUserInfo = async (clerkId) => {
  const user = await User.findOne({ clerkId });
  if (!user) return null;
  return {
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    clerkId: user.clerkId,
  };
};

// Create/Update User
app.post("/api/users", authMiddleware, async (req, res) => {
  try {
    const { clerkId, username, name, avatar, bio, email } = req.body;

    if (!clerkId || !username || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ clerkId });

    if (user) {
      user.username = username;
      user.name = name;
      user.avatar = avatar;
      user.bio = bio;
      user.email = email;
      await user.save();
      return res.status(200).json(user);
    }

    user = new User({
      clerkId,
      username,
      name,
      avatar,
      bio,
      email,
      stats: { followers: 0, following: 0 },
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get User
app.get("/api/users/:clerkId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cart endpoints
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.auth.userId });
    if (!cart) {
      cart = new Cart({ userId: req.auth.userId, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  try {
    const { designId, designerId, title, price, image, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.auth.userId });

    if (!cart) {
      cart = new Cart({ userId: req.auth.userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.designId === designId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        designId,
        designerId,
        title,
        price,
        image,
        quantity: quantity || 1,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/cart/:designId", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.auth.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.designId !== req.params.designId,
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Wishlist endpoints
app.get("/api/wishlist", authMiddleware, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.auth.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.auth.userId, items: [] });
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/wishlist", authMiddleware, async (req, res) => {
  try {
    const { designId, designerId, title, price, image } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.auth.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.auth.userId, items: [] });
    }

    if (!wishlist.items.find((item) => item.designId === designId)) {
      wishlist.items.push({ designId, designerId, title, price, image });
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/wishlist/:designId", authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.auth.userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.designId !== req.params.designId,
    );
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order endpoints
app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const order = new Order({
      userId: req.auth.userId,
      items,
      totalAmount,
    });

    await order.save();

    // Clear the cart after successful order
    await Cart.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: { items: [] } },
    );

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.auth.userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(20);

    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const postUser = await getUserInfo(post.userId);

        const commentsWithUsers = await Promise.all(
          post.comments.map(async (comment) => {
            const commentUser = await getUserInfo(comment.userId);
            return {
              ...comment.toObject(),
              user: commentUser,
            };
          }),
        );

        return {
          ...post.toObject(),
          user: postUser,
          comments: commentsWithUsers,
        };
      }),
    );

    res.json(postsWithUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Post
app.post(
  "/api/posts",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("File upload request received");

      if (!req.file) {
        console.log("No file received");
        return res.status(400).json({ message: "Image is required" });
      }

      console.log("Uploaded file details:", req.file);

      const newPost = new Post({
        userId: req.auth.userId,
        image: req.file.location,
        description: req.body.description,
        category: req.body.category,
        tags: req.body.tags
          ? req.body.tags.split(",").map((tag) => tag.trim())
          : [],
      });

      await newPost.save();

      const postUser = await getUserInfo(req.auth.userId);
      const postWithUser = {
        ...newPost.toObject(),
        user: postUser,
        comments: [],
      };

      console.log("Post created successfully:", postWithUser);
      res.status(201).json(postWithUser);
    } catch (error) {
      console.error("Error in post creation:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Delete Post
app.delete("/api/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== req.auth.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    if (post.image && post.image.includes("digitaloceanspaces.com")) {
      const s3Key = post.image.split("nyc3.digitaloceanspaces.com/")[1];
      try {
        await s3
          .deleteObject({
            Bucket: "sew-smart",
            Key: s3Key,
          })
          .promise();
      } catch (error) {
        console.error("Error deleting image from storage:", error);
      }
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get User Posts
app.get("/api/users/:userId/posts", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const postUser = await getUserInfo(post.userId);

        const commentsWithUsers = await Promise.all(
          post.comments.map(async (comment) => {
            const commentUser = await getUserInfo(comment.userId);
            return {
              ...comment.toObject(),
              user: commentUser,
            };
          }),
        );

        return {
          ...post.toObject(),
          user: postUser,
          comments: commentsWithUsers,
        };
      }),
    );

    res.json(postsWithUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike Post
app.post("/api/posts/:postId/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.auth.userId;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const postUser = await getUserInfo(post.userId);
    const commentsWithUsers = await Promise.all(
      post.comments.map(async (comment) => {
        const commentUser = await getUserInfo(comment.userId);
        return {
          ...comment.toObject(),
          user: commentUser,
        };
      }),
    );

    const postWithUsers = {
      ...post.toObject(),
      user: postUser,
      comments: commentsWithUsers,
    };

    res.json(postWithUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Comment
app.post("/api/posts/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      userId: req.auth.userId,
      content,
      createdAt: new Date(),
    });

    await post.save();

    const postUser = await getUserInfo(post.userId);
    const commentsWithUsers = await Promise.all(
      post.comments.map(async (comment) => {
        const commentUser = await getUserInfo(comment.userId);
        return {
          ...comment.toObject(),
          user: commentUser,
        };
      }),
    );

    const postWithUsers = {
      ...post.toObject(),
      user: postUser,
      comments: commentsWithUsers,
    };

    res.status(201).json(postWithUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Comment
app.delete(
  "/api/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Find the comment
      const comment = post.comments.id(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user is the owner of the comment
      if (comment.userId !== req.auth.userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this comment" });
      }

      // Remove the comment
      comment.deleteOne();
      await post.save();

      // Return updated post with user information
      const postUser = await getUserInfo(post.userId);
      const commentsWithUsers = await Promise.all(
        post.comments.map(async (comment) => {
          const commentUser = await getUserInfo(comment.userId);
          return {
            ...comment.toObject(),
            user: commentUser,
          };
        }),
      );

      const postWithUsers = {
        ...post.toObject(),
        user: postUser,
        comments: commentsWithUsers,
      };

      res.json(postWithUsers);
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Update cart item quantity
app.patch("/api/cart/:designId", authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.auth.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.designId === req.params.designId,
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
app.get("/api/orders/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.auth.userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5003;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
