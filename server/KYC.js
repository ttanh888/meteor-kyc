import S3 from 'aws-sdk/clients/s3'

const KYCs = new Mongo.Collection('kycs')
if (Meteor.isServer) {
  S3.config.update({ accessKeyId: Meteor.settings.aws.S3_KYC_BUCKET, secretAccessKey: Meteor.settings.aws.S3_SECRET_KEY })
  S3.config.region = Meteor.settings.aws.S3_REGION
  const promotion_region = Meteor.settings.aws.S3_REGION
  const promotion_bucket = Meteor.settings.aws.S3_KYC_BUCKET
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
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
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
          if (err){
            reject(Meteor.Error('Can not update kyc'))
          } else {
            resolve(res)
          }
        })
      })
    },
    'kyc.uploadFile': function (userId, imageBase64, imageType) {
      if (!userId || !imageBase64 || !imageType) throw new Meteor.Error(403, 'required')
      const filename = userId + '/personal',
            fileType = imageType,
            fileData = imageBase64.replace(/^data:\w+\/\w+;base64,/, ''),
            params = {
              Bucket: promotion_bucket,
              Key: filename,
              ContentType: fileType,
              Body: new Buffer(fileData, 'base64'),
              ACL: 'public-read',
            }
      const s3Path = `https://s3-${promotion_region}.amazonaws.com/${promotion_bucket}/filename`
      return new Promise((resolve, reject) => {
        s3.putObject(params, Meteor.bindEnvironment(function (err, data) {
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
