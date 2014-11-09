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
        $scope.$watch('searchValue', function(val) {
            if (val) {
                NodeSvc.findNode(val)
                    .then(function(res) {
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
    this.findNode = function(val) {
        return $http({
            url: '/nodes',
            method: 'GET',
            params: {
                value: val
            }
        });
    }
});