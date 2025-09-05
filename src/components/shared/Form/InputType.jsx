import React from 'react'

const InputType = ({labelText,lableForm, inputType, value, onChange, name, readOnly, disabled}) => {
  return (
    <>
        <div className="form-outline mb-4">
{/*email*/} <input 
                type={inputType} 
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                disabled={disabled}
                className="form-control form-control-lg" />
            <label className="form-label" htmlFor={lableForm}>{labelText}</label>
        </div>
    </>
  )
}

export default InputType