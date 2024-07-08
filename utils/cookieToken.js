const cookieToken = (user, res) => {
  const token = user.getJwtToken();
  const options = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  user.password= undefined;
  return res.status(200).cookie("token", token, options).json({
    user,
    token,
    success: true,
  });
};

module.exports = cookieToken;
