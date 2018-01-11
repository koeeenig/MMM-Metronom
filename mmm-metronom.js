



Module.register("mmm-metronom",{
	// Default module config.
	defaults: {
        fetchInterval: 1 * 60 * 1000,
		stations: []
	},

    getHeader: function() {
        return this.data.header + (this.stationStatus ? ' ' + this.stationStatus.name : '');
    },

    stationStatus: null,
    current: -1,
	// Override dom generator.
	getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = 'dimmed light small station';


        if(!this.stationStatus) {
            wrapper.innerHTML = 'Loading...';
        } else {

            if(this.stationStatus.abfahrt.length == 0) {
                wrapper.innerHTML = 'Kein Zugverkehr';
                return wrapper;
            }

            var table = document.createElement("table");
            table.className = 'station small normal';
            wrapper.appendChild(table);

            for(var i = 0;i < this.stationStatus.abfahrt.length; i++) {
                var row = document.createElement("tr");
                var entry = this.stationStatus.abfahrt[i];
                
                var timeWrapper = document.createElement("td");
                timeWrapper.className = 'align-left';
    
                var time = document.createElement('span');
                time.className = 'bright';
                time.innerHTML = entry.zeit + ' Uhr';
    
                var symbolClock = document.createElement("span");
                symbolClock.className = "light fa fa-fw fa-clock-o";
    
                timeWrapper.appendChild(symbolClock);
                timeWrapper.appendChild(time);
                row.appendChild(timeWrapper);
    
                var trainWrapper = document.createElement("td");
                trainWrapper.className = 'align-left';
    
                var train = document.createElement('span');
                train.innerHTML = entry.zug;
                
                var symbolTrain = document.createElement("span");
                symbolTrain.className = "light fa fa-fw fa-train";
                
                trainWrapper.appendChild(symbolTrain);
                trainWrapper.appendChild(train);
                row.appendChild(trainWrapper);
    
                var target = document.createElement("td");
                target.className = 'align-left bright';
                target.innerHTML = entry.ziel;
                row.appendChild(target);
    
                var state = document.createElement("td");
    
                var prognoseClass = 'on-time';
                if(entry.prognosemin > 0) {
                    prognoseClass = 'late';
                } else if(entry.prognosemin < 0) {
                    prognoseClass = 'early';
                }
    
                state.className = 'bright' + ' ' + prognoseClass;
                state.innerHTML = entry.prognosemin + " min";
                row.appendChild(state);
    
                table.appendChild(row);
               
            }
        }

       
		return wrapper;
    },

    getStyles: function() {
        return [
            'metronom.css', 'font-awesome.css'
        ]
    },
    // Define start sequence.
	start: function() {
        var self = this;
        Log.info("Starting module: " + this.name);

        
        if(self.config.stations.length == 0) {
            Log.info('no stations provided');
            return;
        }

        
        // Log.info('fetch station ' + station);

        var station = self.config.stations[0];
        self.fetchStation(station);

        
    },

    fetchStation: function (station) {
        var self = this;
        
        Log.info('send notification: '+ station);
        this.sendSocketNotification('FETCH_STATION',
            station
        );
    },

    socketNotificationReceived: function (notification, payload) {
        var self = this;
        if (notification === 'STATION_STATUS') {
            this.stationStatus = payload.status;
            Log.info(JSON.stringify(this.stationStatus));
            this.updateDom();
            
            setTimeout(function() {

                // find index of previous fetched station in array
                var idx = self.config.stations.findIndex(s => s == payload.station);
                if(idx >=0) {
                    idx++;
                }

                if(idx >= self.config.stations.length) {
                    idx = 0;
                }
                var station = self.config.stations[idx];
                Log.info('Index is: ' + idx);
                self.fetchStation(station);
            },self.config.fetchInterval);

        }
    }
});