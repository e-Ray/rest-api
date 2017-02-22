var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
var express = require("express");
var app = express();
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
axios.get('https://e-ray-e7f7e.firebaseio.com/erays.json?shallow=true')
      .then((resp) => {
         erays=Object.keys(resp.data);
         
      let result=[];
      let loc=[];
      let tm=null;
    for(i=0; i< erays.length; i++){
        
        result.push(erays[i]);
        ref.child(erays[i]+"/info").once('child_added', (snapshot) => {
            let obj={location: snapshot.val()};
            loc.push(obj);
        });
        }
        //TODO: Find a better solution for this
        tm=setTimeout(() => res.send(combineArrays(result, loc)), 500);

      })
      .catch(err => {
        console.log(err);
      });
  }

);

app.listen(3000);
 
