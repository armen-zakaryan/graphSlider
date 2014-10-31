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

app.controller('RootCtrl', ['$scope',
    function($scope) {}
]);

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

app.controller('NodesCtrl', ['$scope', '$http',
    function($scope, $http) {

        $scope.searchValue;
        $scope.$watch('searchValue', function(val) {
            console.log(val);
        });
    }
]);