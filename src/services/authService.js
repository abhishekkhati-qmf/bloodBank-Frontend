import { userLogin, userRegister } from "../redux/features/auth/authActions";
import store from "../redux/store";

export const handleLogin = (e, email, password, role) => {
  e.preventDefault();
  try {
    if(!role || !email || !password){
        return alert("Please Provide All Fields")
    }
    store.dispatch(userLogin({email, password, role}));
  } catch (error) {
    console.log("Error in login: ", error);
  }
};
export const handleRegister = (
  e,
  name,
  role,
  email,
  password,
  organisationName,
  hospitalName,
  website,
  address,
  city,
  phone,
  age,
  gender,
  weight,
  bloodGroup
) => {
  e.preventDefault();
  try {
    if (role === 'donor') {
      if (!age || Number(age) < 18) {
        alert('Donors must be at least 18 years old');
        return;
      }
      if (!bloodGroup) {
        alert('Blood group is required for donors');
        return;
      }
    }
    store.dispatch(userRegister(
      {name,
      role,
      email,
      password,
      organisationName,
      hospitalName,
      website,
      address,
      city,
      phone,
      age: age ? Number(age) : undefined,
      gender: gender || undefined,
      weight: weight ? Number(weight) : undefined,
      bloodGroup: bloodGroup || undefined,
      }
    ))
  } catch (summary) {
    console.log("Error in Register: ", summary);
  }
};
