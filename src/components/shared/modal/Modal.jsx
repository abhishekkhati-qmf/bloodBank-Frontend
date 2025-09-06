import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InputType from "../Form/InputType";
import API from "../../../services/API";

const Modal = () => {
  const { user } = useSelector((state) => state.auth);
  const isDonor = user?.role === 'donor';
  const isOrganisation = user?.role === 'organisation';

  const [inventoryType, setInventoryType] = useState(isDonor ? "in" : "out");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
  const [quantity, setQuantity] = useState(0);
  const [email, setEmail] = useState(user?.email || "");
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  // donor profile fields
  const [fullName, setFullName] = useState(user?.name || user?.organisationName || user?.hospitalName || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [contact, setContact] = useState(user?.phone || user?.email || "");
  const [city, setCity] = useState(user?.address || "");
  const [eligibility, setEligibility] = useState({
    over18Under65: false,
    weightOver50: false,
    notDonatedIn3Months: false,
    noMedicationOrMajorIllness: false,
    noFeverColdInfection: false,
    confirmation: false,
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        if (isDonor) {
          const { data } = await API.get('/api/inventory/all-organisations');
          if (data?.success) {
            setOrgs(data.organisations || []);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchOrgs();
  }, [isDonor]);

  useEffect(() => {
    // pick up preselected org from triggering button attribute
    const handler = (e) => {
      const btn = e.relatedTarget;
      if (btn && btn.getAttribute) {
        const id = btn.getAttribute('data-orgid');
        if (id) setSelectedOrgId(id);
        if (!isDonor) {
          const hospitalEmail = btn.getAttribute('data-hospitalemail');
          const hospitalId = btn.getAttribute('data-hospitalid');
          if (hospitalEmail) setEmail(hospitalEmail);
          if (hospitalId) setSelectedHospitalId(hospitalId);
          setInventoryType('out');
        }
      }
    };
    const el = document.getElementById('staticBackdrop');
    if (el) {
      el.addEventListener('show.bs.modal', handler);
    }
    return () => {
      if (el) el.removeEventListener('show.bs.modal', handler);
    };
  }, []);

  useEffect(() => {
    if (isDonor && selectedOrgId) {
      const found = orgs.find(o => o._id === selectedOrgId);
      if (found) setEmail(found.email);
    }
  }, [selectedOrgId, isDonor, orgs]);

  // handle modal data
  const handleModalSubmit = async () => {
    try {
      if (isDonor && !bloodGroup) return alert("Blood group is required");
      if (!isDonor && !bloodGroup) return alert("Please select a blood group");
      if (isDonor) {
        if (!selectedOrgId || !email) return alert("Please select an organisation");
      } else {
        if (!quantity || Number(quantity) <= 0) return alert("Please provide a valid quantity");
      }

      const payload = {
        email,
        inventoryType: isDonor ? 'in' : inventoryType,
        bloodGroup,
        quantity,
      };

      if (isDonor) {
        // donors do not specify quantity; backend auto-assigns by weight
        delete payload.quantity;
        payload.donorDetails = {
          fullName,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          bloodGroup: bloodGroup,
          contact,
          city,
          eligibility,
        };
      }

      // Only organisations attach their own id for organisation-owned inventory
      if (isOrganisation) {
        payload.organisation = user?._id;
      }

      if (!isDonor && inventoryType === 'out' && selectedHospitalId) {
        payload.hospitalId = selectedHospitalId;
      }
      const { data } = await API.post("/api/inventory/create-inventory", payload);
      if (data?.success) {
        alert("New Record Created");
        window.location.reload();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to submit');
      console.log(error);
      window.location.reload();
    }
  };

  // Redirect donor to organisations page when "Donate Blood Now" is clicked
  const handleDonateBloodNow = () => {
    if (isDonor) {
      window.location.href = '/organisations';
    }
  };

  return (
    <>
      {/* Modal */}
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                {isDonor ? 'Donate Blood' : 'Manage Blood Record'}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              {!isDonor && (
                <input type="hidden" value={inventoryType} readOnly />
              )}
              {isDonor ? (
                <div className="mb-4">
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bloodGroup}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                  <small className="text-muted">Your blood group is automatically filled from your profile</small>
                </div>
              ) : (
                <select
                  className="form-select mb-4"
                  aria-label="Default select example"
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option defaultValue={"Open this select menu"}>
                    Select Blood Group
                  </option>
                  <option value={"O+"}>O+</option>
                  <option value={"O-"}>O-</option>
                  <option value={"AB+"}>AB+</option>
                  <option value={"AB-"}>AB-</option>
                  <option value={"A+"}>A+</option>
                  <option value={"A-"}>A-</option>
                  <option value={"B+"}>B+</option>
                  <option value={"B-"}>B-</option>
                </select>
              )}

              {isDonor && (
                <>
                  <label className="form-label">Select Organisation</label>
                  <select className="form-select mb-3" value={selectedOrgId} onChange={(e)=>setSelectedOrgId(e.target.value)}>
                    <option value="">Choose organisation</option>
                    {orgs.map(o => (
                      <option key={o._id} value={o._id}>{o.organisationName || o.email}</option>
                    ))}
                  </select>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <InputType labelText={"Full Name"} labelForm={"fullName"} inputType={"text"} value={fullName} onChange={(e)=>setFullName(e.target.value)} />
                    </div>
                    <div className="col-md-3 mb-2">
                      <InputType labelText={"Age"} labelForm={"age"} inputType={"number"} value={age} onChange={(e)=>setAge(e.target.value)} />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={gender} onChange={(e)=>setGender(e.target.value)}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-2">
                      <InputType labelText={"Contact Number / Email"} labelForm={"contact"} inputType={"text"} value={contact} onChange={(e)=>setContact(e.target.value)} />
                    </div>
                    <div className="col-md-6 mb-2">
                      <InputType labelText={"City"} labelForm={"city"} inputType={"text"} value={city} onChange={(e)=>setCity(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h6>Health & Eligibility Checklist</h6>
                    {[
                      ['over18Under65','I am above 18 years and below 65 years.'],
                      ['weightOver50','My weight is more than 50 kg.'],
                      ['notDonatedIn3Months','I have not donated blood in the last 3 months.'],
                      ['noMedicationOrMajorIllness','I am not under medication or suffering from any major illness.'],
                      ['noFeverColdInfection','I do not have fever, cold, or infectious diseases today.'],
                      ['confirmation','I confirm that the above details are true, and I am voluntarily donating blood.'],
                    ].map(([key,label]) => (
                      <div className="form-check" key={key}>
                        <input className="form-check-input" type="checkbox" id={key} checked={!!eligibility[key]} onChange={(e)=>setEligibility({ ...eligibility, [key]: e.target.checked })} />
                        <label className="form-check-label" htmlFor={key}>{label}</label>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <InputType
                labelText={isDonor ? "Organisation Email" : "Email"}
                labelForm={"donorEmail"}
                inputType={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={isDonor}
              />
              {!isDonor && (
                <InputType
                  labelText={"Quantity (ML)"}
                  labelForm={"quantity"}
                  inputType={"number"}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {isDonor ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDonateBloodNow}
                >
                  Browse Organisations
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleModalSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;