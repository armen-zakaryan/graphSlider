var app = angular.module('GraphSlider', ['ngRoute']);
// configure routes
app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'app/templates/home.html',
            controller: 'RootCtrl'
        })
        .when('/node', {
            templateUrl: 'app/templates/node.html',
            controller: 'NewNodeCtrl'
        })
        .when('/nodes', {
            templateUrl: 'app/templates/nodes.html',
            controller: 'NodesCtrl'
        })
        .otherwise({
            redirectTo: 'home'
        });;
});

//RootCtrl
app.controller('RootCtrl', ['$scope',
    function($scope) {}
]);

//NewNodeCtrl
app.controller('NewNodeCtrl', ['$scope', '$http',
    function($scope, $http) {
        $scope.name = '';
        $scope.text = '';
        $scope.createNode = function() {
            $http.post('/node', {
                name: $scope.name,
                data: $scope.text
            }).
            success(function() {
                alert("Node successfuly created");
            }).
            error(function() {
                alert("Error");
            });
        }
    }
]);









//NodesCtrl
app.controller('NodesCtrl', ['$scope', 'NodeSvc',
    function($scope, NodeSvc) {
        $scope.searchValue;
        $scope.rootNode;
        $scope.neighbourNodes;
        $scope.links;
        $scope.pointsMap = {};
        $scope.limit = 20;

        function calcCenter(el) {
            var offset = el.offset();
            return {
                x: offset.left + el.width() / 2,
                y: offset.top + el.height() / 2
            }
        }
        $scope.setPoint = function(nodeNumber, offset) {
            $scope.pointsMap[nodeNumber] = calcCenter(offset);
        }

        $scope.draw = function(ctx) {

            console.log('Points ', $scope.pointsMap);
            console.log('Links ', $scope.links);
            $scope.links.forEach(function(element, index, array) {
                var from = $scope.pointsMap[element.nodeID];
                var to = $scope.pointsMap[element.linkedNodeID]
                console.log('drawing ', from, to);
                ctx.beginPath();

                from && ctx.moveTo(+from.x - 20, +from.y - 100);
                to && ctx.lineTo(+to.x - 20, +to.y - 100);

                ctx.lineWidth = 1;
                // color
                ctx.strokeStyle = '#444';
                // draw it
                ctx.stroke();
            });


            /*
            ctx.moveTo(1, 1);
            ctx.lineTo(100, 100);
            ctx.lineWidth = 4;
            // color
            ctx.strokeStyle = '#444';
            // draw it
            ctx.stroke();
*/

        }

        $scope.findSelectedNode = function(node) {
            $scope.searchValue = null;
            NodeSvc.findRootById(node.nodeID).then(function(node) {
                $scope.links = node.data.links;
                //root Node has been separated from it's neighbours
                $scope.rootNode = _.remove(node.data.nodes, function(el) {
                    return el.nodeID == node.data.root;
                });
                $scope.neighbourNodes = node.data.nodes;
            });
        };

        $scope.$watch('searchValue', function(val) {
            if (val) {
                NodeSvc.findNode(val).then(function(res) {
                    $scope.result = res.data;
                }, function() {
                    $scope.result = undefined;
                });
            } else $scope.result = undefined;
        });
    }
]);







//Directives
app.directive('neighbourElement', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.setPoint(attr.id, $(element));
            /*
            $(element).onPositionChanged(function() {
                calcCenter($(element));
            });
            */
        }
    }
});

app.directive('draw', function() {
    return {
        restrict: 'E',

        link: function(scope, element, attr) {

            var ctx = $('<canvas/>', {
                heiGht: window.innerHeight,
                widtH: window.innerWidth,
                class: 'gs-canvas'
            });
            $(element).append(ctx);
            var ctx = element.find('canvas')[0].getContext('2d');

            scope.$on('ngRepeatFinished', function(aa) {
                reset();
                scope.draw(ctx);
            });

            function reset() {
                element[0].width = element[0].width;
            }

            $(window).resize(function() {
                console.log('caled');
                ctx.width = window.innerWidth;
                ctx.height = window.innerHeight;
                //draw();
            });
        }
    }
});

app.directive('onFinishRender', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.on('click', function() {
                console.log("clicked")
            });

            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});







//Services
app.service('NodeSvc', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var _url = 'https://ggg.vostan.net/aua_swe/class/api.php';

    this.findNode = function(val) {
        return $http({
            url: _url + '/nodes?term=' + val,
            method: 'GET'
        });
    };

    this.findRootById = function(nodeId) {
        return $http({
            url: _url + '/map/root/' + nodeId,
            method: 'GET'
        });

    };

});

//Jquery extensions
jQuery.fn.onPositionChanged = function(trigger, millis) {
    if (millis == null) millis = 100;
    var o = $(this[0]); // our jquery object
    if (o.length < 1) return o;

    var lastPos = null;
    var lastOff = null;
    setInterval(function() {
        if (o == null || o.length < 1) return o; // abort if element is non existend eny more
        if (lastPos == null) lastPos = o.position();
        if (lastOff == null) lastOff = o.offset();
        var newPos = o.position();
        var newOff = o.offset();
        if (lastPos.top != newPos.top || lastPos.left != newPos.left) {
            $(this).trigger('onPositionChanged', {
                lastPos: lastPos,
                newPos: newPos
            });
            if (typeof(trigger) == "function") trigger(lastPos, newPos);
            lastPos = o.position();
        }
        if (lastOff.top != newOff.top || lastOff.left != newOff.left) {
            $(this).trigger('onOffsetChanged', {
                lastOff: lastOff,
                newOff: newOff
            });
            if (typeof(trigger) == "function") trigger(lastOff, newOff);
            lastOff = o.offset();
        }
    }, millis);

    return o;
};