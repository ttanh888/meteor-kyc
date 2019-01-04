Meteor.startup(function() {
  const KYCSettings = new Mongo.Collection('kyc_settings')
  if (Meteor.isServer) {
    Meteor.methods({
      'setting.create': function (_info) {
        const { apiURL, projectToken, apiToken } = _info
        if (!apiURL || !projectToken || !apiToken ) throw new Meteor.Error(403, 'required')
        KYCSettings.remove({})
        _info.createdDate = new Date().getTime()

        return new Promise((resolve, reject) => {
          KYCSettings.insert(_info, function (err, res) {
            if (err) return reject(err)
            resolve(res)
          })
        })
      },
      'setting.get': function () {
        return KYCSettings.findOne({}) || {}
      }
    })
  }
})
