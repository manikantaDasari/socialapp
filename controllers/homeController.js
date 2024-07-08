const BigPicture = require("../middlewares/bigPromise")

exports.home = BigPicture(async (req, res) => {
    res.status(200).json({
        success: true,
        greetings: 'Hello from Server'
    })
});