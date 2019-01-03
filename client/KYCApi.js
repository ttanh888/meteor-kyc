import * as axios from 'axios'

Meteor.startup(function() {
  const env = {
    NODE_ENV: 'development'
  }
  process.env = env
})

const KYCApi = {
  API_URL: "https://api.test.trustdock.io/v1",
  PROJECT_TOKEN: "xvF2hz2xwUADkuY9oSN28tbw",
  API_TOKEN: "s4ihKzn4VdjqNcB4xPNdaTjd",

  upload: function (_info) {
    const { images, document } = _info
    if (!images || !document) return Meteor.Error(403, 'Required')
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Project-Key': this.PROJECT_TOKEN,
      }
    }
    const data = {
      "type": document,
      "images": images
    }

    return axios.post(`${this.API_URL}/documents`, data, config)
      .catch(error => {
        return error.response
      })
  },
  'verify': function (_data) {
    if (!_data) return null
    const { token, userInfo } = _data
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_TOKEN}`
      }
    }
    const data = {
      "document": {
        "token": token
      },
      "comparing_data": {
        "fields": ["name", "birth", "gender", "address"],
        "data": userInfo
      }
    }

    return axios.post(`${this.API_URL}/review`, data, config)
      .catch(error => {
        return error.response
      })
  },
  'check': function (_kycId) {
    if (!_kycId) return null
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_TOKEN}`
      }
    }
    return axios.get(`${this.API_URL}/review/${_kycId}`, config)
      .catch(error => {
        return error.response
      })
  }
}
module.exports = KYCApi
