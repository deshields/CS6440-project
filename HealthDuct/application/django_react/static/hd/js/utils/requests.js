import Cookies from "js-cookie"

const _fetch = (url, options) => {
    return window.fetch(url, options).then(resp => {
        if(!resp.ok){
            throw Error(resp.statusText)
        }

        return resp
    })
}

const fetchJSON = (url, option) => {
    return _fetch(url, options).then(resp => resp.json())
}

const postJSON = (url, data, options={}) => {
    let csrftoken = Cookies.get("csrftoken")

    const defaultOptions = {
        credentials: "include",
        method: "POST", 
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify(data)
    }

    const allOptions = { ...defaultOptions, ...options}

    return _fetch(url, allOptions)
}

export {
    fetchJSON,
    postJSON
}