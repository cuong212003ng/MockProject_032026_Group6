const normalizePagination = (page, limit, maxLimit = 100) => {
  const safePage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), maxLimit)
      : 10;

  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
};

const buildPagination = ({ page, limit, totalItems }) => ({
  current_page: page,
  total_items: totalItems,
  total_pages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
  limit,
});

module.exports = {
  normalizePagination,
  buildPagination,
};
