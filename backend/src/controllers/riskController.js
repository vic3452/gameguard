/**
 * Risk Score Controller
 */

const { computeRiskScore } = require('../services/riskService');

exports.getRiskScore = async (req, res, next) => {
  try {
    const result = await computeRiskScore(req.user);
    res.json(result);
  } catch (err) { next(err); }
};
