var Promise = require("node-promise").Promise;
var jf = require('jsonfile');
var fs = require('fs');
var dbPath = "./server/DB/";
var regExp = new RegExp("nodes/[0-9]*");


//OnLoad take the last Id and keep
var last_id;
(function() {
    jf.readFile(dbPath + 'relations.json', function(err, obj) {
        var str = regExp.exec(obj.slice(-1).pop().url)[0];
        last_id = str.slice(6, str.length); //geting the last node
    });
})();


//Public Creating a new Node
//First Make a new  New node in a new json file
//Then if file is creted we add it into the Relatios json
function addNode(options) {
    var promise = new Promise();
    var fileName = ++last_id + '.json';
    options.url = 'ggg.vostan.am/nodes/' + last_id,
    fs.exists(fileName, function(exists) {
        if (exists) {
            console.log("Warrning!!! node already exist");
        } else {
            jf.writeFile(dbPath + "Nodes/" + fileName, options, function() {
                addNodeToRelations(options, promise);
            });

        }
    });
    return promise;
}


//Private function
function addNodeToRelations(data, promise) {
    data.date - new Date();
    delete data.data;
    jf.readFile(dbPath + 'relations.json', function(err, obj) {
        if (!err && obj) {
            obj.push(data);
            jf.writeFileSync(dbPath + 'relations.json', obj);
            promise.resolve(last_id);
        } else {
            console.log(err);
            promise.reject()
        }
    });
}

//Find nodes by matched value
function findByName(val) {
    var promise = new Promise();
    var arr = [];
    jf.readFile(dbPath + 'relations.json', function(err, relationList) {
        for (var i in relationList) {
            if (relationList[i].name.indexOf(val) >= 0) {
                arr.push(relationList[i]);
            }
        }
        promise.resolve(arr);
    });
    return promise;
}

module.exports.findByName = findByName;
module.exports.addNode = addNode;