const { query } = require('../config/db');

// ─── Commission Risk Engine ───────────────────────────────────────────────────
const computeRiskStatus = (expirationDate) => {
  if (!expirationDate) return 'UNKNOWN';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft <= 30) return 'EXPIRING_SOON';
  return 'VALID';
};

// ─── Expiry Alerts helper ─────────────────────────────────────────────────────
const buildExpiryAlerts = (insurances, bonds) => {
  const alerts = [];
  (insurances || []).forEach((ins) => {
    if (computeRiskStatus(ins.expiration_date) === 'EXPIRED') alerts.push('Insurance Expired');
    else if (computeRiskStatus(ins.expiration_date) === 'EXPIRING_SOON')
      alerts.push('Insurance Expiring Soon');
  });
  (bonds || []).forEach((bond) => {
    if (computeRiskStatus(bond.expiration_date) === 'EXPIRED') alerts.push('Bond Expired');
    else if (computeRiskStatus(bond.expiration_date) === 'EXPIRING_SOON')
      alerts.push('Bond Expiring Soon');
  });
  return alerts;
};

// ─── Audit Log helper ─────────────────────────────────────────────────────────
const insertAuditLog = async ({
  notaryId,
  tableName,
  recordId,
  action,
  oldValue,
  newValue,
  changedBy,
}, queryExecutor = query) => {
  const runQuery = queryExecutor || query;

  await runQuery(
    `INSERT INTO Notary_audit_logs
       (notary_id, table_name, record_id, action, old_value, new_value, change_by, created_at)
     VALUES
       (@notaryId, @tableName, @recordId, @action, @oldValue, @newValue, @changedBy, GETDATE())`,
    {
      notaryId: notaryId || null,
      tableName: tableName || null,
      recordId: recordId || null,
      action,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      changedBy: changedBy || null,
    },
  );
};

// ─── 1. Lấy danh sách Notary ──────────────────────────────────────────────────
const findAll = async ({ status, state, capability, page = 1, limit = 10 }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let baseQuery = `
    SELECT
      n.id,
      n.full_name,
      n.email,
      n.phone,
      n.photo_url,
      n.status,
      n.employment_type,
      nc.mobile,
      nc.RON,
      nc.loan_signing,
      nc.apostille_related_support,
      nc.max_distance
    FROM notaries n
    LEFT JOIN notary_capabilities nc ON nc.notary_id = n.id
    LEFT JOIN notary_service_areas nsa ON nsa.notary_id = n.id
    LEFT JOIN States s ON s.id = nsa.state_id
    WHERE 1 = 1
  `;
  const params = { limit: parseInt(limit), offset };

  if (status) {
    baseQuery += ' AND n.status = @status';
    params.status = status;
  }
  if (state) {
    baseQuery += ' AND (s.state_code = @state OR s.state_name = @state)';
    params.state = state;
  }
  if (capability) {
    const capMap = {
      mobile: 'nc.mobile = 1',
      RON: 'nc.RON = 1',
      loan_signing: 'nc.loan_signing = 1',
      apostille: 'nc.apostille_related_support = 1',
    };
    if (capMap[capability]) baseQuery += ` AND ${capMap[capability]}`;
  }

  baseQuery += `
    ORDER BY n.id
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  const result = await query(baseQuery, params);
  return result.recordset;
};

// ─── 2. Lấy chi tiết 1 Notary ────────────────────────────────────────────────
const findById = async (id) => {
  const result = await query(
    `SELECT
       n.id, n.user_id, n.ssn, n.full_name, n.date_of_birth,
       n.photo_url, n.phone, n.email, n.employment_type,
       n.start_date, n.internal_notes, n.status, n.residential_address
     FROM notaries n
     WHERE n.id = @id`,
    { id },
  );
  return result.recordset[0] || null;
};

const findByUserId = async (userId) => {
  const result = await query(
    `SELECT
       n.id, n.user_id, n.ssn, n.full_name, n.date_of_birth,
       n.photo_url, n.phone, n.email, n.employment_type,
       n.start_date, n.internal_notes, n.status, n.residential_address
     FROM notaries n
     WHERE n.user_id = @userId`,
    { userId },
  );

  return result.recordset[0] || null;
};

// ─── 3. Tạo mới Notary ───────────────────────────────────────────────────────
const create = async (data) => {
  const {
    user_id,
    ssn,
    full_name,
    date_of_birth,
    photo_url,
    phone,
    email,
    employment_type,
    start_date,
    internal_notes,
    residential_address,
  } = data;

  const result = await query(
    `INSERT INTO notaries
       (user_id, ssn, full_name, date_of_birth, photo_url, phone, email,
        employment_type, start_date, internal_notes, status, residential_address)
     OUTPUT INSERTED.id
     VALUES
       (@user_id, @ssn, @full_name, @date_of_birth, @photo_url, @phone, @email,
        @employment_type, @start_date, @internal_notes, 'PENDING', @residential_address)`,
    {
      user_id: user_id || null,
      ssn: ssn || null,
      full_name,
      date_of_birth: date_of_birth || null,
      photo_url: photo_url || null,
      phone: phone || null,
      email: email || null,
      employment_type: employment_type || null,
      start_date: start_date || null,
      internal_notes: internal_notes || null,
      residential_address: residential_address || null,
    },
  );
  return result.recordset[0]?.id || null;
};

// ─── 4. Cập nhật Bio ─────────────────────────────────────────────────────────
const updateBio = async (id, data) => {
  const previous = await findById(id);
  if (!previous) return null;

  const fields = [];
  const params = { id };
  const allowed = ['phone', 'email', 'residential_address', 'internal_notes', 'photo_url'];

  allowed.forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = @${key}`);
      params[key] = data[key];
    }
  });

  if (fields.length === 0) return { updated: false, previous, current: previous };

  await query(`UPDATE notaries SET ${fields.join(', ')} WHERE id = @id`, params);

  const current = await findById(id);

  return {
    updated: true,
    updated_at: new Date().toISOString(),
    previous,
    current,
  };
};

