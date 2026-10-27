// Korisnik iz sesije postaje dostupan u svim view-ovima kao "user"
const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user ? req.session.user : null;
  next();
};

module.exports = passUserToView;
