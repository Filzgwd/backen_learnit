const service = require("../services/progressService");

exports.completeMaterial = async (req, res) => {

  try {

    const result = await service.completeMaterial(
      req.user.userId,
      req.body
    );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getMyProgress = async (req, res) => {
  try {

    const result = await service.getMyProgress(req.user.id);

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getProgressPercentage = async (req, res) => {

  try {

    const result =
      await service.getProgressPercentage(
        req.user.userId,
        req.params.category_id
      );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


