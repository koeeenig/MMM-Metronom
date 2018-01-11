const request = require('request');
const cookieReqestUrl = 'http://www.der-metronom.de/';
const stationRequestUrl = 'https://www.der-metronom.de/livedata/etc?type=stationsauskunft&bhf=';

module.exports = NodeHelper.create({
    
    start: function() {
        console.log(this.name + ' is started!');
        
    },
    fetchStationStatus: function(station) {
        console.log('helper: fetch station ' + station)
        var self = this;

        request(cookieReqestUrl, function (error, response, body) {
            cookies = response.headers['set-cookie'];
            var j = request.jar();

            var url = stationRequestUrl + station;
            console.log('Request: ' + url);
            var options = {
                url: url,
                method: 'GET',
                headers: {
                    'Cookie' : cookies.join(';')
                }
            };
            request(options, function (error, response, body) {
               
                var status =  JSON.parse(body);

                if(!Array.isArray(status.abfahrt)) {
                    status.abfahrt = [status.abfahrt];
                }

                if(status.abfahrt[0] == null) {
                    status.abfahrt = [];
                }

                if(status.name.length == 0) {
                    self.sendSocketNotification('INVALID_STATION',station)
                } else {
                    self.sendSocketNotification('STATION_STATUS',{'station': station, 'status': status });
                }
            });
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'FETCH_STATION') {
            console.log('fetch station notification');
            this.fetchStationStatus(payload);
        }
    }
});