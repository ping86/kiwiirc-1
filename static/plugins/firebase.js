kiwi.plugin('firebase', function(kiwi) {
    var version = kiwi.state.settings.chatea_options.version || "na";
    firebase.analytics().setUserProperties({chat_version: version});

    var portal = kiwi.state.settings.chatea_options.host || '';
    if(portal == '' || portal == undefined) {
      portal = document.referrer.split("/")[2] || '';
    }
    firebase.analytics().setUserProperties({portal: portal});

    var photo = kiwi.state.settings.chatea_options.photo || '';
    var hasPhoto = "no";
    if(photo != '') {
      hasPhoto = "yes";
    }

    firebase.analytics().setUserProperties({has_photo: hasPhoto});



    kiwi.on('userbox.show', function(event) {
      firebase.analytics().logEvent('show_profile');
    });

    kiwi.on('input.command.msg', function(event) {
        var target = "priv";
        if(event.params) {
          if(event.params.startsWith("#")) {
            target = "chan";
            var channel = event.params.split(" ")[0];
            firebase.analytics().logEvent('message', { type: target, channel: channel});
          } else {
            firebase.analytics().logEvent('message', { type: target});
          }
        }
    });

    kiwi.on('statebrowser.toggle', function(event) {
        firebase.analytics().logEvent('left_menu');
    });


    kiwi.on('buffer.new', function(event) {
        if(event.joined) {
          //is channel
          var channelName = event.name;
          firebase.analytics().logEvent('open_channel', { channel: channelName});
        } else {
          firebase.analytics().logEvent('open_private');
        }
    });

    kiwi.on('irc.raw.900', function(event) {
        firebase.analytics().logEvent('identify');
        firebase.analytics().setUserProperties({registered: "true"});
    });


    kiwi.on('mediaviewer.hide', function(event) {
        firebase.analytics().logEvent('mediaviewer_hide');
    });

    kiwi.on('mediaviewer.show', function(event) {
        firebase.analytics().logEvent('mediaviewer_show');
    });

    kiwi.on('mediaviewer.opened', function(event) {
        firebase.analytics().logEvent('mediaviewer_opened');
    });

    kiwi.on('irc.raw.001', function(event) {
         setTimeout(function() {
              var buffer = kiwi.state.getActiveBuffer();
              if (buffer.isChannel()) {
                var users = Object.keys(buffer.users).length;
                if (users < 10) {
                  firebase.analytics().setUserProperties({channelLength: "very_low"});
                } else if(users < 50) {
                  firebase.analytics().setUserProperties({channelLength: "low"});
                } else if (users < 200) {
                  firebase.analytics().setUserProperties({channelLength: "medium"});
                }  else if (users < 500) {
                  firebase.analytics().setUserProperties({channelLength: "large"});
                } else if (users > 500) {
                  firebase.analytics().setUserProperties({channelLength: "very_large"});
                }

                firebase.analytics().logEvent('last_channel', { channel: buffer.name});
              }
         }, 5000);
    });

    kiwi.on('irc.notice', function(event) {
        if(event.from_server) {
          var token = event.message.split(" ");
          if(token[0] == "VERIFICATION") {
            var uuid = token[1];
            grecaptcha.ready(function() {
              grecaptcha.execute('6Lf58AAVAAAAAIyn7W5RjjAK9qr6t4k8S7U9m9iZ', {action: 'verfication_token'}).then(function(gtoken) {
                  var xmlHttp = new XMLHttpRequest();
                  var uri = kiwi.state.settings.chatea_options.serverEndpoint + ":8443/api/public/verification?token=" + gtoken+'&uuid='+uuid;
                  xmlHttp.open( "GET", uri, false ); // false for synchronous request
                  xmlHttp.send( null );
                  var verificationToken =  JSON.parse(xmlHttp.responseText);

                  kiwi.state.$emit('input.raw', '/VERIFICATION ' +  verificationToken.response);
              });
            });
          }

          if(token[0] == "VERIFICATION_MESS") {
            var uuid = token[1];

          }
        }
    });
});