// ─── 5. Toggle Status ────────────────────────────────────────────────────────
const toggleStatus = async (id, isActive, changedBy) => {
  const previous = await findById(id);
  if (!previous) return null;

  const newStatus = isActive ? 'ACTIVE' : 'INACTIVE';

  await query('UPDATE notaries SET status = @status WHERE id = @id', { id, status: newStatus });

  await query(
    `INSERT INTO Notary_status_history (notary_id, status, reason, effective_date, created_by)
     VALUES (@notaryId, @status, @reason, GETDATE(), @createdBy)`,
    {
      notaryId: id,
      status: newStatus,
      reason: isActive ? 'Activated by admin' : 'Deactivated by admin',
      createdBy: changedBy || null,
    },
  );

  const current = await findById(id);

  return {
    id,
    status: newStatus,
    previous: { status: previous.status },
    current: { status: current?.status || newStatus },
  };
};

// ─── 6. Overview (KPI + Alerts) ──────────────────────────────────────────────
const getOverview = async (id) => {
  const jobsResult = await query(
    'SELECT COUNT(*) AS jobs_completed FROM [job assignments] ja INNER JOIN Job j ON j.id = ja.job_id WHERE ja.notary_id = @id AND j.Status = \'Completed\'',
    { id },
  );

  const insResult = await query(
    'SELECT expiration_date FROM Notary_insurances WHERE notary_id = @id',
    { id },
  );
  const bondResult = await query('SELECT expiration_date FROM Notary_bonds WHERE notary_id = @id', {
    id,
  });
  const incidentResult = await query(
    'SELECT COUNT(*) AS total FROM Notary_incidents WHERE notary_id = @id',
    { id },
  );

  const jobsCompleted = jobsResult.recordset[0]?.jobs_completed || 0;
  const totalIncidents = incidentResult.recordset[0]?.total || 0;
  const errorRate = jobsCompleted > 0 ? (totalIncidents / jobsCompleted).toFixed(4) : 0;
  const alerts = buildExpiryAlerts(insResult.recordset, bondResult.recordset);

  return {
    jobs_completed: jobsCompleted,
    error_rate: parseFloat(errorRate),
    alerts,
  };
};

// ─── 7. Lịch sử trạng thái ───────────────────────────────────────────────────
const getStatusHistory = async (id) => {
  const result = await query(
    `SELECT id, status, reason, effective_date, created_by
     FROM Notary_status_history
     WHERE notary_id = @id
     ORDER BY effective_date DESC`,
    { id },
  );
  return result.recordset;
};

// ─── 8. Danh sách Commission ─────────────────────────────────────────────────
const getCommissions = async (notaryId) => {
  const commResult = await query(
    `SELECT
       nc.id, nc.notary_id, nc.commission_number, nc.issue_date, nc.expiration_date,
       nc.status, nc.is_renewal_applied, nc.expected_renewal_date,
       s.state_code, s.state_name
     FROM Notary_commissions nc
     LEFT JOIN States s ON s.id = nc.commission_state_id
     WHERE nc.notary_id = @notaryId
     ORDER BY nc.issue_date DESC`,
    { notaryId },
  );

  const commissions = commResult.recordset;

  for (const comm of commissions) {
    comm.risk_status = computeRiskStatus(comm.expiration_date);

    const scopeResult = await query(
      'SELECT id, authority_type FROM Authority_scope WHERE commission_id = @commId',
      { commId: comm.id },
    );
    comm.authority_scopes = scopeResult.recordset;
  }

  return commissions;
};

