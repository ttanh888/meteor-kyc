import SyncedCron from './cron'

if (Meteor.isServer) {
  SyncedCron.config({
    log: true,
    collectionName: 'kyc_crons'
  });

  SyncedCron.add({
    name: 'KYC cron',
    schedule: (parser) => {
      return parser.text('every 5 seconds')
    },
    job: async () => {
      console.log('Test cron job')
    }
  });

  Meteor.startup(function () {
    SyncedCron.start();
  });
}
