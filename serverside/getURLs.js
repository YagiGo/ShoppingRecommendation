// Get the page render and saved as HTML
// Need execution from the JS environment

//let exec = require("child_process").exec
// exec("ls", (error, stdOut, stdErr) => {
//     if(stdErr) {
//         console.error(stdErr)
//     }
//     console.log(stdOut)
// });
// Get a website's url with puppeteer
const puppeteer = require('puppeteer');
const fs = require("fs-extra");
const path = require("path");
const {URL} = require("url");

// DB Access Part
const MongoClient = require("mongodb").MongoClient;
const dbUrl = "mongodb://localhost:27017"; //For test purpose only! Don't use this in the production environment!!!
const dbName = "ShoppingRecommendation";
const maximumSitesNum = 3; // How many recommended websites will be displayed
// Create URL digest
// Add hashCode method to the prototype


async function saveDataIntoDB(mongoClient, dbURL, dbName, collectionName, data, url) {
    mongoClient.connect(dbURL)
        .then(function(db) {
            let dbase = db.db(dbName);
            // console.log("DB Connected");
            dbase.createCollection(collectionName)
                .then(function (dbCollection) {
                            // console.log(url);
                            dbCollection.findOne({"digest":url}, (err, result) => {
                                // console.log(result);
                                if(result === null) {
                                    console.log("WILL INSERT DATA:", data);

                                    dbCollection.insertOne(data, (err) => {
                                        console.error(err);
                                    });
                                }
                                else {
                                    console.log("INFO: This site has been searched before, will not be searched again");
                                }
                            });
                        });
                });
}

async function readDataFromDB(mongoClient, dbURL, dbName, collectionName, url) {
        MongoClient.connect(dbUrl)
            .then(function (db) {
                let dbase = db.db(dbName);
                dbase.createCollection(collectionName)
                    .then(function (dbCollection) {
                        // console.log(url);
                        dbCollection.findOne({"digest": url}, (err, result) => {
                            // console.log(result);
                            if (result === null) {
                                update(url)
                                    .then(urlResult => {
                                        saveDataIntoDB(mongoClient, dbURL, dbName, collectionName, urlResult, url)
                                            .then(() => {
                                                return new Promise(((resolve, reject) => {
                                                    resolve(urlResult);
                                                    reject("Error!");
                                                }))
                                            });
                                        // console.log(urlResult);
                                    });
                            }
                            else {
                                console.log(result);
                                return new Promise(((resolve, reject) => {
                                    resolve(result);
                                    reject("Error!");
                                }))
                            }
                        });
                    });
            });
}
async function getReviews(originalurl, urlToAnalyze) {
    // Get reviews of the comment
    let finalOutPut = {};
    finalOutPut["digest"] = originalurl;
    let index = 0;
    for(let url of urlToAnalyze) {
        let browser = await puppeteer.launch({headless: true});
        let page = await browser.newPage();
        // console.log("Running:", url);
        // await page.goto(url);
        await page.goto(url);
        await page.waitFor(1000);
        // await page.waitForNavigation({ waitUntil: 'networkidle2' });
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);
        // console.log(bodyHTML);
        // let averageReviews = await page.evaluate(() => {
        //     // document.body.innerHTML
        //     let data = [];
        //     let elements = document.getElementById('averageCustomerReviews');
        //     console.log(elements);
        //     // for (let element of elements)
        //     //     data.push(element.textContent);
        //     return elements;
        // });
        // console.log(averageReviews);
        let reviews = await page.$eval("#acrPopover ", result => {return result.title});
        let score = reviews.split(" ")[1];
        if(score > 4 && index < maximumSitesNum)  {
            finalOutPut["url"+index] = url;
            index += 1;}
        await browser.close();
        if (index === maximumSitesNum) break;

    }
    console.log("Analysis Finished");
    return finalOutPut;

    // for(let index=0; index < urlToAnalyze.length; index ++) {
    //     console.log("RUnning: ", urlToAnalyze[index]);
    //     page.goto(urlToAnalyze[index], {
    //         waitUntil: "networkidle2"
    //     });
    //     page.$$eval("#averageCustomerReviews", result=>{console.log(result)})
    //         .catch(e => {console.error(e)})
    // }

    // urlToAnalyze.forEach(item => {
    //     page.goto(item, {
    //         waitUntil: 'networkidle2'
    //     });
    //     page.$$eval("#averageCustomerReviews")
    //         .then(result => {
    //             console.log(result);
    //         })
    // });
}

async function update(urlToFetch) {
    /* 1 */
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const url = new URL(urlToFetch);
    const rootCachePath = `./output/${url.hostname}`;
    const indexPath = rootCachePath + '/index.html';
    await page.goto(urlToFetch, {
        waitUntil: 'networkidle2'
    })
        .then(response => {
            // console.log(urlToFetch, "caching process finished with code", response.status());
            let indexPath = path.resolve(`./output/${url.hostname}/index.html`);
            // Now modify the dependencies in the index HTML
            // console.log(indexPath);
        });
    let href = await page.evaluate(() => {
        let recommendList = document.querySelectorAll("li.a-carousel-card");
        for(let listItem in recommendList) {
            // console.log(listItem)
        }
    });
    // console.log(href);
    // Important tags here!

    // p13n-sc-truncated : Recommendation Name
    // li.a-carousel-card : CM part
    // let HTMLContent = await page.evaluate(() => document.querySelectorAll("li.a-carousel-card"));
    // a.a-link-normal

    let list =await page.$$eval('li.a-carousel-card > div > a.a-link-normal', anchors => { return anchors.map(anchor => anchor.href)});
    // console.log(list);
    setTimeout(async () => {
        await browser.close();
    }, 2000 * 4);
    console.log(list);
    let finalURLs = await getReviews(urlToFetch, list);
    // console.log(finalURLs);
    return new Promise(((resolve, reject) => {
        resolve(finalURLs);
        reject("Error!");
    }))
}
// Test https://www.amazon.co.jp/Z370%E6%90%AD%E8%BC%89-%E3%83%9E%E3%82%B6%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89-LGA1151%E5%AF%BE%E5%BF%9C-Z370-F-GAMING%E3%80%90ATX/dp/B075RHWLF2?pd_rd_wg=9RhEa&pd_rd_r=afa399b4-db01-4d9d-bc71-14e2eb7b4ed4&pd_rd_w=3haAW&ref_=pd_gw_cartx&pf_rd_r=GSM3SR1WPDF0DMHSTYRJ&pf_rd_p=d1951c0b-fec3-5650-8183-55a36759b1b7
// update("https://www.amazon.co.jp/Z370%E6%90%AD%E8%BC%89-%E3%83%9E%E3%82%B6%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89-LGA1151%E5%AF%BE%E5%BF%9C-Z370-F-GAMING%E3%80%90ATX/dp/B075RHWLF2?pd_rd_wg=9RhEa&pd_rd_r=afa399b4-db01-4d9d-bc71-14e2eb7b4ed4&pd_rd_w=3haAW&ref_=pd_gw_cartx&pf_rd_r=GSM3SR1WPDF0DMHSTYRJ&pf_rd_p=d1951c0b-fec3-5650-8183-55a36759b1b7");
async function dummyReply() {

    let dummpyData = {
        "digest": "www.example.com",
        "url0": "www.example0.com",
        "url1": "www.example1.com",
        "url2": "www.example2.com"
    };

    return dummpyData;
}
module.exports = {
    update,
    readDataFromDB,
    dummyReply
};



