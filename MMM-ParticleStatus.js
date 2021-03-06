Module.register("MMM-ParticleStatus",{
	defaults: {
        particleUsername: "me@example.com",
        particlePassword: "super_secret_password",
        events: []
    },
    
    getStyles: function() {
        return [
            "https://use.fontawesome.com/releases/v5.1.0/css/all.css"
        ];
    },
    getScripts: function() {
        return [
            "https://cdn.jsdelivr.net/particle-api-js/5/particle.min.js"
        ];
    },
    state: [],
    blinkState: false,
	getDom: function() {
        var elem = document.createElement("div");
        if(this.state.length != this.config.events.length){
            elem.innerHTML = "Loading..."
            return elem;
        }
        for(var i = 0; i < this.state.length; i++){
            var icon = document.createElement("i");
            icon.classList.add("fas");
            icon.classList.add("fa-" + this.config.events[i].icon);
            if(this.state == "off" || (this.state == "blink" && this.blinkState == false)){
                icon.setAttribute("visibility", "hidden");
            }
        }
		return elem;
    },
    
    start: function() {
        var particle = new Particle();
        var thisModule = this;
        particle.login({username: thisModule.config.particleUsername, password: thisModule.config.particlePassword}).then(
          function(data) {
            var token = data.body.access_token;
            setInterval(function(){
                if(Array.includes("blink")){
                    thisModule.blinkState = !thisModule.blinkState;
                    thisModule.updateDom();
                }
            }, 1000);
            for(var i = 0; i < thisModule.config.events.length; i++){
                var event = thisModule.config.events[i];
                thisModule.state.push("off");
                particle.getEventStream({ deviceId: event.deviceId, auth: token }).then(function(stream) {
                  stream.on(event.name, function(data) {
                    var newState = event.states[data.name];
                    if(newState != undefined || (newState != "off" && newState != "on" && newState != "blink"))
                    thisModule.state[i] = newState;
                    thisModule.updateDom();
                  });
                });
            }
            thisModule.updateDom();
          },
          function (err) {
            Log.log('Could not log in.', err);
          }
        );
          
    }
});
