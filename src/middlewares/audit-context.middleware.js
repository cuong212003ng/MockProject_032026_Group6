const attachAuditContext = (req, res, next) => {
  req.auditContext = {
    actorId: req.user?.id || null,
    actorRole: req.user?.role || null,
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || null,
  };

  next();
};

module.exports = { attachAuditContext };
