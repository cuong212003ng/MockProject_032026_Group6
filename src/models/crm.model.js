const { query } = require('../config/db');

const CRM_TABLES = {
  customers: '[crm_db].[dbo].[customers]',
  contacts: '[crm_db].[dbo].[customer_contacts]',
  tags: '[crm_db].[dbo].[customer_tags]',
  jobs: '[crm_db].[dbo].[crm_jobs]',
  invoices: '[crm_db].[dbo].[invoices]',
  contracts: '[crm_db].[dbo].[contracts]',
};

const getCustomers = async ({
  page = 1,
  limit = 10,
  search,
  type,
  industry,
  status,
  tag,
  sortBy = 'id',
  sortOrder = 'asc',
}) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * pageSize;

  const whereClauses = ['1 = 1'];
  const params = { offset, limit: pageSize };

  if (search) {
    whereClauses.push('(c.customer_name LIKE @search OR c.customer_code LIKE @search)');
    params.search = `%${search}%`;
  }
  if (type) {
    whereClauses.push('c.customer_type = @type');
    params.type = type;
  }
  if (industry) {
    whereClauses.push('c.industry = @industry');
    params.industry = industry;
  }
  if (status) {
    whereClauses.push('c.status = @status');
    params.status = status;
  }
  if (tag) {
    whereClauses.push(
      `EXISTS (SELECT 1 FROM ${CRM_TABLES.tags} t WHERE t.customer_id = c.id AND t.tag_name = @tag)`,
    );
    params.tag = tag;
  }

  const sortableColumns = {
    id: 'c.id',
    customer_name: 'c.customer_name',
    customer_type: 'c.customer_type',
    industry: 'c.industry',
    status: 'c.status',
    annual_revenue_usd: 'c.annual_revenue_usd',
    created_at: 'c.created_at',
  };
  const safeSortBy = sortableColumns[sortBy] || sortableColumns.id;
  const safeSortOrder = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const whereSql = whereClauses.join(' AND ');

  const totalResult = await query(
    `SELECT COUNT(*) AS total
     FROM ${CRM_TABLES.customers} c
     WHERE ${whereSql}`,
    params,
  );
  const totalItems = totalResult.recordset[0]?.total || 0;

  const listResult = await query(
    `SELECT
      c.id,
      c.customer_code,
      c.customer_name,
      c.customer_type,
      c.industry,
      c.status,
      c.annual_revenue_usd,
      (
        SELECT TOP 1 cc.full_name
        FROM ${CRM_TABLES.contacts} cc
        WHERE cc.customer_id = c.id
        ORDER BY cc.is_primary DESC, cc.id ASC
      ) AS primary_contact_name,
      (
        SELECT TOP 1 cc.email
        FROM ${CRM_TABLES.contacts} cc
        WHERE cc.customer_id = c.id
        ORDER BY cc.is_primary DESC, cc.id ASC
      ) AS primary_contact_email,
      (
        SELECT COUNT(*)
        FROM ${CRM_TABLES.jobs} j
        WHERE j.customer_id = c.id
      ) AS jobs_count,
      (
        SELECT STRING_AGG(t.tag_name, ',')
        FROM ${CRM_TABLES.tags} t
        WHERE t.customer_id = c.id
      ) AS tags
     FROM ${CRM_TABLES.customers} c
     WHERE ${whereSql}
     ORDER BY ${safeSortBy} ${safeSortOrder}
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    params,
  );

  return {
    items: listResult.recordset.map((item) => ({
      id: item.id,
      customer_code: item.customer_code,
      customer_name: item.customer_name,
      customer_type: item.customer_type,
      industry: item.industry,
      status: item.status,
      revenue_usd: Number(item.annual_revenue_usd || 0),
      jobs_count: item.jobs_count || 0,
      primary_contact: {
        name: item.primary_contact_name || null,
        email: item.primary_contact_email || null,
      },
      tags: item.tags ? item.tags.split(',') : [],
    })),
    pagination: {
      page: currentPage,
      limit: pageSize,
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / pageSize) || 1,
    },
  };
};

const updateCustomerStatus = async (id, status) => {
  await query(
    `UPDATE ${CRM_TABLES.customers}
     SET status = @status, updated_at = GETDATE()
     WHERE id = @id`,
    { id, status },
  );

  const result = await query(
    `SELECT id, customer_code, customer_name, status, updated_at
     FROM ${CRM_TABLES.customers}
     WHERE id = @id`,
    { id },
  );
  return result.recordset[0] || null;
};

const getDashboardOverview = async () => {
  const [customers, revenue, jobs] = await Promise.all([
    query(`SELECT COUNT(*) AS total_customers FROM ${CRM_TABLES.customers}`),
    query(`SELECT ISNULL(SUM(annual_revenue_usd), 0) AS total_revenue FROM ${CRM_TABLES.customers}`),
    query(`SELECT COUNT(*) AS total_jobs FROM ${CRM_TABLES.jobs}`),
  ]);

  return {
    total_customers: customers.recordset[0]?.total_customers || 0,
    total_revenue: Number(revenue.recordset[0]?.total_revenue || 0),
    jobs_by_customer: jobs.recordset[0]?.total_jobs || 0,
    net_profit: Number((Number(revenue.recordset[0]?.total_revenue || 0) * 0.4).toFixed(2)),
    operational: Number((Number(revenue.recordset[0]?.total_revenue || 0) * 0.6).toFixed(2)),
  };
};

const getTopClients = async (limit = 3) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 3, 1), 20);
  const result = await query(
    `SELECT TOP (@limit)
      c.id,
      c.customer_name,
      c.annual_revenue_usd,
      c.industry
     FROM ${CRM_TABLES.customers} c
     ORDER BY c.annual_revenue_usd DESC, c.id ASC`,
    { limit: safeLimit },
  );
  return result.recordset.map((row) => ({
    id: row.id,
    customer_name: row.customer_name,
    contract_value_usd: Number(row.annual_revenue_usd || 0),
    industry: row.industry,
  }));
};

const getRevenueTrend = async () => {
  const result = await query(
    `SELECT
      FORMAT(j.closed_at, 'yyyy-MM') AS period,
      SUM(j.amount_usd) AS revenue
     FROM ${CRM_TABLES.jobs} j
     WHERE j.closed_at IS NOT NULL AND j.status = 'Completed'
     GROUP BY FORMAT(j.closed_at, 'yyyy-MM')
     ORDER BY period ASC`,
  );
  return result.recordset.map((row) => ({
    period: row.period,
    revenue_usd: Number(row.revenue || 0),
  }));
};

const getAlerts = async () => {
  const [overdueInvoices, expiringContracts] = await Promise.all([
    query(
      `SELECT TOP 10
        i.invoice_no,
        c.customer_name,
        i.amount_usd,
        i.due_date,
        i.status
       FROM ${CRM_TABLES.invoices} i
       INNER JOIN ${CRM_TABLES.customers} c ON c.id = i.customer_id
       WHERE i.status = 'Overdue'
          OR (i.status = 'Unpaid' AND i.due_date < CAST(GETDATE() AS DATE))
       ORDER BY i.due_date ASC`,
    ),
    query(
      `SELECT TOP 10
        ct.contract_name,
        c.customer_name,
        ct.contract_value,
        ct.expiration_date,
        ct.status
       FROM ${CRM_TABLES.contracts} ct
       INNER JOIN ${CRM_TABLES.customers} c ON c.id = ct.customer_id
       WHERE ct.expiration_date BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 30, CAST(GETDATE() AS DATE))
       ORDER BY ct.expiration_date ASC`,
    ),
  ]);

  return {
    overdue_invoices: overdueInvoices.recordset,
    contracts_nearing_expiration: expiringContracts.recordset,
  };
};

module.exports = {
  getCustomers,
  updateCustomerStatus,
  getDashboardOverview,
  getTopClients,
  getRevenueTrend,
  getAlerts,
};
