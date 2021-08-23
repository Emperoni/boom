exports = async function(scriptName){
  //const Base64 = require("js-base64");
  const ec2 = context.services.get('connectAws').ec2("eu-central-1");
  const collection = context.services.get("mongodb-atlas").db("boom").collection("scripts");
  return collection.findOne({"name": scriptName})
  /*
  Script names are: 
  1. OM Instance
  2. MDB RS 
  
  */
  .then(result => {
      if(result){
        console.log('inside if result.');
        console.log(result.ami);
        console.log(result.awsZone);
        console.log(result.instanceType);
        console.log('#!/bin/bash \r\n yum update -y');
        console.log(result.securityGroups);
        var instanceId;
        // result.userData is already encoded in Base64. Base64.encode( x ) is no longer necessary.
        //const userData = Base64.encode('#!/bin/bash \r\n yum update -y');
        //const userData = Base64.encode(result.userData);
        const userData = result.userData;
        console.log(userData);
        
        const risultato = ec2.RunInstances({
          "ImageId": result.ami,
          "MaxCount": 1,
          "MinCount": 1,
          "SecurityGroups": result.securityGroups,
          "UserData": userData,
          "KeyName": "dg-oregon",
          "InstanceType": result.instanceType,
          //"TagSpecification": result.tagSpecification,
          "BlockDeviceMappings": result.blockDeviceMappings 
        })
        return risultato;
      } else {
        return 'did not get a result.';
      }
    })
    .catch(err => console.error(`Failed to find document: ${err}`));
    
};

// 'awsRegion': 'us-west-2',
        /*
          'numToLaunch':1,
          'ami':,
          'instanceType': result.instanceType,
          'securityGroups': result.securityGroups
          
          ,
          "User-Data": '#!/bin/bash \r\n yum update -y'
        */
        