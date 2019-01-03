import React from 'react'
import { Meteor } from 'meteor/meteor'
import {
  KYC_PERSONAL_DOCUMENT_TYPE,
  KYC_ERROR_CODE
} from './Constant'

import KYCApi from './KYCApi.js'
import { Alert } from './Alert'
import '../server/KYC.js'

export default class KYCRegist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      props: this.props,
      data: {
        document: null,
        userData: null,
        images: []
      },
      kyc: undefined,
      listKYC: [],
      imageS3Paths: [],
      documentSelected: [],
      buttonDisable: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleImageChange = this.handleImageChange.bind(this)
  }
  componentWillMount() {
    this._getKYCs()
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      props: nextProps
    })
  }
  async handleSubmit() {
    await this._disableSubmitButton()
    const submit = await this._submitToKYC()
    if (!submit) return console.log('Can not submit to KYC')
    await this._uploadImages()
    let { data, imageS3Paths, documentSelected } = this.state
    const { currentUser } = this.state.props
    const kycData = {
      images: imageS3Paths,
      document: data.document,
      trustDockInfo: submit,
      userInfo: {
        id: currentUser._id,
        data: data.userData
      }
    }
    const kyc = await this._insertKyc(kycData)
    if (kyc){
      documentSelected.push(data.document)
      data = this._resetData()
      this.setState({ kyc, data, documentSelected })
      this._disableSubmitButton()
      console.log(`Request join KYC successful`)
    }
  }
  handleChange({ target }) {
    let { data, buttonDisable } = this.state
    data.document = target.value
    buttonDisable = false
    this.setState({ data, buttonDisable })
  }
  async handleImageChange({ target }) {
    const files = target.files,
      _this = this
    let images = []
    if (files.length) {
      let { data, buttonDisable } = this.state
      for (let i = 0; i < files.length; i++) {
        images.push(files[i])
      }
      const imageData = await Promise.all(images.map( async img => {
        return await _this._setImageData(img)
      }))
      data.images = imageData
      buttonDisable = false
      _this.setState({ data, buttonDisable })
    }
  }
  _insertKyc(_info) {
    return new Promise((resolve, reject) => {
      Meteor.call('kyc.insert', _info, function (err, res) {
        if (err) return reject(console.log('Can not insert KYC'))
        resolve (res)
      })
    })
  }
  async _uploadImages() {
    const { images } = this.state.data,
      _this = this
    let imageS3Paths = await Promise.all(images.map( async image => {
      return await _this._uploadFile(image.base64, image.type)
    }))
    this.setState({ imageS3Paths })
  }
  async _submitToKYC() {
    try {
      if (this._validation())
        return this._uploadToKyc()
          .then(this._verifyRequest)
          .then(this._statusCheckJoinKYC)
    } catch (e) {
      this._disableSubmitButton()
      console.log('Request error')
    }
  }
  _validation() {
    const { images, document } = this.state.data
    if (!images || !images.length) return console.log('You must select image')
    if (!document) return console.log('You must select a document type')
    return true
  }
  _uploadToKyc() {
    const { data } = this.state,
      _this = this
    const { images, document } = data
    if (!images || !document) return console.log('Please select image and document type')
    let imgBase64Arr = images.map(v => {
      return v.base64.replace(/^data:\w+\/\w+;base64,/, '')
    })
    return new Promise(async (resolve, reject) => {
      const upload = await KYCApi.upload({ images: imgBase64Arr, document: document})
      if (upload && upload.status === 200) {
        const token = upload.data.token,
              verifyParam = { _this, token}
        resolve(verifyParam)
      } else {
        reject(console.log(KYC_ERROR_CODE[upload.data.errors[0]['code']]))
      }
    })
  }
  _verifyRequest({ _this,token }) {
    const { props, data } = _this.state,
      { currentUser } = props
    let userBirth = ''
    if (currentUser.profile.birthYear) userBirth = `${currentUser.profile.birthYear}`
    if (currentUser.profile.birthDay) userBirth = `${userBirth}-${("0" + currentUser.profile.birthDay).slice(-2)}`
    if (currentUser.profile.birthMonth) userBirth = `${userBirth}-${("0" + currentUser.profile.birthMonth).slice(-2)}`
    let userAddress = ''
    if (currentUser.profile.addressNumber) userAddress = `${userAddress} ${currentUser.profile.addressNumber}`
    if (currentUser.profile.addressPrefecture) userAddress = `${userAddress} ${currentUser.profile.addressPrefecture}`
    if (currentUser.profile.addressText) userAddress = `${userAddress} ${currentUser.profile.addressText}`
    const info = {
      token: token,
      userInfo: {
        "name": currentUser.profile.name || '',
        "birth": userBirth,
        "gender": currentUser.profile.gender || '',
        "address": userAddress.trim()
      }
    }
    return new Promise(async (resolve, reject) => {
      const verify = await KYCApi.verify(info)
      if (verify.status === 202) {
        data.userData = info.userInfo
        _this.setState({ data })
        resolve(verify.data.id, info.userInfo)
      } else {
        reject(console.log(`Can not verify request, KYC require name, birth, gender and address.
                                Please check and update your profile`))
      }
    })
  }
  _statusCheckJoinKYC(_kycId) {
    return new Promise(async (resolve, reject) => {
      const check = await KYCApi.check(_kycId)
      if (check.status === 200) {
        resolve( check.data)
      } else {
        reject('status join KYC undefined')
      }
    })
  }
  _uploadFile(_imageBase64, _fileType) {
    const { currentUser } = this.state.props
    return new Promise((resolve, reject) => {
      // Meteor.call('kyc.uploadFile', currentUser._id,  _imageBase64, _fileType, function (err, res) {
      //   if (err) return reject(console.log('Can not upload image'))
      //   resolve(res)
      // })
      resolve('https://s3image.com/FQIpPNn4.jpeg')
    })
  }
  _disableSubmitButton() {
    const { buttonDisable } = this.state
    this.setState({ buttonDisable : !buttonDisable })
  }
  _resetData() {
    return {
      images: [],
      document: '',
      userData: ''
    }
  }
  _setImageData(_img) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.readAsDataURL(_img)
      reader.onload = () => {
        resolve({ base64: reader.result, type: _img.type })
      }
    })
  }
  _getKYCs() {
    const { currentUser } = this.state.props,
      _this = this
    const query = {}
    query['deletedDate'] = ''
    query['userInfo.id'] = currentUser._id
    Meteor.call('kycs.get', query, {}, function (err, res) {
      if (err) return console.log('Can not get KYCs')
      if (res.count > 0) {
        let documentSelected = res.data.map(item => {
          return item.document
        })
        _this.setState({
          listKYC: res,
          documentSelected: documentSelected
        })
      }
    })
  }
  render() {
    const { data, listKYC, documentSelected, buttonDisable } = this.state
    const documentTypes = KYC_PERSONAL_DOCUMENT_TYPE.map((item, index) => {
      return !documentSelected.includes(item.value)
        && <option value={item.value} key={'document' + index} defaultValue={item.value === data.document}>{item.name}</option>
    })
    let listImages = []
    if (data.images.length) {
      listImages = data.images.map((v, i) => {
        return <img key={'img' + i} src={v.base64} />
      })
    }
    let content = undefined
    if (listKYC.count === undefined || listKYC.count < KYC_PERSONAL_DOCUMENT_TYPE.length) {
      content = <div>
        <form action="javascript:void(0)" onSubmit={this.handleSubmit}>
          <div className="form_table">
            <dl>
              <dt>Image</dt>
              <dd>
                <input type="file" name="image" onChange={this.handleImageChange} multiple/>
                {listImages.length > 0 && <p className="image_box">{listImages}</p>}
              </dd>
            </dl>
            <dl>
              <dt>Document type</dt>
              <dd>
                <select name="documentType" onChange={this.handleChange}>
                  <option value="">------------------</option>
                  { documentTypes }
                </select>
              </dd>
            </dl>
          </div>
          <div className="btn_area submit">
            <button type="submit" className={buttonDisable ? 'btn btn-disabled' : 'btn'} disabled={buttonDisable}>振込み申請する</button>
          </div>
        </form>
      </div>
    } else {
      content = <h5>You register all KYC service</h5>
    }
    return(
      <div className="kyc_regist">
        {/*<div className="alert_area">*/}
          {/*<p className="alert notice">Test</p>*/}
        {/*</div>*/}
        { Alert.throwNotice('test')}
        { content }
      </div>
    )
  }
}