// ─── 9. Tạo Commission ───────────────────────────────────────────────────────
const createCommission = async (notaryId, data) => {
  const {
    commission_state_id,
    commission_number,
    issue_date,
    expiration_date,
    is_renewal_applied,
    expected_renewal_date,
    authority_types = [],
  } = data;

  const riskStatus = computeRiskStatus(expiration_date);

  const result = await query(
    `INSERT INTO Notary_commissions
       (notary_id, commission_state_id, commission_number, issue_date, expiration_date,
        status, is_renewal_applied, expected_renewal_date)
     OUTPUT INSERTED.id
     VALUES
       (@notaryId, @commStateId, @commNumber, @issueDate, @expirationDate,
        @status, @isRenewal, @expectedRenewal)`,
    {
      notaryId,
      commStateId: commission_state_id || null,
      commNumber: commission_number || null,
      issueDate: issue_date || null,
      expirationDate: expiration_date || null,
      status: riskStatus,
      isRenewal: is_renewal_applied ? 1 : 0,
      expectedRenewal: expected_renewal_date || null,
    },
  );

  const commId = result.recordset[0]?.id;

  for (const authType of authority_types) {
    await query(
      'INSERT INTO Authority_scope (commission_id, authority_type) VALUES (@commId, @authType)',
      { commId, authType },
    );
  }

  return { id: commId, risk_status: riskStatus };
};

// ─── 10. Cập nhật Commission ─────────────────────────────────────────────────
const updateCommission = async (commId, data) => {
  const {
    commission_number,
    issue_date,
    expiration_date,
    is_renewal_applied,
    expected_renewal_date,
    authority_types,
  } = data;

  const riskStatus = computeRiskStatus(expiration_date);

  await query(
    `UPDATE Notary_commissions SET
       commission_number = COALESCE(@commNumber, commission_number),
       issue_date = COALESCE(@issueDate, issue_date),
       expiration_date = COALESCE(@expirationDate, expiration_date),
       status = @status,
       is_renewal_applied = COALESCE(@isRenewal, is_renewal_applied),
       expected_renewal_date = COALESCE(@expectedRenewal, expected_renewal_date)
     WHERE id = @commId`,
    {
      commId,
      commNumber: commission_number || null,
      issueDate: issue_date || null,
      expirationDate: expiration_date || null,
      status: riskStatus,
      isRenewal: is_renewal_applied !== undefined ? (is_renewal_applied ? 1 : 0) : null,
      expectedRenewal: expected_renewal_date || null,
    },
  );

  if (Array.isArray(authority_types)) {
    await query('DELETE FROM Authority_scope WHERE commission_id = @commId', { commId });
    for (const authType of authority_types) {
      await query(
        'INSERT INTO Authority_scope (commission_id, authority_type) VALUES (@commId, @authType)',
        { commId, authType },
      );
    }
  }

  return { updated: true, risk_status: riskStatus };
};

// ─── 11. Xem Compliance (Bond + Insurance) ───────────────────────────────────
const getCompliance = async (notaryId) => {
  const insResult = await query(
    `SELECT id, policy_number, provider_name, coverage_amount, expiration_date, file_url
     FROM Notary_insurances WHERE notary_id = @notaryId`,
    { notaryId },
  );
  const bondResult = await query(
    `SELECT id, provider_name, bond_amount, effective_date, expiration_date, file_url
     FROM Notary_bonds WHERE notary_id = @notaryId`,
    { notaryId },
  );

  const insurances = insResult.recordset.map((i) => ({
    ...i,
    risk_status: computeRiskStatus(i.expiration_date),
  }));
  const bonds = bondResult.recordset.map((b) => ({
    ...b,
    risk_status: computeRiskStatus(b.expiration_date),
  }));

  return { insurances, bonds };
};

