const Post = require("../models/Post");

exports.createPost = async (req, res, next) => {
  try {
    const { title, description, category, budget, type } = req.body;

    const authorRole = req.user.role;
    const postType = authorRole === "investor" ? "investor_post" : "business_post";

    const post = await Post.create({
      authorId: req.user._id,
      authorRole,
      type: postType,
      title,
      description,
      category: category ? (typeof category === "string" ? category.split(",").map(c => c.trim()) : category) : [],
      budget: budget || 0,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      attachments: req.body.attachments || [],
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      search,
      sortBy = "newest",
      minBudget,
      maxBudget,
      my,
    } = req.query;

    const query = my === "true" ? {} : { status: "active" };

    if (my === "true" && req.user) {
      query.authorId = req.user._id;
    }

    if (type) query.type = type;
    if (category) query.category = { $in: category.split(",") };
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    if (search) {
      query.$text = { $search: search };
    }

    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "budget_high":
        sort = { budget: -1 };
        break;
      case "budget_low":
        sort = { budget: 1 };
        break;
      case "popular":
        sort = { viewsCount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const posts = await Post.find(query)
      .populate("authorId", "name avatar role")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "authorId",
      "name avatar role"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.viewsCount += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    if (updateData.category && typeof updateData.category === "string") {
      updateData.category = updateData.category.split(",").map(c => c.trim());
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};
