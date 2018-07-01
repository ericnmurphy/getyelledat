module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if(req.user){
      return next();
    } else {
      res.redirect('login');
    }
  },
  ensureGuest: function(req, res, next) {
    if(req.user){
      res.redirect('dashboard');
    } else {
      return next();
    }
  }
}