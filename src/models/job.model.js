const { query, sql } = require('../config/db');

// ─── 1. Lấy danh sách Job ───
const findAll = async (filters) => {
  const { requested_start_time, requested_end_time, status, service_type, location_type } = filters;

  let baseQuery = `
    SELECT
      j.id,
      j.Client_ID,
      j.Service_Type,
      j.Location_Type,
      j.Location_Details,
      j.Requested_Start_Time,
      j.Requested_End_Time,
      j.Signer_Count,
      j.Status
    FROM Job j
    WHERE 1 = 1
  `;

  const params = {};

  if (requested_start_time) {
    baseQuery += ' AND j.Requested_Start_Time >= @requested_start_time';
    params.requested_start_time = requested_start_time;
  }
  if (requested_end_time) {
    baseQuery += ' AND j.Requested_End_Time <= @requested_end_time';
    params.requested_end_time = requested_end_time;
  }
  if (status) {
    baseQuery += ' AND j.Status = @status';
    params.status = status;
  }
  if (service_type) {
    baseQuery += ' AND j.Service_Type = @service_type';
    params.service_type = service_type;
  }
  if (location_type) {
    baseQuery += ' AND j.Location_Type = @location_type';
    params.location_type = location_type;
  }

  baseQuery += ' ORDER BY j.Requested_Start_Time ASC';

  const result = await query(baseQuery, params);
  return result.recordset;
};

// ─── 2. Lấy chi tiết Job ───
const findById = async (id) => {
  const result = await query(
    `SELECT
      j.id,
      j.Client_ID,
      j.Service_Type,
      j.Location_Type,
      j.Location_Details,
      j.Requested_Start_Time,
      j.Requested_End_Time,
      j.Signer_Count,
      j.Status
    FROM Job j
    WHERE j.id = @id`,
    { id }
  );
  return result.recordset[0] || null;
};

// ─── 3. Tìm Notary phù hợp ───
const findAvailableNotaries = async (jobId, limit, offset) => {
  const result = await query(
    `SELECT
      n.id                          AS Notary_ID,
      n.full_name                   AS Full_Name,
      n.photo_url,
      nc.mobile,
      nc.RON,
      nc.loan_signing,
      nc.max_distance,
      na.start_time,
      na.end_time,
      4.8                           AS Rating,
      '5km'                         AS Distance
    FROM notaries n
    INNER JOIN notary_capabilities nc
      ON nc.notary_id = n.id
    INNER JOIN notary_availabilities na
      ON na.notary_id = n.id
    INNER JOIN notary_service_areas nsa
      ON nsa.notary_id = n.id
    INNER JOIN Job j
      ON j.id = @jobId
    WHERE n.status = 'ACTIVE'
      AND nc.max_distance >= 0
    ORDER BY n.id
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY`,
    { jobId, limit: parseInt(limit) || 10, offset: parseInt(offset) || 0 }
  );
  return result.recordset;
};

// ─── 4. Assign Job cho Notary ───
const assignJob = async (jobId, notaryId, assignedAt) => {
  const pool = await require('../config/db').query('SELECT 1');
  const { sql: mssql } = require('../config/db');

  const assignResult = await query(
    `INSERT INTO [job assignments] (job_id, notary_id, assigned_at, accepted_at)
     OUTPUT INSERTED.id, INSERTED.job_id, INSERTED.notary_id, INSERTED.assigned_at, INSERTED.accepted_at
     VALUES (@jobId, @notaryId, @assignedAt, NULL)`,
    { jobId, notaryId, assignedAt }
  );

  await query(
    `UPDATE Job SET Status = 'Assigned' WHERE id = @jobId`,
    { jobId }
  );

  await query(
    `INSERT INTO job_status_logs (job_id, status, time_stamps, delay, exception_flags, note)
     VALUES (@jobId, 'Assigned', GETDATE(), NULL, NULL, 'Assigned to notary')`,
    { jobId }
  );

  return assignResult.recordset[0] || null;
};

