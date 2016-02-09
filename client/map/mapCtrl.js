angular.module('spotz.map', ['MapServices'])

.controller('mapCtrl', ['$scope', '$cookies', 'MapFactory', 'LoginFactory', function ($scope, $cookies, MapFactory, LoginFactory) {
  $scope.checkCredentials = function () {
    var token = $cookies.get('credentials');
    if (token.length) {
      LoginFactory.verifyToken(token).then(function (response) {
        if (!response.data.success) {
          $state.go('login');
        }
      });
    }
  };

  $scope.checkCredentials();

  MapFactory.init(function (map) {
    var center = map.getCenter();

    //Verifying token
    var token = $cookies.get('credentials');

    MapFactory.loadColors(function () {
      MapFactory.fetchParkingZones([center.lng(), center.lat(), token]);
    });

    map.data.setStyle(function (feature) {
      console.log('setting style');

      if (!feature.getProperty('color')) {
        console.log('no color');
        return;
      }

      return ({
         strokeColor: 'rgb(' + feature.getProperty('color') + ')',    // color will be given as '255, 123, 7'
         fillColor:'rgba(' + feature.getProperty('color')  + ', 0.7)',
         strokeWeight: 1,
       });
    });

    map.data.addListener('click', function (event) {
      console.log('sending off rule', event.feature.getProperty('id').toString(), $scope.rule);

      MapFactory.sendRule(event.feature.getProperty('id').toString(), { token: token, rule: $scope.rule })
      .then(function () {
        event.feature.setProperty('color', $scope.rule.color);
      });
    });
  });

},
]);
