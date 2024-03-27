const express = require("express")
const robots = require('express-robots-txt');
const puppeteer = require("puppeteer");
const useragent = require('express-useragent');
const targetHost = "https://blog.nano71.com"
const app = express()
const port = 9001

let browserWSEndpoint
let browser
let timer

app.use(robots([
    {
        UserAgent: "*",
        Disallow: ["/*.css$", "/*.js$", "/*.gif$"],
        Sitemap: []
    }
]));
app.use(useragent.express())

app.get('*', async (req, res) => {
    const userAgent = req.useragent;
    if (!req.url.includes(".")) {
        res.contentType("text/html")
        res.send(await fetchHTML(req.url, userAgent.source));
        closeBrowser()
    } else {
        console.log("skip", req.url)
        res.status(400).send("Bad Request")
    }
});

// 启动 Express应用程序, 监听指定的端口号
app.listen(port, undefined, () => {
    console.log("\n");
    console.log("----------------------START----------------------\n");
    console.log(`Service listening on port ${port}`)
})

/**
 * 获取网页内容
 * @param {string} url
 * @param {string} ua
 * @return Promise<string>
 */
async function fetchHTML(url, ua) {
    if (browserWSEndpoint) {
        browser = await puppeteer.connect({
            browserWSEndpoint
        })
    } else {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        browserWSEndpoint = browser.wsEndpoint()
    }
    console.log("fetchHTML:", url);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    // await page.setUserAgent(ua)
    page.setDefaultTimeout(60000)
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (path.includes(".") && !path.endsWith(".js")) {
            // 中止请求
            request.abort();
        } else {
            // 继续请求
            request.continue();
        }
    });
    console.log(1);
    await page.goto(targetHost + url, {
        waitUntil: 'networkidle0'
    });
    console.log(2);
    let html = await page.content();
    await page.close()
    console.log("end");
    return html
}

function closeBrowser() {
    clearTimeout(timer)
    timer = setTimeout(async () => {
        if ((await browser.pages()).length === 1) {
            browserWSEndpoint = undefined
            await browser.close();
        }
    }, 5000)
}