// ─── 12. Cập nhật Compliance ─────────────────────────────────────────────────
const updateCompliance = async (notaryId, data) => {
  const {
    bond_provider,
    bond_amount,
    bond_effective_date,
    bond_expiry,
    bond_file_url,
    ins_provider,
    ins_coverage,
    ins_expiry,
    ins_policy_number,
    ins_file_url,
  } = data;

  if (bond_provider || bond_amount || bond_expiry) {
    const existBond = await query('SELECT id FROM Notary_bonds WHERE notary_id = @notaryId', {
      notaryId,
    });
    if (existBond.recordset.length > 0) {
      await query(
        `UPDATE Notary_bonds SET
           provider_name = COALESCE(@provider, provider_name),
           bond_amount = COALESCE(@amount, bond_amount),
           effective_date = COALESCE(@effectiveDate, effective_date),
           expiration_date = COALESCE(@expiry, expiration_date),
           file_url = COALESCE(@fileUrl, file_url)
         WHERE notary_id = @notaryId`,
        {
          notaryId,
          provider: bond_provider || null,
          amount: bond_amount || null,
          effectiveDate: bond_effective_date || null,
          expiry: bond_expiry || null,
          fileUrl: bond_file_url || null,
        },
      );
    } else {
      await query(
        `INSERT INTO Notary_bonds (notary_id, provider_name, bond_amount, effective_date, expiration_date, file_url)
         VALUES (@notaryId, @provider, @amount, @effectiveDate, @expiry, @fileUrl)`,
        {
          notaryId,
          provider: bond_provider || null,
          amount: bond_amount || null,
          effectiveDate: bond_effective_date || null,
          expiry: bond_expiry || null,
          fileUrl: bond_file_url || null,
        },
      );
    }
  }

  if (ins_provider || ins_expiry) {
    const existIns = await query('SELECT id FROM Notary_insurances WHERE notary_id = @notaryId', {
      notaryId,
    });
    if (existIns.recordset.length > 0) {
      await query(
        `UPDATE Notary_insurances SET
           policy_number = COALESCE(@policy, policy_number),
           provider_name = COALESCE(@provider, provider_name),
           coverage_amount = COALESCE(@coverage, coverage_amount),
           expiration_date = COALESCE(@expiry, expiration_date),
           file_url = COALESCE(@fileUrl, file_url)
         WHERE notary_id = @notaryId`,
        {
          notaryId,
          policy: ins_policy_number || null,
          provider: ins_provider || null,
          coverage: ins_coverage || null,
          expiry: ins_expiry || null,
          fileUrl: ins_file_url || null,
        },
      );
    } else {
      await query(
        `INSERT INTO Notary_insurances (notary_id, policy_number, provider_name, coverage_amount, expiration_date, file_url)
         VALUES (@notaryId, @policy, @provider, @coverage, @expiry, @fileUrl)`,
        {
          notaryId,
          policy: ins_policy_number || null,
          provider: ins_provider || null,
          coverage: ins_coverage || null,
          expiry: ins_expiry || null,
          fileUrl: ins_file_url || null,
        },
      );
    }
  }

  return { status: 'success' };
};

// ─── 13. Xem Capabilities ────────────────────────────────────────────────────
const getCapabilities = async (notaryId) => {
  const capResult = await query(
    `SELECT nc.id, nc.mobile, nc.RON, nc.loan_signing, nc.apostille_related_support, nc.max_distance
     FROM notary_capabilities nc WHERE nc.notary_id = @notaryId`,
    { notaryId },
  );
  const cap = capResult.recordset[0] || null;

  if (!cap) return null;

  const ronResult = await query(
    `SELECT ron_camera_ready, ron_internet_ready, digital_status
     FROM Ron_technologies WHERE capability_id = @capId`,
    { capId: cap.id },
  );

  const areaResult = await query(
    `SELECT nsa.id, nsa.county_name, s.state_code, s.state_name
     FROM notary_service_areas nsa
     INNER JOIN States s ON s.id = nsa.state_id
     WHERE nsa.notary_id = @notaryId`,
    { notaryId },
  );

  return {
    ...cap,
    ron_tech: ronResult.recordset[0] || null,
    service_areas: areaResult.recordset,
  };
};

