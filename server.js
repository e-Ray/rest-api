var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
var express = require("express");
var app = express();
var request = require('request');
var axios = require('axios')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://e-ray-e7f7e.firebaseio.com/"
});
    //admin.database.enableLogging(true);
    var db=admin.database();
    var ref=db.ref("erays/");



app.get("/erays", function(req, response) {
    let sensor=req.query.sensor;
    let erayid=req.query.id;
    let date=new Date();
     ref.child(erayid + '/' + sensor + '/'+ date.getFullYear() + '_'+ (date.getMonth()+1) + '_'+ (date.getDate()-1) + '/').limitToLast(100).once('value', (snapshot) => {
         str = JSON.stringify(snapshot.val(), null, 4); 
         console.log(str);
         response.send(snapshot.val());
    });
    
});

function combineArrays(erays, locations){
    
     let obj={};
    erays.forEach(function(value,index){
        obj[value]=locations[index];
    });
    console.log(obj);
    return obj;
    
}

app.get("/erays.json", function(req, res) {
let erays;
request('https://e-ray-e7f7e.firebaseio.com/erays.json?shallow=true', function (error, response, body) {
  if (!error && response.statusCode == 200) {
      erays=response.body;
      let result=[];
      let loc=[];
      let splitArray=erays.split("\"");
      let tm=null;
    for(i=1; i< splitArray.length; i=i+2){
        
        result.push(splitArray[i]);
        ref.child(splitArray[i]+"/info").once('child_added', (snapshot) => {
            loc.push(snapshot.val());
        });
        }
    tm=setTimeout(() => res.send(combineArrays(result, loc)), 500);

  }
  else {
    console.log("Error "+response.statusCode);
  }
});

});

app.listen(3000);
 
