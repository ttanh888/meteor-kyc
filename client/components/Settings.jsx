import React from 'react'
import { Alert } from '../components/Alert'

export default class Settings extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      props: this.props,
      data: {
        apiURL: '',
        projectToken: '',
        apiToken: ''
      }
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  componentWillMount() {
    this._setData()
  }
  handleChange({ target }) {
    let { data } = this.state
    switch (target.name) {
      case 'apiURL':
        data.apiURL = target.value
        break
      case 'projectToken':
        data.projectToken = target.value
        break
      case 'apiToken':
        data.apiToken = target.value
        break
      case 's3AccessKey':
        data.s3AccessKey = target.value
        break
      case 's3SecretKey':
        data.s3SecretKey = target.value
        break
      case 's3Region':
        data.s3Region = target.value
        break
      case 's3Bucket':
        data.s3Bucket = target.value
        break
    }

    this.setState({ data })
  }
  handleSubmit() {
    const { data } = this.state
    Meteor.call('setting.create', data, function (err, res) {
      if (err) return Alert.throwError('Can not setting')
      Alert.throwNotice('Setting successful')
    })
  }
  _setData() {
    const { props, data } = this.state
    const { apiURL, projectToken, apiToken, s3AccessKey, s3SecretKey, s3Region, s3Bucket} = props.info
    data.apiURL = apiURL
    data.projectToken = projectToken
    data.apiToken = apiToken
    data.s3AccessKey = s3AccessKey
    data.s3SecretKey = s3SecretKey
    data.s3Region = s3Region
    data.s3Bucket = s3Bucket

    this.setState({ data })
  }
  render() {
    const { data } = this.state
    return(
      <div>
        <form action="javascript:void(0)" onSubmit={this.handleSubmit}>
          <div className="form_table">
            <p className="page_ttl">KYC Setting</p>
            <dl>
              <dt>API URL</dt>
              <dd><input onChange={this.handleChange} name="apiURL" type="text" value={data.apiURL || ''}/></dd>
            </dl>
            <dl>
              <dt>PROJECT TOKEN</dt>
              <dd><input onChange={this.handleChange} name="projectToken" type="text" value={data.projectToken || ''}/></dd>
            </dl>
            <dl>
              <dt>API TOKEN</dt>
              <dd><input onChange={this.handleChange} name="apiToken" type="text" value={data.apiToken || ''}/></dd>
            </dl>
          </div>
          <p className="page_ttl">S3 Setting</p>
          <div className="form_table">
            <dl>
              <dt>S3 Access Key</dt>
              <dd><input onChange={this.handleChange} name="s3AccessKey" type="text" value={data.s3AccessKey || ''}/></dd>
            </dl>
            <dl>
              <dt>S3 Secret key</dt>
              <dd><input onChange={this.handleChange} name="s3SecretKey" type="text" value={data.s3SecretKey || ''}/></dd>
            </dl>
            <dl>
              <dt>S3 Region</dt>
              <dd><input onChange={this.handleChange} name="s3Region" type="text" value={data.s3Region || ''}/></dd>
            </dl>
            <dl>
              <dt>S3 Bucket</dt>
              <dd><input onChange={this.handleChange} name="s3Bucket" type="text" value={data.s3Bucket || ''}/></dd>
            </dl>
          </div>
          <div className="btn_area submit">
            <button type="submit" className="btn" >振込み申請する</button>
          </div>
        </form>
      </div>
    )
  }
}
