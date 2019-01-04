import React from 'react'

import Register from './client/components/Register'
import Settings from './client/components/Settings'
import { Alert, AlertContainers } from './client/components/Alert'

import './server/Setting.js'
import './server/KYC.js'

export default class KYC extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      props: this.props,
      config: undefined
    }
  }
  componentWillMount() {
    this._getConfig()
  }
  _getConfig() {
    const _this = this
    Meteor.call('setting.get', function (err, res) {
      if (err) return console.log('Can not get setting data')
      _this.setState({ config: res })
    })
  }
  render() {
    const { props, config } = this.state
    let content = 'Kyc not available or rejected please contact to administrator'
    if (config) {
      if (props.isAdmin) {
        content = <Settings info={config} />
      } else if(Object.keys(config).length) {
        content = <Register currentUser = {props.currentUser} settingInfo={config} />
      }
    }
    return(
      <div>
        <AlertContainers />
        {content}
      </div>
    )
  }
}
