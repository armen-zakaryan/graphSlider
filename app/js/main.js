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
        $scope.limit = 4;

        $scope.$on('ngRepeatFinished', function(aa) {
            console.log(aa);
        });

        $scope.selectFindResult = function(node) {
            $scope.searchValue = null;
            NodeSvc.findRootById(node.nodeID).then(function(node) {
                //console.log(node.data);
                node.data.nodes.every(function(el) {
                    if (el.nodeID == node.data.root) {
                        $scope.rootNode = el;
                        return false;
                    } else return true;
                });

                console.log(node.data.root);
                console.log($scope.rootNode);

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

//Directives
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

app.directive('elementInsideNgRepeat', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            function calcCenter(el) {

                var offset = el.offset();
                var centerX = offset.left + el.width() / 2;
                var centerY = offset.top + el.height() / 2;
                console.log(centerX, centerY);
            }


            $(element).onPositionChanged(function() {
                calcCenter($(element));
            });

        }
    }
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