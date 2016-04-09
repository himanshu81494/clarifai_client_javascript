/**
 *  Author: himanshu gautam
 *  Credits: original author's code, github.com/cassidoo/clarifai-javascript-starter, is used here
 *  github: himanshu81494
 *  2016 apr 8 11:09
 */
$(document).ready(function () {

$("form").submit(function (event) {
  var imgurl = $("input:first").val();
  var mode = $("#modeselect").val();
  console.log(mode);
  run(imgurl, mode);
})
});

function init() {
  // get client_id and client_secret by registering at clarifai. ITS FREE !! ;)
  // https://developer.clarifai.com/login/
  // https://developer.clarifai.com/signup/
  
  var data = {
    'grant_type': 'client_credentials',
    'client_id': 'CLIENT_ID',// change it with your client_id. eg.: 'dd7d8djnekd'
    'client_secret': 'CLIENT_SECRET',// change it with your client_secret
  };
  if(data.client_id === 'CLIENT_ID' || data.client_secret === 'CLIENT_SECRET' ) {
    $("#warning").html('setup first: <br/> enter your client_id and client_secert in the js file and save it.');
    $("#container").html('');
  }
  return data;
}

function getCredentials(cb) {
  
  var data = init();
  return $.ajax({
    'url': 'https://api.clarifai.com/v1/token',
    'data': data,
    'type': 'POST'
  })
  .then(function(r) {
    localStorage.setItem('accessToken', r.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    cb();
  });
}

function postImage(imgurl, mode) {
  var model='';
  mode = parseInt(mode);
  switch (mode) {
    case 1:
      model = 'general-v1.3';
      break;
    case 2:
      model = 'nsfw-v0.1';
      break;
    case 3:
      model = 'weddings-v1.0';
      break;
    default:
      model = 'general-v1.3';
  }

  var data = {
    'model': model,
    'url': imgurl,
  };
  console.log(data);
  var accessToken = localStorage.getItem('accessToken');

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/tag',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'data': data,
    'type': 'POST'
  }).then (function(r) {
    parseResponse(r);
  });
}

function parseResponse(resp) {
  var tags = [];
  if(resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
    probs = results[0].result.tag.probs;
  }else {
    console.log('Sorry, something is wrong.');
  }

  $('#tags').text(tags.toString().replace(/,/g,', '));
  $('#probs').text(probs.toString().replace(/,/g,', '));
  return tags;
}

function run(imgurl, mode) {
  if(localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
    || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
      postImageNSFW(imgurl, mode);
    });
  }else  {
    postImageNSFW(imgurl, mode);
  }
    
}
function getmyusage() {
  
   var accessToken = localStorage.getItem('accessToken');
   return $.ajax({
     'url': 'https://api.clarifai.com/v1/usage',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    
    'type': 'GET'
  }).then(function(resp){
      var usagestring = [];
      var usagemonthly = [];
      if(resp.status_code === 'OK') {
        console.log(resp);
      var usage = resp.results.user_throttles;
      usagehourly = usage[0].consumed;
      var usagehourlypercentage = usage[0].consumed_percentage;
      usagemonthly = usage[1].consumed;
      var usagemonthlypercentage = usage[1].consumed_percentage;

      }else {
          console.log('Sorry, something is wrong.');
      }
   $('#accesstoken').html(accessToken);

  $('#usagehourly').text("usagehourly: "+usagehourly+"("+usagehourlypercentage+" %)");
  $('#usagemonthly').text("usagemonthly: "+usagemonthly+"("+usagemonthlypercentage+" %)");
  return usagemonthly;
  });
}
