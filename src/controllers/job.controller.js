const jobModel = require('../models/job.model');
const { sendSuccess, sendError } = require('../utils/response.helper');

// ─── 1. GET /api/v1/scheduling/jobs ──
const getJobsList = async (req, res) => {
  try {
    const filters = {
      requested_start_time: req.query.Requested_Start_Time,
      requested_end_time: req.query.Requested_End_Time,
      status: req.query.Status,
      service_type: req.query.Service_Type,
      location_type: req.query.Location_Type,
    };

    const jobs = await jobModel.findAll(filters);

    return sendSuccess(res, jobs, 'Jobs retrieved successfully');
  } catch (error) {
    console.error('[getJobsList]', error.message);
    return sendError(res, 'Failed to retrieve jobs', 500);
  }
};

// ─── 2. GET /api/v1/scheduling/jobs/:id ──
const getJobDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);

    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    return sendSuccess(res, job, 'Job detail retrieved successfully');
  } catch (error) {
    console.error('[getJobDetail]', error.message);
    return sendError(res, 'Failed to retrieve job detail', 500);
  }
};

// ─── 3. GET /api/v1/scheduling/jobs/:id/notary_availabilities ──
const findNotaries = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const job = await jobModel.findById(id);
    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    const notaries = await jobModel.findAvailableNotaries(id, limit, offset);

    const formattedNotaries = notaries.map((n) => ({
      Notary_ID: n.Notary_ID,
      Full_Name: n.Full_Name,
      photo_url: n.photo_url,
      Distance: n.Distance,
      Rating: n.Rating,
      capabilities: {
        mobile: n.mobile,
        RON: n.RON,
        loan_signing: n.loan_signing,
        max_distance: n.max_distance,
      },
      availability: {
        start_time: n.start_time,
        end_time: n.end_time,
      },
    }));

    return sendSuccess(res, formattedNotaries, 'Available notaries retrieved successfully');
  } catch (error) {
    console.error('[findNotaries]', error.message);
    return sendError(res, 'Failed to find available notaries', 500);
  }
};

// ── 4. POST /api/v1/scheduling/jobs/:id/job_assignments ──
const assignJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { Notary_ID, Assigned_At } = req.body;

    if (!Notary_ID || !Assigned_At) {
      return sendError(res, 'Notary_ID and Assigned_At are required', 400);
    }

    const job = await jobModel.findById(id);
    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    const assignment = await jobModel.assignJob(id, Notary_ID, Assigned_At);

    return sendSuccess(
      res,
      {
        assignment_id: assignment.id,
        job_id: assignment.job_id,
        Notary_ID: assignment.notary_id,
        Assigned_At: assignment.assigned_at,
        accepted_at: null,
      },
      'Job assigned successfully',
<<<<<<< HEAD
      201,
=======
      201
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
    );
  } catch (error) {
    console.error('[assignJob]', error.message);
    return sendError(res, 'Failed to assign job', 500);
  }
};

// ─── 5. PATCH /api/v1/scheduling/jobs/:id/job_assignments/:assignmentId/accept
const acceptJob = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await jobModel.acceptAssignment(assignmentId);

    if (!result) {
      return sendError(res, `Assignment with id ${assignmentId} not found`, 404);
    }

    return sendSuccess(
      res,
      {
        assignment_id: result.assignment_id,
        accepted_at: result.accepted_at,
      },
<<<<<<< HEAD
      'Job accepted successfully',
=======
      'Job accepted successfully'
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
    );
  } catch (error) {
    console.error('[acceptJob]', error.message);
    return sendError(res, 'Failed to accept job', 500);
  }
};

// ─── 6. PATCH /api/v1/scheduling/jobs/:id/job_status ──
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    const VALID_STATUSES = ['Pending', 'Assigned', 'Completed', 'Cancelled'];
    if (!Status || !VALID_STATUSES.includes(Status)) {
<<<<<<< HEAD
      return sendError(res, `Status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
=======
      return sendError(
        res,
        `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        400
      );
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
    }

    const job = await jobModel.findById(id);
    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    const updated = await jobModel.updateStatus(id, Status);

    return sendSuccess(res, { Status: updated.Status }, 'Job status updated successfully');
  } catch (error) {
    console.error('[updateJobStatus]', error.message);
    return sendError(res, 'Failed to update job status', 500);
  }
};

// ─── 7. GET /api/v1/scheduling/metrics ──
const getDashboardMetrics = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const metrics = await jobModel.getDashboardMetrics(date);

    return sendSuccess(res, metrics, 'Dashboard metrics retrieved successfully');
  } catch (error) {
    console.error('[getDashboardMetrics]', error.message);
    return sendError(res, 'Failed to retrieve dashboard metrics', 500);
  }
};

// ─── 8. GET /api/v1/scheduling/jobs/:id/timeline ──
const getJobTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);
    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    const timeline = await jobModel.getTimeline(id);

    return sendSuccess(res, timeline, 'Job timeline retrieved successfully');
  } catch (error) {
    console.error('[getJobTimeline]', error.message);
    return sendError(res, 'Failed to retrieve job timeline', 500);
  }
};

// ─── 9. PUT /api/v1/scheduling/jobs/:id ──
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { Requested_Start_Time, Requested_End_Time, Location_Type, Location_Details, Notary_ID } =
      req.body;

    const job = await jobModel.findById(id);
    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    await jobModel.updateJob(id, {
      requested_start_time: Requested_Start_Time,
      requested_end_time: Requested_End_Time,
      location_type: Location_Type,
      location_details: Location_Details,
      notary_id: Notary_ID,
    });

    return sendSuccess(res, null, 'Job updated successfully');
  } catch (error) {
    console.error('[updateJob]', error.message);
    return sendError(res, 'Failed to update job', 500);
  }
};

// ─── 10. GET /api/v1/scheduling/jobs/:id/notifications ──
const getJobNotifications = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);
    if (!job) {
      return sendError(res, `Job with id ${id} not found`, 404);
    }

    const notifications = await jobModel.getNotifications(id);

    return sendSuccess(res, notifications, 'Job notifications retrieved successfully');
  } catch (error) {
    console.error('[getJobNotifications]', error.message);
    return sendError(res, 'Failed to retrieve job notifications', 500);
  }
};

module.exports = {
  getJobsList,
  getJobDetail,
  findNotaries,
  assignJob,
  acceptJob,
  updateJobStatus,
  getDashboardMetrics,
  getJobTimeline,
  updateJob,
  getJobNotifications,
};
