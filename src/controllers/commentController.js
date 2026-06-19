const service = require('../services/commentService');

exports.createComment = async (req, res) => {

  try {

    const result = await service.createComment({
      post_id: req.body.post_id,
      user_id: req.user.id || req.user.userId,
      content: req.body.content
    });

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getCommentsByPost = async (req, res) => {

  try {
    const result = await service.getCommentsByPost(req.params.postId);
    res.json(result);
  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

exports.updateComment = async (req, res) => {

  try {

    const result = await service.updateComment(
      req.params.id,
      req.user,
      req.body.content
    );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.deleteComment = async (req, res) => {
    try {
        const result = await service.deleteComment( 
            req.params.id,
            req.user.id || req.user.userId
        );
            if (!result) {
      return res.status(404).json({ message: 'Komentar telah dihapus' });
    }
        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getCommentById = async (req, res) => {
  try {
    const result = await service.getCommentById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