// ─── 14. Cập nhật Capabilities ───────────────────────────────────────────────
const updateCapabilities = async (notaryId, data) => {
  const {
    mobile,
    RON,
    loan_signing,
    apostille_related_support,
    max_distance,
    ron_camera_ready,
    ron_internet_ready,
    digital_status,
    service_areas,
  } = data;

  const existCap = await query('SELECT id FROM notary_capabilities WHERE notary_id = @notaryId', {
    notaryId,
  });

  let capId;
  if (existCap.recordset.length > 0) {
    capId = existCap.recordset[0].id;
    await query(
      `UPDATE notary_capabilities SET
         mobile = COALESCE(@mobile, mobile),
         RON = COALESCE(@ron, RON),
         loan_signing = COALESCE(@loanSigning, loan_signing),
         apostille_related_support = COALESCE(@apostille, apostille_related_support),
         max_distance = COALESCE(@maxDist, max_distance)
       WHERE id = @capId`,
      {
        capId,
        mobile: mobile !== undefined ? (mobile ? 1 : 0) : null,
        ron: RON !== undefined ? (RON ? 1 : 0) : null,
        loanSigning: loan_signing !== undefined ? (loan_signing ? 1 : 0) : null,
        apostille:
          apostille_related_support !== undefined ? (apostille_related_support ? 1 : 0) : null,
        maxDist: max_distance || null,
      },
    );
  } else {
    const ins = await query(
      `INSERT INTO notary_capabilities (notary_id, mobile, RON, loan_signing, apostille_related_support, max_distance)
       OUTPUT INSERTED.id
       VALUES (@notaryId, @mobile, @ron, @loanSigning, @apostille, @maxDist)`,
      {
        notaryId,
        mobile: mobile ? 1 : 0,
        ron: RON ? 1 : 0,
        loanSigning: loan_signing ? 1 : 0,
        apostille: apostille_related_support ? 1 : 0,
        maxDist: max_distance || null,
      },
    );
    capId = ins.recordset[0]?.id;
  }

  // Ron_technologies UPSERT
  if (
    ron_camera_ready !== undefined ||
    ron_internet_ready !== undefined ||
    digital_status !== undefined
  ) {
    const existRon = await query('SELECT id FROM Ron_technologies WHERE capability_id = @capId', {
      capId,
    });
    if (existRon.recordset.length > 0) {
      await query(
        `UPDATE Ron_technologies SET
           ron_camera_ready = COALESCE(@camera, ron_camera_ready),
           ron_internet_ready = COALESCE(@internet, ron_internet_ready),
           digital_status = COALESCE(@digitalStatus, digital_status)
         WHERE capability_id = @capId`,
        {
          capId,
          camera: ron_camera_ready !== undefined ? (ron_camera_ready ? 1 : 0) : null,
          internet: ron_internet_ready !== undefined ? (ron_internet_ready ? 1 : 0) : null,
          digitalStatus: digital_status || null,
        },
      );
    } else {
      await query(
        `INSERT INTO Ron_technologies (capability_id, ron_camera_ready, ron_internet_ready, digital_status)
         VALUES (@capId, @camera, @internet, @digitalStatus)`,
        {
          capId,
          camera: ron_camera_ready ? 1 : 0,
          internet: ron_internet_ready ? 1 : 0,
          digitalStatus: digital_status || null,
        },
      );
    }
  }

  // Service areas replace
  if (Array.isArray(service_areas)) {
    await query('DELETE FROM notary_service_areas WHERE notary_id = @notaryId', { notaryId });
    for (const area of service_areas) {
      await query(
        `INSERT INTO notary_service_areas (notary_id, state_id, county_name)
         VALUES (@notaryId, @stateId, @county)`,
        { notaryId, stateId: area.state_id, county: area.county_name || null },
      );
    }
  }

  return { status: 'success' };
};

// ─── 15. Xem Availability ────────────────────────────────────────────────────
const getAvailability = async (notaryId) => {
  const result = await query(
    `SELECT id, working_days_per_week, start_time, end_time, fixed_days_off
     FROM notary_availabilities WHERE notary_id = @notaryId`,
    { notaryId },
  );
  return result.recordset[0] || null;
};

// ─── 16. Cài đặt Availability (UPSERT) ──────────────────────────────────────
const setAvailability = async (notaryId, data) => {
  const { working_days_per_week, start_time, end_time, fixed_days_off } = data;

  const exist = await query('SELECT id FROM notary_availabilities WHERE notary_id = @notaryId', {
    notaryId,
  });

  if (exist.recordset.length > 0) {
    await query(
      `UPDATE notary_availabilities SET
         working_days_per_week = COALESCE(@wpw, working_days_per_week),
         start_time = COALESCE(@startTime, start_time),
         end_time = COALESCE(@endTime, end_time),
         fixed_days_off = COALESCE(@fixedOff, fixed_days_off)
       WHERE notary_id = @notaryId`,
      {
        notaryId,
        wpw: working_days_per_week || null,
        startTime: start_time || null,
        endTime: end_time || null,
        fixedOff: fixed_days_off || null,
      },
    );
  } else {
    await query(
      `INSERT INTO notary_availabilities
         (notary_id, working_days_per_week, start_time, end_time, fixed_days_off)
       VALUES (@notaryId, @wpw, @startTime, @endTime, @fixedOff)`,
      {
        notaryId,
        wpw: working_days_per_week || null,
        startTime: start_time || null,
        endTime: end_time || null,
        fixedOff: fixed_days_off || null,
      },
    );
  }

  return { status: 'success' };
};

