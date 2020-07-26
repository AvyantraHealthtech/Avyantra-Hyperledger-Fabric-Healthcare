'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
  

  async Init(stub) {
    console.info('=========== Healthcare Medical chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  /**
   *
   * @param {*} stub
   * @param {*} args
   */

   // This function is used to query any single record by its id.
  async querySingle(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting HASHID eg: HASH01');
    }
    let hashNumber = args[0];
    let hashAsBytes = await stub.getState(hashNumber); 
    if (!hashAsBytes || hashAsBytes.toString().length <= 0) {
      throw new Error(hashNumber + ' does not exist: ');
    }
    console.log(hashAsBytes.toString());
    return hashAsBytes;
  }


 
  //rich query model function 
  
  async richQuery(stub, args, thisClass){
        if (args.length < 2) {
            throw new Error('Incorrect number of arguments. Expecting two arguments');
        }

        let queryValue = args[1]; // query value you are looking for. ex: student name
	      let queryElement = args[0]; // object property where you wanted to search for value. ex: searching for student name in particular branch. here branch is a property of object in which we are looking for particular student name 
        let queryString = {};
        queryString.selector = {};
        queryString.selector[queryElement] = queryValue;
       //queryString.selector[queryElement2] = queryValue2;  (You can add more complex queries like this)
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);
        return queryResults; //shim.success(queryResults);
    }
async getQueryResultForQueryString(stub, queryString, thisClass) {

        console.info('- getQueryResultForQueryString queryString:\n' + queryString)
        let resultsIterator = await stub.getQueryResult(queryString);
        let method = thisClass['getAllResults'];
    
        let results = await method(resultsIterator, false);
    
        return Buffer.from(JSON.stringify(results));
}
	
async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
          let res = await iterator.next();
    
          if (res.value && res.value.value.toString()) {
            let jsonRes = {};
            console.log(res.value.value.toString('utf8'));
    
            if (isHistory && isHistory === true) {
              jsonRes.TxId = res.value.tx_id;
              jsonRes.Timestamp = res.value.timestamp;
              jsonRes.IsDelete = res.value.is_delete.toString();
              try {
                jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
              } catch (err) {
                console.log(err);
                jsonRes.Value = res.value.value.toString('utf8');
              }
            } else {
              jsonRes.Key = res.value.key;
              try {
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
              } catch (err) {
                console.log(err);
                jsonRes.Record = res.value.value.toString('utf8');
              }
            }
            allResults.push(jsonRes);
          }
          if (res.done) {
            console.log('end of data');
            await iterator.close();
            console.info(allResults);
            return allResults;
          }
        }
    }
  
// end of rich query model functions



/**
 *
 * @param {*} stub
 * @param {*} args
 */

// To create a new Patient
async patientRecord(stub, args) {
  console.info('============= START : Create Patient ===========');
  if (args.length != 5) {
    throw new Error('Incorrect number of arguments. Expecting 5');
  }


  var user = {
    docType: 'patient',
    patientName : args[1],
    patientEmail:args[2],
    medicalRecords:[args[3]],
    accessGranted: [args[4]]
  };

  await stub.putState(args[0], Buffer.from(JSON.stringify(user)));
  console.info('============= END : Create Patient ===========');
  
}

// This is used to add medical Record

async medicalRecordAppend(stub, args) {
  console.info('============= START : medicalRecordAppend ===========');
  if (args.length != 2) {
    throw new Error('Incorrect number of arguments. Expecting 2');
  }

  let recordAsBytes = await stub.getState(args[0]);
  let recordData = JSON.parse(recordAsBytes);
  let updatedMedicalRecordId = args[1];
  var medicalRecordArray = []
  medicalRecordArray = recordData.medicalRecords;
  console.log(medicalRecordArray);
  if ((medicalRecordArray.indexOf(updatedMedicalRecordId) > -1)){
    throw new Error('RECORD ID ALREADY PRESENT');
  }
  else {
    medicalRecordArray.push(updatedMedicalRecordId)
  }

  await stub.putState(args[0], Buffer.from(JSON.stringify(recordData)));
  console.info('============= END : update Medical Records Id  ===========');
}



// This is used to grant access

async permissionAppend(stub, args) {
  console.info('============= START : permissionAppend ===========');
  if (args.length != 2) {
    throw new Error('Incorrect number of arguments. Expecting 2');
  }

  let permissionAsBytes = await stub.getState(args[0]);
  let permissionData = JSON.parse(permissionAsBytes);
  let updatedPermissionDoctorId = args[1];
  var permissionArray = []
  permissionArray = permissionData.accessGranted;
  console.log(permissionArray);
  if ((permissionArray.indexOf(updatedPermissionDoctorId) > -1)){
    throw new Error('DOCTOR ID ALREADY PRESENT');
  }
  else {
    permissionArray.push(updatedPermissionDoctorId)
  }

  await stub.putState(args[0], Buffer.from(JSON.stringify(permissionData)));
  console.info('============= END : update Doctor Id  ===========');
}


// If you want to remove permission id of any doctor.
async revokePermission(stub, args) {
  console.info('============= START : revoke Permission ===========');
  if (args.length != 2) {
    throw new Error('Incorrect number of arguments. Expecting 2');
  }

  let permissionAsBytes = await stub.getState(args[0]);
  let permissionData = JSON.parse(permissionAsBytes);
  let revokeDoctorId = args[1];
  var permissionArray = []
  permissionArray = permissionData.accessGranted;
  console.log(permissionArray);
  // incidentArray.push(updatedIncidentID)
  if (-1 != permissionArray.indexOf(revokeDoctorId)){
    permissionArray.splice(permissionArray.indexOf(revokeDoctorId),1);
  }
  else{
    throw new Error('INVALID DOCTOR ID,CHECK BEFORE REMOVING.');
  }

  await stub.putState(args[0], Buffer.from(JSON.stringify(permissionData)));
  console.info('============= END : revokeDoctorId ===========');
}





/**
 *
 * @param {*} stub
 * @param {*} args
 */

// To create a new Doctor
async doctorRecord(stub, args) {
  console.info('============= START : Create Doctor ===========');
  if (args.length != 5) {
    throw new Error('Incorrect number of arguments. Expecting 5');
  }
// var exchangedAmtCopper = parseInt(args[4]);


  var doctor = {
    docType: 'doctor',
    doctorName : args[1],
    doctorEmail:args[2],
    hospitalId:args[3],
    hospitalName:args[4]
  };

  await stub.putState(args[0], Buffer.from(JSON.stringify(doctor)));
  console.info('============= END : Create Patient ===========');
  
}





/**
 *
 * @param {*} stub
 * @param {*} args
 */

// To create a new medical record
async medicalRecord(stub, args) {
  console.info('============= START : Create a medical record ===========');
  if (args.length != 5) {
    throw new Error('Incorrect number of arguments. Expecting 5');
  }
// var exchangedAmtCopper = parseInt(args[4]);


  var report = {
    docType: 'medical Record',
    uploadedBy : args[1],
    DateandTime:args[2],
    medicalRecordData:args[3],
    attachments:args[4]
  };

  await stub.putState(args[0], Buffer.from(JSON.stringify(report)));
  console.info('============= END : Create Patient ===========');
  
}



  // If you want to query all Incidents at once.
  async queryAll(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }
    let startKey = args[0];
    let endKey = args[1];

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    } 
  }



};

shim.start(new Chaincode());
