const service = require("../services/forumService");

exports.createPost = async (req, res) => {
  try {

    const result = await service.createPost({
      user_id: req.user.id || req.user.userId,
      title: req.body.title,
      content: req.body.content
    });

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getAllPosts = async (req, res) => {
  try {

    const result = await service.getAllPosts();

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.deletePost = async (req, res) => {
  try {

    const result = await service.deletePost(
      req.params.id,
      req.user
    );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.updatePost = async (req, res) => {
  try {
    const result = await service.updatePost(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content
      }
    );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