// ─── 17. Danh sách Documents ─────────────────────────────────────────────────
const buildDocumentFilters = (notaryId, filters = {}, options = {}) => {
  const { currentOnly = true } = options;
  const whereClauses = ['notary_id = @notaryId'];
  const params = { notaryId };

  if (currentOnly) {
    whereClauses.push('is_current_version = 1');
  }

  if (filters.document_type) {
    whereClauses.push('doc_category = @documentType');
    params.documentType = filters.document_type;
  }

  if (filters.status) {
    whereClauses.push('verified_status = @status');
    params.status = filters.status;
  }

  if (filters.from_date) {
    whereClauses.push('upload_date >= @fromDate');
    params.fromDate = filters.from_date;
  }

  if (filters.to_date) {
    whereClauses.push('upload_date < DATEADD(DAY, 1, @toDate)');
    params.toDate = filters.to_date;
  }

  return {
    whereClause: `WHERE ${whereClauses.join(' AND ')}`,
    params,
  };
};

const countDocuments = async (notaryId, filters = {}) => {
  const { whereClause, params } = buildDocumentFilters(notaryId, filters);
  const result = await query(
    `SELECT COUNT(*) AS total
     FROM Notary_documents
     ${whereClause}`,
    params,
  );

  return result.recordset[0]?.total || 0;
};

