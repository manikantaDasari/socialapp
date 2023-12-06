const express = require("express");
const mongoose = require("mongoose");

const connectWithDb = () => mongoose
  .connect(process.env.DB_LOCAL_URL)
  .then(console.log("Connected to DB!"))
  .catch((err) =>{
    console.log("Db Issuess");
    console.log(err);
    process.exit(1)

});

module.exports = connectWithDb;
