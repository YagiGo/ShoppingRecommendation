var express = require('express');
var router = express.Router();
let getURLS = require('../getURLs.js');
const MongoClient = require("mongodb").MongoClient;
const dbUrl = "mongodb://localhost:27017"; //For test purpose only! Don't use this in the production environment!!!
const dbName = "ShoppingRecommendation";
const collectionName = "results";


// Get Urls
router.get("/api/getUrls", (req, res) => {
    // getURLS.update("https://www.amazon.co.jp/Z370%E6%90%AD%E8%BC%89-%E3%83%9E%E3%82%B6%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89-LGA1151%E5%AF%BE%E5%BF%9C-Z370-F-GAMING%E3%80%90ATX/dp/B075RHWLF2?pd_rd_wg=9RhEa&pd_rd_r=afa399b4-db01-4d9d-bc71-14e2eb7b4ed4&pd_rd_w=3haAW&ref_=pd_gw_cartx&pf_rd_r=GSM3SR1WPDF0DMHSTYRJ&pf_rd_p=d1951c0b-fec3-5650-8183-55a36759b1b7")
    //     .then(urlList => {
    //         res.json(urlList);
    //     })
    // TODO Use a DB to store the data to show
});

// Get URL from the user

router.post("/api/urlToBeAnalyzed", (req, res, next) => {
    console.log(req.body);
    console.log(req.body.urlToBeAnalyzed);
    getURLS.update(req.body.urlToBeAnalyzed)
        .then(urlList => {
            console.log(urlList);
            res.json(urlList);
        });

    // res.send("Finished");
    // getURLS.readDataFromDB(MongoClient, dbUrl, dbName, collectionName, req.body.urlToBeAnalyzed)
    //     .then(result => {
    //         console.log("SENDING RESULT...");
    //         console.log(result);
    //         res.json(result);
    //     })

    // Test Data
    // getURLS.dummyReply()
    //     .then(urlList => {
    //         console.log(urlList);
    //         res.json(urlList);
    //     })


});
module.exports = router;