const listDocumentsPage = async (notaryId, filters = {}, { offset = 0, limit = 10 } = {}) => {
  const { whereClause, params } = buildDocumentFilters(notaryId, filters);
  const result = await query(
    `SELECT
       id AS doc_id,
       notary_id,
       doc_category AS document_type,
       file_name,
       upload_date,
       verified_status,
       version,
       is_current_version,
       file_url
     FROM Notary_documents
     ${whereClause}
     ORDER BY upload_date DESC, id DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    { ...params, offset, limit },
  );

  return result.recordset;
};

const listDocuments = async (notaryId, { document_type, status } = {}) => {
  return listDocumentsPage(notaryId, { document_type, status }, { offset: 0, limit: 1000 });
};

// ─── 18. Upload Document ─────────────────────────────────────────────────────
const findDocumentById = async (docId, notaryId = null) => {
  let documentQuery = `
    SELECT
      id AS doc_id,
      notary_id,
      doc_category AS document_type,
      file_name,
      upload_date,
      verified_status,
      version,
      is_current_version,
      file_url
    FROM Notary_documents
    WHERE id = @docId
  `;
  const params = { docId };

  if (notaryId) {
    documentQuery += ' AND notary_id = @notaryId';
    params.notaryId = notaryId;
  }

  const result = await query(documentQuery, params);
  return result.recordset[0] || null;
};

const insertDocumentVersion = async (
  notaryId,
  { docCategory, fileName, fileUrl },
  queryExecutor = query,
) => {
  const runQuery = queryExecutor || query;
  const versionResult = await runQuery(
    `SELECT MAX(version) AS max_ver FROM Notary_documents
     WHERE notary_id = @notaryId AND doc_category = @docCategory`,
    { notaryId, docCategory },
  );
  const newVersion = (versionResult.recordset[0]?.max_ver || 0) + 1;

  await runQuery(
    `UPDATE Notary_documents SET is_current_version = 0
     WHERE notary_id = @notaryId AND doc_category = @docCategory`,
    { notaryId, docCategory },
  );

  const result = await runQuery(
    `INSERT INTO Notary_documents
       (notary_id, doc_category, file_name, upload_date, verified_status, version, is_current_version, file_url)
     OUTPUT
       INSERTED.id AS doc_id,
       INSERTED.notary_id,
       INSERTED.doc_category AS document_type,
       INSERTED.file_name,
       INSERTED.upload_date,
       INSERTED.verified_status,
       INSERTED.version,
       INSERTED.is_current_version,
       INSERTED.file_url
     VALUES (@notaryId, @docCategory, @fileName, GETDATE(), 'PENDING', @version, 1, @fileUrl)`,
    {
      notaryId,
      docCategory: docCategory || null,
      fileName: fileName || null,
      version: newVersion,
      fileUrl: fileUrl || null,
    },
  );

  return result.recordset[0] || null;
};

/* eslint-disable no-unused-vars */
const uploadDocumentLegacy = async (notaryId, data) => {
  const { doc_category, file_name, file_url } = data;

  // Lấy version hiện tại
  const verResult = await query(
    `SELECT MAX(version) AS max_ver FROM Notary_documents
     WHERE notary_id = @notaryId AND doc_category = @docCategory`,
    { notaryId, docCategory: doc_category },
  );
  const newVersion = (verResult.recordset[0]?.max_ver || 0) + 1;

  // Set version cũ is_current_version = 0
  await query(
    `UPDATE Notary_documents SET is_current_version = 0
     WHERE notary_id = @notaryId AND doc_category = @docCategory`,
    { notaryId, docCategory: doc_category },
  );

  const result = await query(
    `INSERT INTO Notary_documents
       (notary_id, doc_category, file_name, upload_date, verified_status, version, is_current_version, file_url)
     OUTPUT INSERTED.id
     VALUES (@notaryId, @docCategory, @fileName, GETDATE(), 'PENDING', @version, 1, @fileUrl)`,
    {
      notaryId,
      docCategory: doc_category || null,
      fileName: file_name || null,
      version: newVersion,
      fileUrl: file_url || null,
    },
  );

  return { id: result.recordset[0]?.id, version: newVersion, verified_status: 'PENDING' };
};

// ─── 19. Verify Document ─────────────────────────────────────────────────────
/* eslint-enable no-unused-vars */
const uploadDocument = async (notaryId, data) =>
  insertDocumentVersion(notaryId, {
    docCategory: data.doc_category,
    fileName: data.file_name,
    fileUrl: data.file_url,
  });

/* eslint-disable no-unused-vars */
const verifyDocumentLegacy = async (docId, status, changedBy) => {
  const VALID_STATUSES = ['APPROVED', 'PENDING', 'REJECTED'];
  if (!VALID_STATUSES.includes(status)) return null;

  await query('UPDATE Notary_documents SET verified_status = @status WHERE id = @docId', {
    docId,
    status,
  });

  const doc = await query('SELECT notary_id FROM Notary_documents WHERE id = @docId', { docId });
  const notaryId = doc.recordset[0]?.notary_id;

  await insertAuditLog({
    notaryId,
    tableName: 'Notary_documents',
    recordId: docId,
    action: 'UPDATE',
    oldValue: null,
    newValue: { verified_status: status },
    changedBy,
  });

  return { doc_id: docId, verified_status: status };
};

// ─── 20. Audit Logs ──────────────────────────────────────────────────────────
/* eslint-enable no-unused-vars */
const updateDocumentVerificationStatus = async (
  docId,
  notaryId,
  status,
  queryExecutor = query,
) => {
  const runQuery = queryExecutor || query;
  const validStatuses = ['APPROVED', 'PENDING', 'REJECTED'];
  if (!validStatuses.includes(status)) return null;

  await runQuery(
    `UPDATE Notary_documents
     SET verified_status = @status
     WHERE id = @docId AND notary_id = @notaryId`,
    { docId, notaryId, status },
  );

  const result = await runQuery(
    `SELECT
       id AS doc_id,
       notary_id,
       doc_category AS document_type,
       file_name,
       upload_date,
       verified_status,
       version,
       is_current_version,
       file_url
     FROM Notary_documents
     WHERE id = @docId AND notary_id = @notaryId`,
    { docId, notaryId },
  );

  return result.recordset[0] || null;
};

const verifyDocument = async (docId, status) => {
  const document = await findDocumentById(docId);
  if (!document) {
    return null;
  }

  return updateDocumentVerificationStatus(docId, document.notary_id, status);
};

const buildAuditLogFilters = (notaryId, filters = {}) => {
  const whereClauses = ['notary_id = @notaryId'];
  const params = { notaryId };

  if (filters.from_date) {
    whereClauses.push('created_at >= @fromDate');
    params.fromDate = filters.from_date;
  }

  if (filters.to_date) {
    whereClauses.push('created_at < DATEADD(DAY, 1, @toDate)');
    params.toDate = filters.to_date;
  }

  return {
    whereClause: `WHERE ${whereClauses.join(' AND ')}`,
    params,
  };
};

const countAuditLogs = async (notaryId, filters = {}) => {
  const { whereClause, params } = buildAuditLogFilters(notaryId, filters);
  const result = await query(
    `SELECT COUNT(*) AS total
     FROM Notary_audit_logs
     ${whereClause}`,
    params,
  );

  return result.recordset[0]?.total || 0;
};

const getAuditLogsPage = async (notaryId, filters = {}, { offset = 0, limit = 10 } = {}) => {
  const { whereClause, params } = buildAuditLogFilters(notaryId, filters);
  const result = await query(
    `SELECT id, table_name, record_id, action, old_value, new_value, change_by, created_at
     FROM Notary_audit_logs
     ${whereClause}
     ORDER BY created_at DESC, id DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    { ...params, offset, limit },
  );

  return result.recordset;
};

