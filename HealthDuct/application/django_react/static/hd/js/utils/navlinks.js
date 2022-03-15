const absolute = {
    root: () => "/",
    login: () => "/login",
    signup: () => "/signup",
    provider: urlID => `/provider?id=${urlID}`,
    institution: urlID => `/institution?id=${urlID}`,
    patient: urlID => `/patient?id=${urlID}`,
    patientList: () => "/patients"
}

const pattern = {
    provider: () => "/provider",
    institution: () => "/institution",
    patient: () => "/patient"
}

const navs = {
    navlink: {
        to: absolute
    },
    pattern: {
        for: pattern
    }
}

export default navs;