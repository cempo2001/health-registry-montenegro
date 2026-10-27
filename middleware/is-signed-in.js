// Ako je korisnik prijavljen, nastavi dalje; inače ga pošalji na prijavu
const isSignedIn = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/auth/sign-in");
};

module.exports = isSignedIn;