// ─── 5. Notary Accept Job ───
const acceptAssignment = async (assignmentId) => {
  const result = await query(
    `UPDATE [job assignments]
     SET accepted_at = GETDATE()
     OUTPUT INSERTED.id AS assignment_id, INSERTED.accepted_at
     WHERE id = @assignmentId`,
    { assignmentId }
  );
  return result.recordset[0] || null;
};

// ─── 6. Cập nhật trạng thái Job ───
const updateStatus = async (jobId, status) => {
  await query(
    `UPDATE Job SET Status = @status WHERE id = @jobId`,
    { jobId, status }
  );

  await query(
    `INSERT INTO job_status_logs (job_id, status, time_stamps, delay, exception_flags, note)
     VALUES (@jobId, @status, GETDATE(), NULL, NULL, NULL)`,
    { jobId, status }
  );

  const result = await query(
    `SELECT Status FROM Job WHERE id = @jobId`,
    { jobId }
  );
  return result.recordset[0] || null;
};

// ─── 7. Get Dashboard Metrics ───
const getDashboardMetrics = async (date) => {
  const result = await query(
    `SELECT
      SUM(CASE WHEN Status = 'Pending'   THEN 1 ELSE 0 END) AS total_pending,
      SUM(CASE WHEN Status = 'Assigned'  THEN 1 ELSE 0 END) AS total_assigned,
      SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS total_completed
    FROM Job
    WHERE CAST(Requested_Start_Time AS DATE) = @date`,
    { date }
  );
  return result.recordset[0] || {};
};

// ─── 8. Get Job Timeline ───
const getTimeline = async (jobId) => {
  const result = await query(
    `SELECT
      status,
      time_stamps AS time,
      delay,
      exception_flags,
      note
    FROM job_status_logs
    WHERE job_id = @jobId
    ORDER BY time_stamps ASC`,
    { jobId }
  );
  return result.recordset;
};

// ─── 9. Re-assign / Edit Job ───
const updateJob = async (jobId, fields) => {
  const { requested_start_time, requested_end_time, location_type, location_details, notary_id } = fields;

  let updateFields = [];
  const params = { jobId };

  if (requested_start_time) {
    updateFields.push('Requested_Start_Time = @requested_start_time');
    params.requested_start_time = requested_start_time;
  }
  if (requested_end_time) {
    updateFields.push('Requested_End_Time = @requested_end_time');
    params.requested_end_time = requested_end_time;
  }
  if (location_type) {
    updateFields.push('Location_Type = @location_type');
    params.location_type = location_type;
  }
  if (location_details) {
    updateFields.push('Location_Details = @location_details');
    params.location_details = location_details;
  }

  if (updateFields.length > 0) {
    await query(
      `UPDATE Job SET ${updateFields.join(', ')} WHERE id = @jobId`,
      params
    );
  }

  // Nếu đổi Notary → update job_assignments
  if (notary_id) {
    await query(
      `UPDATE [job assignments]
       SET notary_id = @notary_id, accepted_at = NULL
       WHERE job_id = @jobId`,
      { jobId, notary_id }
    );
  }

  return { updated: true };
};

// ─── 10. Get Job Notifications ───
const getNotifications = async (jobId) => {
  const result = await query(
    `SELECT
      n.notification_id,
      e.event_name,
      n.sms,
      n.email,
      n.app,
      n.delay,
      n.time_stamp
    FROM notifications n
    INNER JOIN events e ON e.event_id = n.event_id
    WHERE n.job_id = @jobId
    ORDER BY n.time_stamp ASC`,
    { jobId }
  );
  return result.recordset;
};

module.exports = {
  findAll,
  findById,
  findAvailableNotaries,
  assignJob,
  acceptAssignment,
  updateStatus,
  getDashboardMetrics,
  getTimeline,
  updateJob,
  getNotifications,
};
