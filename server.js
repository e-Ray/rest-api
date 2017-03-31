let admin = require("firebase-admin");
let serviceAccount = require("./key.json");
let express = require("express");
let moment = require('moment');
let app = express();

let port=3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://e-ray-e7f7e.firebaseio.com/",
    databaseAuthVariableOverride: {
    uid: "api"
  }
    
});
    //admin.database.enableLogging(true);
    let db=admin.database();
    let ref=db.ref("erays/");



    
function getAllSensors(res, obj, erayid){
     let sensors=["waterlevel", "watertemp", "temp", "rain", "windspeed"];
     let values=[];
     let date=new Date();
     let count=0;
        for(let i=0;i< sensors.length; i++){
            ref.child(erayid + '/' + sensors[i] + '/'+ date.getFullYear() + '_'+ (date.getMonth()+1) + '_'+ (date.getDate()) + '/').limitToLast(20).once('value', (snapshot) => {
               values.push(snapshot.val()); 
               obj[sensors[i]]=snapshot.val();
               if(count==sensors.length-1) res.send(obj);
                count++;
            });
        }
        
}

app.get("/erays/:id/", function(req, res) {
    let date=new Date();
    let sensor=req.query.sensor;
    let fromDate=req.query.from;
    let toDate=req.query.to;
    let last=100;
    let idToken=req.query.auth;
    let uid;
    if(req.query.last != null)last=parseInt(req.query.last);
    
    if(sensor !=null ){
        if(sensor== 'performance'  || sensor=='rpm'){
            if(idToken==null)res.send('permission denied');
        else {
            admin.auth().verifyIdToken(idToken)
                .then(function(decodedToken) {
                uid = decodedToken.uid;
                let ref=db.ref("erays/"+ req.params.id + "/info/owner");
                ref.once('value', (snapshot) => {
                    if(uid != snapshot.val()){
                        res.send('permission denied');
                    }
                    else {
                            getSensorData(req.params.id, sensor, fromDate, toDate, last, res);
                        }
                });
                
            }).catch(function(error) {
                res.send(error);
            });
            
        }
        }
        else
            getSensorData(req.params.id, sensor, fromDate, toDate, last, res);
    }
    
    else {
            let obj={};
            let sensors=["waterlevel", "watertemp", "temp", "rain", "windspeed"];
            getAllSensors(res, obj, req.params.id);
            
          
          
        };
    }
    
);
function getSensorData(erayid, sensor, fromDate, toDate, last, res){
    if(fromDate != null && toDate != null ){
                let start=moment(fromDate, 'YYYY M D');
                let end=moment(toDate, 'YYYY M D');
                let arr=[];
                let m=moment(start);
                let count=m.diff(end,'days');
                for(m=moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')){
                    ref.child(erayid + '/' + sensor + '/'+ m.format('YYYY[_]M[_]D')+ '/').once('value', (snapshot) => {
                        arr.push(snapshot.val());
                        if(count==0)res.send(arr);
                        count++;
                        });
                };
            
            }
            else{
                let m=moment(new Date());
                    ref.child(erayid + '/' + sensor + '/'+ m.format('YYYY[_]M[_]D')+ '/').limitToLast(last).on('value', (snapshot) => {
                        res.send(snapshot.val());
                    });
                
            }
}
function getOwner(erayid, res, idToken){
    admin.auth().verifyIdToken(idToken)
                .then(function(decodedToken) {
                uid = decodedToken.uid;
                let ref=db.ref("erays/"+ erayid + "/info/owner");
                ref.once('value', (snapshot) => {
                    if(uid != snapshot.val()) res.send('forbidden');
                         else res.send("!");
                });
    }).catch(function(error) {
    res.send(error);
  });

}
app.get("/erays.json", function(req, res) {
let erays;
let erayref=db.ref("erays/eraylist");
  erayref.once("value", (snapshot) => {
      res.send(snapshot.val());
  });
});
    




app.listen(port);
 
