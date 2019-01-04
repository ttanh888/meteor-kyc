import SyncedCron from './SyncedCron'
import {
  KYC_APPROVED_STATUS,
  KYC_DENIED_STATUS,
  KYC_INPROGRESS_STATUS
} from '../common/Constant'


if (Meteor.isServer) {
  SyncedCron.config({
    log: true,
    collectionName: 'kyc_crons'
  });

  SyncedCron.add({
    name: 'KYC Cron',
    schedule: function(parser) {
      return parser.text('every 5 seconds')
      // return parser.text('at 4:15 am')
    },
    job: async function() {
      const listKYCs = await function () {
        return new Promise((resolve, reject) => {
          const query = {}
          query['deletedDate'] = ''
          query['trustDockInfo.result'] = KYC_APPROVED_STATUS
          Meteor.call('kycs.get', query, {}, function (err, res) {
            if (err) return reject(err)
            resolve(res.data)
          })
        })
      }

      const checkRequestToKYC = function (_kycs) {
        return new Promise(async (resolve, reject) => {
          if (!_kycs.length) return reject(console.log('Have not kyc was registered'))
          let statusList = await Promise.all(
            _kycs.map(async kyc => {
              const kycId = kyc.trustDockInfo.id
              const userId = kyc.userInfo.id
              const check = await KYCApi.check(kycId)
              if (check.status === 200) return { status: check.data.result, info: {userId: userId, kycId: kycId}}
            })
          )
          resolve(statusList)
        })
      }

      const checkIsMemberKYC = function (_statusList) {
        if (!_statusList.length) return console.log('status list empty')
        let inProgressList = [],
          approvedList = [],
          deniedList = []
        _statusList.forEach(({ status, info }) => {
          if (status === KYC_INPROGRESS_STATUS) inProgressList.push(info)
          if (status === KYC_APPROVED_STATUS) approvedList.push(info)
          if (status === KYC_DENIED_STATUS) deniedList.push(info)
        })
        updateKYCs(inProgressList, approvedList, deniedList)
        memberKYCStatus(inProgressList, approvedList, deniedList)
      }

      const updateKYCs = function (_inProgress, _approved, _denied) {
        if (_inProgress.length) {
          let kycIds = _inProgress.map(i => i.kycId)
          updateTrustDockKYC(kycIds, KYC_INPROGRESS_STATUS)
        }
        if (_approved.length) {
          let kycIds = _approved.map(i => i.kycId)
          updateTrustDockKYC(kycIds, KYC_APPROVED_STATUS)
        }
        if (_denied.length) {
          let kycIds = _denied.map(i => i.kycId)
          updateTrustDockKYC(kycIds, KYC_DENIED_STATUS)
        }
      }

      const memberKYCStatus = function (_inProgress, _approved, _denied) {
        let status = false,
          userIds = []
        if (_approved.length) {
          status = true
          userIds = _approved.map(i =>  i.userId)
        }
        if (_inProgress.length) {
          userIds = _inProgress.map(i =>  i.userId)
        }
        if (_denied.length) {
          userIds = _denied.map(i => i.userId)
        }
        if (userIds.length) {
          Meteor.call('users.memberKYCStatus', userIds, status, function (err, res) {
            if (err) return console.log('Can not update member status of user')
            console.log(`update kyc is member KYC(${status}) of users: `, res)
          })
        }
      }

      const updateTrustDockKYC = function (_kycIds, _status) {
        const info = { kycIds: _kycIds, status: _status }
        Meteor.call('kycs.update', info, function (err, res) {
          if (err) return console.log('Can not update kyc data of user')
          console.log(`update trust dock info of kyc(${_status}): `, res)
        })
      }

      return listKYCs()
        .then(checkRequestToKYC)
        .then(checkIsMemberKYC)
        .catch(err => {
          console.log('update join kyc status error:', err)
        })
    }
  });

  Meteor.startup(function () {
    SyncedCron.start();
  });
}
