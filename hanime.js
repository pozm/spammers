const fetch = require("node-fetch")

const cluster = require("cluster")

function rand (max,min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandName () {
    return new Array(14).fill().map(v=> String.fromCharCode(rand(122,97)) ).join('')
}


function gen(pw,email) {
    return fetch("https://members.hanime.tv/rapi/v7/users", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-GB,en;q=0.5",
            "Content-Type": "application/json;charset=utf-8",
            "X-Signature-Version": "web2",
            "X-Signature": getRandName(),
            "X-Time": "1609974973",
            "X-Token": "null",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "body": `{\"username\":\"${getRandName()}\",\"email\":\"${email}\",\"password\":\"${pw}\",\"screen_width\":${rand(3000,100)},\"screen_height\":${rand(3000,100)}}`,
        "method": "POST",
        "mode": "cors"
    })
}


if (cluster.isWorker) {

    process.on("message",msg=>{
        switch (msg) {
            case "work":
		let pw = getRandName()
		let em = `${getRandName()}@gmail.com`
                gen(pw,em).then(resp=>resp.json().then(jsn=>process.send?.( jsn?.user?.id ? `new account ? ${jsn?.user?.id} - ${jsn?.user?.name} @ ${em} | ${pw}` : JSON.stringify(jsn))))
        }
    })


} else {
    gen().then(res=>res.json().then(console.log))
}