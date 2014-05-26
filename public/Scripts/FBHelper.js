
var FBHelper = function () {
    //this.facebookReady = null;
    window.fbAsyncInit = this.initFacebook;   
	 this.urlroot = '..';  
};

FBHelper.prototype = {


    initFacebook: function () {

       
	   
        FB.init({ appId: 205401136237103, status: true, cookie: true, xfbml: true, channelUrl: this.urlroot + '/HtmlPages/channel.html' });

         
        FB.getLoginStatus(function (response) {

 
            if (response.status == 'connected') {
                // showError('connected');
                //window.getLoggedInUserName();
                 
                var params = {};
                params[0] = 'hello';
              
			    var fbHelper = new FBHelper();
			  
                fbHelper.twaGetJSON("/TestLogin", params, function (data) {
                    $('#usr_nam').html(data);
                });
           
                if (window.facebookReady != null) {                    
                    window.facebookReady.apply();
                }
            }
            else {             
                window.facebookReady.apply();
            }
            

        }, true);

    },

    generateHeader: function (selectorid, readyfunction) {
     
        
        // this.facebookReady = readyfunction;

        var headersection = '';
		
        headersection += '<div id="usrinfo" class = "mtrusr">';
        headersection += '<div id="fb-root">';
        headersection += '<fb:login-button autologoutlink="true" perms="email,user_birthday,status_update"></fb:login-button>';
        headersection += '</div>';

        headersection += '<div id = "usr_nam"></div>';
 
 
 
        $(selectorid).html(headersection);

        this.connectfacebook(function () {
            console.log('facebook loaded');
        });

        readyfunction.call();
 
    },

    connectfacebook: function (readyfunction) {

        if (this.urlroot == '..') {
            Window.prototype.facebookReady = readyfunction;

            (function () {
                var e = document.createElement('script');
                e.src = 'http://connect.facebook.net/en_US/all.js';
                e.async = true;
                document.getElementById('fb-root').appendChild(e);
            } ());
        }
        else {
            readyfunction.call();

        }
    },
 
    getHost: function () {
        
        if (window.location.hostname.indexOf("c9.io") >= 0)
        {
            return 'https://c9.io/gnthackray1978/jsquestionnaire/workspace';
        }
        else
        {
            if (window.location.hostname.indexOf("local") == -1)
                return 'http://www.gnthackray.net';
            else
                return 'http://local.gnthackray.net:8080';
        }
            
    },

    // gets json set
    twaGetJSON: function (url, paramsArg, methodArg, fbArg) {
        var aburl = this.getHost() + url;
        $.ajaxSetup({ cache: false });

        $.ajax({
            url: aburl,
            dataType: "json",
            data: paramsArg,
            success: methodArg
			//,
            //beforeSend: $.proxy(this.addFBToHeader(), this)
        });
    },

    
    twaPostJSON: function (postParams) {

        //        var postParams = { url: '',
        //            data: data.Batch,
        //            idparam: data.BatchLength,
        //            refreshmethod: data.Total,
        //            refreshArgs: this.getLink,
        //            Context: this
        //        };

        var localurl = this.getHost() + postParams.url;

        var stringy = JSON.stringify(postParams.data);

        var that = this;

        var successFunc = function (message) {
            // was there a error
            var error = that.getValueFromKey(message, 'Error');

            if (error != '' && error != null) {
                //yes
                that.showError(error);
            }
            else {
                //everything was fine - supposedly.
                if (postParams.idparam != undefined) {
                    var result = that.getValueFromKey(message, 'Id'); // make this Id value less arbitary
                    var qutils = new QryStrUtils();
                    qutils.updateQryPar(postParams.idparam, result);
                }
                if (postParams.refreshmethod != undefined) {

                    if (postParams.refreshArgs != undefined) {
                        if (postParams.refreshArgs.data != undefined)
                            postParams.refreshArgs.data = message;
                    }

                    postParams.refreshmethod.call(postParams.Context, postParams.refreshArgs);
                }
            }
        };

        $.ajax({
            cache: false,
            type: "POST",
            async: false,
            url: localurl,
            data: stringy,
            contentType: "application/json",
            dataType: "json",
          //  beforeSend: $.proxy(this.addFBToHeader(), this),
            success: successFunc
        });

    },

    getValueFromKey: function (qry, name) {
        var match = RegExp(name + '=([^&]*)')
                    .exec(qry);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    },

    showError: function (error) {
       console.log(error);
    },

    //beforeSend: function (xhr) { passToProxy(xhr, url); }
    // sets facebook token to request header
    addFBToHeader: function () {
        return function (xhr) {
            var access_token = '';
            if (this.localfb != null) {
                if (this.localfb.getAuthResponse() != null)
                    access_token = this.localfb.getAuthResponse()['accessToken'];
            }
            xhr.setRequestHeader('fb', access_token);
        }
    }

}