/* eslint-disable no-unused-vars */
const getAuditLogsLegacy = async (notaryId, { from_date, to_date } = {}) => {
  let q = `
    SELECT id, table_name, record_id, action, old_value, new_value, change_by, created_at
    FROM Notary_audit_logs
    WHERE notary_id = @notaryId
  `;
  const params = { notaryId };

  if (from_date) {
    q += ' AND created_at >= @fromDate';
    params.fromDate = from_date;
  }
  if (to_date) {
    q += ' AND created_at <= @toDate';
    params.toDate = to_date;
  }

  q += ' ORDER BY created_at DESC';

  const result = await query(q, params);
  return result.recordset.map((log) => ({
    ...log,
    old_value: log.old_value ? JSON.parse(log.old_value) : null,
    new_value: log.new_value ? JSON.parse(log.new_value) : null,
  }));
};

// ─── 21. Incidents ───────────────────────────────────────────────────────────
/* eslint-enable no-unused-vars */
const getAuditLogs = async (notaryId, { from_date, to_date } = {}) =>
  getAuditLogsPage(notaryId, { from_date, to_date }, { offset: 0, limit: 1000 });

const buildIncidentFilters = (notaryId, filters = {}) => {
  const whereClauses = ['notary_id = @notaryId'];
  const params = { notaryId };

  if (filters.status) {
    whereClauses.push('status = @status');
    params.status = filters.status;
  }

  return {
    whereClause: `WHERE ${whereClauses.join(' AND ')}`,
    params,
  };
};

const countIncidents = async (notaryId, filters = {}) => {
  const { whereClause, params } = buildIncidentFilters(notaryId, filters);
  const result = await query(
    `SELECT COUNT(*) AS total
     FROM Notary_incidents
     ${whereClause}`,
    params,
  );

  return result.recordset[0]?.total || 0;
};

const getIncidentsPage = async (notaryId, filters = {}, { offset = 0, limit = 10 } = {}) => {
  const { whereClause, params } = buildIncidentFilters(notaryId, filters);
  const result = await query(
    `SELECT
       id AS inc_id,
       notary_id,
       incident_type,
       description,
       severity,
       status,
       resolved_at,
       created_at
     FROM Notary_incidents
     ${whereClause}
     ORDER BY created_at DESC, id DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    { ...params, offset, limit },
  );

  return result.recordset;
};

const getIncidents = async (notaryId) => {
  return getIncidentsPage(notaryId, {}, { offset: 0, limit: 1000 });
};

const createIncident = async (notaryId, data) => {
  const { incident_type, description, severity, status } = data;
  const result = await query(
    `INSERT INTO Notary_incidents (notary_id, incident_type, description, severity, status, created_at)
     OUTPUT
       INSERTED.id AS inc_id,
       INSERTED.notary_id,
       INSERTED.incident_type,
       INSERTED.description,
       INSERTED.severity,
       INSERTED.status,
       INSERTED.resolved_at,
       INSERTED.created_at
     VALUES (@notaryId, @type, @desc, @severity, @status, GETDATE())`,
    {
      notaryId,
      type: incident_type || null,
      desc: description || null,
      severity: severity || 'LOW',
      status: status || 'OPEN',
    },
  );
  return result.recordset[0] || null;
};

module.exports = {
  findAll,
  findById,
  findByUserId,
  create,
  insertAuditLog,
  updateBio,
  toggleStatus,
  getOverview,
  getStatusHistory,
  getCommissions,
  createCommission,
  updateCommission,
  getCompliance,
  updateCompliance,
  getCapabilities,
  updateCapabilities,
  getAvailability,
  setAvailability,
  countDocuments,
  listDocumentsPage,
  findDocumentById,
  insertDocumentVersion,
  updateDocumentVerificationStatus,
  listDocuments,
  uploadDocument,
  verifyDocument,
  countAuditLogs,
  getAuditLogsPage,
  getAuditLogs,
  countIncidents,
  getIncidentsPage,
  getIncidents,
  createIncident,
  computeRiskStatus,
};
