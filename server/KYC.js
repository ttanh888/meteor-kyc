const AWS = require('aws-sdk')

Meteor.startup(function() {
  const KYCs = new Mongo.Collection('kycs')
  if (Meteor.isServer) {
    const S3 = new AWS.S3()
    Meteor.methods({
      'kyc.insert': function (_info) {
        const { images, document, trustDockInfo, userInfo } = _info
        if (!images || !document || !trustDockInfo || !userInfo) throw new Meteor.Error(403, 'required')
        const now = new Date().getTime()
        _info.createdDate = now
        _info.updatedDate = now
        _info.deletedDate = ''
        return new Promise((resolve, reject) => {
          KYCs.insert(_info, function (err, res) {
            if (err) return reject(err)
            resolve(res)
          })
        })
      },
      'kycs.get': function (_searchParams = {}, _pageParams = {}) {
        const cursor = KYCs.find(_searchParams, _pageParams)
        const data = cursor.fetch()
        const count = cursor.count(false)

        return {
          data,
          count
        }
      },
      'kycs.update': function (_info) {
        const { kycIds, status } = _info
        if (!kycIds || !status) throw new Meteor.Error(403, 'required')
        const param = {},
          query = {}
        const now = new Date().getTime()
        query['trustDockInfo.id'] = { $in: kycIds }
        param['trustDockInfo.result'] = status.trim()
        if (status === 'denied'){
          param['deletedDate'] = now
        } else {
          param['updatedDate'] = now
        }
        return new Promise((resolve, reject) => {
          KYCs.update(query, { $set: param }, { multi: true }, function (err, res) {
            if (err) return reject(Meteor.Error('Can not update kyc'))
            resolve(res)
          })
        })
      },
      'kyc.uploadFile': function (userId, imageBase64, imageType, S3Info) {
        if (!userId || !imageBase64 || !imageType || !S3Info) throw new Meteor.Error(403, 'required')
        console.log(S3Info)
        S3.config.update({ accessKeyId: S3Info.s3Bucket, secretAccessKey: S3Info.s3SecretKey })
        S3.config.region = S3Info.s3Region

        const filename = userId + '/personal',
          fileType = imageType,
          fileData = imageBase64.replace(/^data:\w+\/\w+;base64,/, ''),
          params = {
            Bucket: S3Info.s3Bucket,
            Key: filename,
            ContentType: fileType,
            Body: new Buffer(fileData, 'base64'),
            ACL: 'public-read',
          }
        const s3Path = `https://s3-${S3Info.s3Region}.amazonaws.com/${S3Info.s3Bucket}/filename`
        return new Promise((resolve, reject) => {
          S3.putObject(params, Meteor.bindEnvironment(function (err, data) {
            if (err) {
              console.log("Err: upload failed :" + err)
              reject(err)
            } else {
              console.log("Success: upload image successful")
              resolve(s3Path)
            }
          }))
        })
      }
    })
  }
})
