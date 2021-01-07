const cluster = require("cluster")
const cpus = require("os").cpus()
const fs = require("fs")

let count = 0

let f = process.argv[2]

if (!fs.existsSync(f)) {
    console.log("Unable to find what file you want to run on (drag and drop file after master.js in cmd)")
    process.exit()
}



if (cluster.isMaster) {
    cluster.setupMaster({
        silent:true,
        exec:f,
        args:['--use', 'http']
    })

    cluster.on("online", (worker) => {

        console.log(`worker : ${worker.id} is now online -> ${worker.process.pid}`)

        worker.send("work")

        worker.on("message",(msg) => {
            console.log(`got new message from worker ${worker.id} : ${msg} # ${++count}`)
            worker.send("work")
        })

        worker.on("exit",(ec,msg) => {
            console.log(`worker : ${worker.id} has killed it's self -> ${ec } - ${msg} !! replacing with new worker!`)
            cluster.fork()
        })

    })



    for (let b in cpus) { // honestly no point in changing, performance will be shit
        cluster.fork();
    }

}