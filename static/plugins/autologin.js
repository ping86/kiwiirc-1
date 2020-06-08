kiwi.on('irc.raw.001', function(event) {
       var user = kiwi.state.settings.chatea_options.nick;
       var token = kiwi.state.settings.chatea_options.token;

       if(token) {
           setTimeout(function() {
                kiwi.state.$emit('input.raw', '/msg nick IDENTIFYOAUTH ' + user + ' ' + token);
           }, 1000);
       }
       setTimeout(function() {
           kiwi.state.getActiveNetwork().name = "Lisatdo de Salas";
       }, 1000);
});
