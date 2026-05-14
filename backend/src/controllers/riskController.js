const asyncHandler       = require('../utils/asyncHandler');
const { computeRiskScore } = require('../services/riskService');

exports.getRiskScore = asyncHandler(async (req, res) => {
  const result = await computeRiskScore(req.user);
  res.json(result);
});
