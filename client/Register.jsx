import React from 'react'
import { Meteor } from 'meteor/meteor'
import { KYC_PERSONAL_DOCUMENT_TYPE } from './constant'

export default class JoiningKYCRegister extends React.Component {
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
  handleSubmit() {
    console.log('handleSubmit')
  }
  handleChange() {
    console.log('handleChange')
  }
  handleImageChange() {
      console.log('handleImageChange')
  }
  render() {
    const { data, documentSelected, buttonDisable } = this.state
    const documentTypes = KYC_PERSONAL_DOCUMENT_TYPE.map((item, index) => {
      return !documentSelected.includes(item.value)
        && <option value={item.value} key={'document' + index} defaultValue={item.value === data.document}>{item.name}</option>
    })
    return (
      <div>
        <h1>Register Joining KYC</h1>
        <div>
          <form action="javascript:void(0)" onSubmit={this.handleSubmit}>
            <div className="form_table">
              <dl>
                <dt>Image</dt>
                <dd>
                  <input type="file" name="image" onChange={this.handleImageChange} multiple/>
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
      </div>
    )
  }
}
