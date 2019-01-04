import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { withTracker } from 'meteor/react-meteor-data'

const Notices = new Meteor.Collection(null)
const Errors = new Meteor.Collection(null)

const Alert = {
  throwNotice: function (message) {
    Notices.remove({})
    const notice = Notices.insert({ message: message })
    console.log(notice)
    Meteor.setTimeout(function () {
      Notices.remove(notice)
    }, 4000)
  },
  throwError: function (message) {
    Errors.remove({})
    const error = Errors.insert({ message: message })
    Meteor.setTimeout(function () {
      Errors.remove(error)
    }, 4000)
  }
}

class AlertContainer extends React.Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {

  }
  render() {
    let { notices,  errors } = this.props
    let notice_list = notices.map((notice, i) => {
      return <p key={i} className="alert notice">{notice.message}</p>
    })
    let error_list = errors.map((error, i) => {
      return <p key={i} className="alert error">{error.message}</p>
    })
    return (
      <div className="alert_area">
        {notice_list}
        {error_list}
      </div>
    )
  }
}

const AlertContainers = withTracker(() => {
  return {
    notices: Notices.find().fetch(),
    errors: Errors.find().fetch(),
  }
})(AlertContainer)

module.exports = {
  Alert,
  AlertContainers
}
