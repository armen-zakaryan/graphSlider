var Promise = require("node-promise").Promise;
var jf = require('jsonfile');
var dbPath = "./server/DB/";

//OnLoad take the last Id and keep
var last_id;
(function() {
    jf.readFile(dbPath + 'relations.json', function(err, obj) {
        last_id = obj.slice(-1).pop().id; //geting the last node
    });
})();


//Public Creating a new Node
function addNode(options) {
    var promise = new Promise();
    jf.readFile(dbPath + 'relations.json', function(err, obj) {
        if (!err && obj) {
            obj.push(makeNewObject(options));
            jf.writeFileSync(dbPath + 'relations.json', obj);
            promise.resolve("done");
        } else {
            console.log(err);
            promise.reject()
        }
    });
    return promise;
}

//Private function
function makeNewObject(data) {
    return {
        id: ++last_id,
        name: data.name,
        url: data.url,
        tags: data.tags || []
    }
}



module.exports.addNode = addNode;