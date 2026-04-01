const crmModel = require('../models/crm.model');
const { sendSuccess, sendError } = require('../utils/response.helper');

const getCustomers = async (req, res) => {
  try {
    const data = await crmModel.getCustomers(req.query);
    return sendSuccess(res, data, 'Customer list retrieved successfully');
  } catch (error) {
    console.error('[getCustomers]', error.message);
    return sendError(res, 'Failed to retrieve customer list', 500);
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const validStatuses = ['Active', 'InProgress', 'Inactive'];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return sendError(res, 'status must be one of Active, InProgress, Inactive', 400);
    }

    const customer = await crmModel.updateCustomerStatus(req.params.id, status);
    if (!customer) {
      return sendError(res, `Customer #${req.params.id} not found`, 404);
    }

    return sendSuccess(res, customer, 'Customer status updated successfully');
  } catch (error) {
    console.error('[updateCustomerStatus]', error.message);
    return sendError(res, 'Failed to update customer status', 500);
  }
};

const getDashboardOverview = async (req, res) => {
  try {
    const data = await crmModel.getDashboardOverview();
    return sendSuccess(res, data, 'Dashboard overview retrieved successfully');
  } catch (error) {
    console.error('[getDashboardOverview]', error.message);
    return sendError(res, 'Failed to retrieve dashboard overview', 500);
  }
};

const getTopClients = async (req, res) => {
  try {
    const data = await crmModel.getTopClients(req.query.limit);
    return sendSuccess(res, data, 'Top clients retrieved successfully');
  } catch (error) {
    console.error('[getTopClients]', error.message);
    return sendError(res, 'Failed to retrieve top clients', 500);
  }
};

const getRevenueTrend = async (req, res) => {
  try {
    const data = await crmModel.getRevenueTrend();
    return sendSuccess(res, data, 'Revenue trend retrieved successfully');
  } catch (error) {
    console.error('[getRevenueTrend]', error.message);
    return sendError(res, 'Failed to retrieve revenue trend', 500);
  }
};

const getAlerts = async (req, res) => {
  try {
    const data = await crmModel.getAlerts();
    return sendSuccess(res, data, 'Dashboard alerts retrieved successfully');
  } catch (error) {
    console.error('[getAlerts]', error.message);
    return sendError(res, 'Failed to retrieve dashboard alerts', 500);
  }
};

module.exports = {
  getCustomers,
  updateCustomerStatus,
  getDashboardOverview,
  getTopClients,
  getRevenueTrend,
  getAlerts,
};
